using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data;
using TaskManagementSystem.DTO;
using TaskManagementSystem.Hubs;
using TaskManagementSystem.Models;
using TaskModel = TaskManagementSystem.Models.Task;

namespace TaskManagementSystem.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async System.Threading.Tasks.Task<NotificationDto> CreateNotificationAsync(int userId, int taskId, string message)
    {
        var notification = new Notification
        {
            UserId = userId,
            TaskId = taskId,
            Message = message
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _context.Entry(notification)
            .Reference(n => n.Task)
            .LoadAsync();

        var notificationDto = MapToDto(notification);

        // Отправка через WebSocket
        await _hubContext.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", notificationDto);

        return notificationDto;
    }

    public async System.Threading.Tasks.Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Include(n => n.Task)
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return notifications.Select(MapToDto);
    }

    public async System.Threading.Tasks.Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            TaskId = notification.TaskId,
            TaskTitle = notification.Task?.Title ?? string.Empty,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}

