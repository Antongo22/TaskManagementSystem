using System.Security.Claims;

namespace TaskManagementSystem.Services;

public interface IJwtService
{
    string GenerateAccessToken(int userId, string username);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

