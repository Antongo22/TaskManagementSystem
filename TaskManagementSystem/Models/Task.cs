namespace TaskManagementSystem.Models;

public enum TaskStatus
{
    New = 0,
    InProgress = 1,
    Completed = 2
}

public class Task
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskStatus Status { get; set; } = TaskStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    
    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }
    
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

