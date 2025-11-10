using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data;
using TaskManagementSystem.DTO;
using TaskManagementSystem.Models;
using TaskStatus = TaskManagementSystem.Models.TaskStatus;
using TaskModel = TaskManagementSystem.Models.Task;

namespace TaskManagementSystem.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public TaskService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async System.Threading.Tasks.Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId)
    {
        var task = new TaskModel
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            CreatedByUserId = userId,
            AssignedToUserId = createTaskDto.AssignedToUserId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _context.Entry(task)
            .Reference(t => t.CreatedByUser)
            .LoadAsync();

        if (task.AssignedToUserId.HasValue)
        {
            await _context.Entry(task)
                .Reference(t => t.AssignedToUser)
                .LoadAsync();

            await _notificationService.CreateNotificationAsync(
                task.AssignedToUserId.Value,
                task.Id,
                $"Вам назначена новая задача: {task.Title}");
        }

        return MapToDto(task);
    }

    public async System.Threading.Tasks.Task<IEnumerable<TaskDto>> GetTasksAsync(TaskStatus? status = null)
    {
        var query = _context.Tasks
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return tasks.Select(MapToDto);
    }

    public async System.Threading.Tasks.Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        return task == null ? null : MapToDto(task);
    }

    public async System.Threading.Tasks.Task<TaskDto> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto, int userId)
    {
        var task = await _context.Tasks
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            throw new Exception("Task not found");
        }

        var previousAssignedUserId = task.AssignedToUserId;
        var previousStatus = task.Status;

        if (updateTaskDto.Title != null)
            task.Title = updateTaskDto.Title;
        if (updateTaskDto.Description != null)
            task.Description = updateTaskDto.Description;
        if (updateTaskDto.Status.HasValue)
            task.Status = updateTaskDto.Status.Value;
        if (updateTaskDto.AssignedToUserId.HasValue)
            task.AssignedToUserId = updateTaskDto.AssignedToUserId;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(task)
            .Reference(t => t.CreatedByUser)
            .LoadAsync();

        if (task.AssignedToUserId.HasValue)
        {
            await _context.Entry(task)
                .Reference(t => t.AssignedToUser)
                .LoadAsync();

            // Уведомление при назначении новой задачи
            if (previousAssignedUserId != task.AssignedToUserId)
            {
                await _notificationService.CreateNotificationAsync(
                    task.AssignedToUserId.Value,
                    task.Id,
                    $"Вам назначена задача: {task.Title}");
            }
            // Уведомление при изменении статуса
            else if (previousStatus != task.Status && task.AssignedToUserId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(
                    task.AssignedToUserId.Value,
                    task.Id,
                    $"Статус задачи '{task.Title}' изменен на: {task.Status}");
            }
        }

        return MapToDto(task);
    }

    public async System.Threading.Tasks.Task DeleteTaskAsync(int id, int userId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            throw new Exception("Task not found");
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }

    private static TaskDto MapToDto(TaskModel task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CreatedByUserId = task.CreatedByUserId,
            CreatedByUsername = task.CreatedByUser?.Username ?? string.Empty,
            AssignedToUserId = task.AssignedToUserId,
            AssignedToUsername = task.AssignedToUser?.Username
        };
    }
}

