using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagementSystem.Data;
using TaskManagementSystem.DTO;

namespace TaskManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public UsersController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        // Получаем всех пользователей, включая текущего
        var users = await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username
            })
            .OrderBy(u => u.Username)
            .ToListAsync();
        
        return Ok(users);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            
            // Проверка прав: только админ может удалять пользователей
            if (!IsAdmin(currentUserId))
            {
                return StatusCode(403, new { message = "Только администратор может удалять пользователей" });
            }

            // Нельзя удалить самого себя
            if (id == currentUserId)
            {
                return BadRequest(new { message = "Нельзя удалить самого себя" });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Пользователь не найден" });
            }

            // Проверяем, не является ли удаляемый пользователь админом
            if (IsAdmin(id))
            {
                return BadRequest(new { message = "Нельзя удалить администратора" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(userIdClaim?.Value ?? "0");
    }

    private bool IsAdmin(int userId)
    {
        var adminUserIdConfig = _configuration["AppSettings:AdminUserId"];
        
        // Если админ указан в конфигурации, проверяем по ID
        if (!string.IsNullOrEmpty(adminUserIdConfig) && int.TryParse(adminUserIdConfig, out var adminUserId))
        {
            return userId == adminUserId;
        }

        // Если админ не указан, первый пользователь (ID = 1) является админом
        return userId == 1;
    }
}

