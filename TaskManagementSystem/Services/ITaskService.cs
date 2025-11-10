using TaskManagementSystem.DTO;
using TaskManagementSystem.Models;
using TaskStatus = TaskManagementSystem.Models.TaskStatus;
using TaskModel = TaskManagementSystem.Models.Task;

namespace TaskManagementSystem.Services;

public interface ITaskService
{
    System.Threading.Tasks.Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId);
    System.Threading.Tasks.Task<IEnumerable<TaskDto>> GetTasksAsync(TaskStatus? status = null);
    System.Threading.Tasks.Task<TaskDto?> GetTaskByIdAsync(int id);
    System.Threading.Tasks.Task<TaskDto> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto, int userId);
    System.Threading.Tasks.Task DeleteTaskAsync(int id, int userId);
}

