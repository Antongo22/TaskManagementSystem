using TaskManagementSystem.DTO;

namespace TaskManagementSystem.Services;

public interface INotificationService
{
    System.Threading.Tasks.Task<NotificationDto> CreateNotificationAsync(int userId, int taskId, string message);
    System.Threading.Tasks.Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId);
    System.Threading.Tasks.Task MarkAsReadAsync(int notificationId, int userId);
}

