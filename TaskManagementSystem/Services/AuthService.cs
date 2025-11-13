using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data;
using TaskManagementSystem.DTO;
using TaskManagementSystem.Models;
using BCrypt.Net;

namespace TaskManagementSystem.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IJwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Проверка кода приглашения
        var invitationCode = _configuration["AppSettings:InvitationCode"];
        if (string.IsNullOrEmpty(invitationCode))
        {
            throw new Exception("Код приглашения не настроен в системе");
        }
        
        if (string.IsNullOrEmpty(registerDto.InvitationCode) || 
            registerDto.InvitationCode != invitationCode)
        {
            throw new Exception("Неверный код приглашения");
        }

        // Проверка на дубликаты username (регистронезависимая)
        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username.ToLower() == registerDto.Username.ToLower());
        
        if (usernameExists)
        {
            throw new Exception("Пользователь с таким именем уже существует");
        }

        // Определение админа: первый пользователь или из конфигурации
        var isFirstUser = !await _context.Users.AnyAsync();
        var adminUserIdConfig = _configuration["AppSettings:AdminUserId"];
        int? adminUserId = null;
        
        if (!string.IsNullOrEmpty(adminUserIdConfig) && int.TryParse(adminUserIdConfig, out var parsedAdminId))
        {
            adminUserId = parsedAdminId;
        }

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Если это первый пользователь и админ не указан в конфигурации, 
        // то первый пользователь автоматически становится админом
        // (логика админа может быть реализована позже через отдельное поле или сервис)

        return await GenerateTokensAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new Exception("Invalid username or password");
        }

        return await GenerateTokensAsync(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (token == null || token.ExpiresAt < DateTime.UtcNow)
        {
            throw new Exception("Invalid or expired refresh token");
        }

        _context.RefreshTokens.Remove(token);
        await _context.SaveChangesAsync();

        return await GenerateTokensAsync(token.User);
    }

    private async Task<AuthResponseDto> GenerateTokensAsync(User user)
    {
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Username);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(
            Convert.ToDouble(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60"));

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };
    }
}

