using TaskManagementSystem.Models;
using TaskStatus = TaskManagementSystem.Models.TaskStatus;

namespace TaskManagementSystem.DTO;

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskStatus? Status { get; set; }
    public int? AssignedToUserId { get; set; }
}
