using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using TaskManagementSystem.DTO;
using TaskManagementSystem.Models;
using TaskManagementSystem.Services;
using TaskStatus = TaskManagementSystem.Models.TaskStatus;

namespace TaskManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks([FromQuery] TaskStatus? status)
    {
        var tasks = await _taskService.GetTasksAsync(status);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CreateTaskAsync(createTaskDto, userId);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(int id, [FromBody] JsonElement jsonBody)
    {
        try
        {
            var userId = GetCurrentUserId();
            
            // Читаем сырой JSON для проверки наличия поля
            var jsonText = jsonBody.GetRawText();
            
            // Проверяем, присутствует ли поле assignedToUserId в JSON (даже если оно null)
            // Проверяем оба варианта: camelCase и PascalCase
            var assignedToUserIdSpecified = jsonText.Contains("\"assignedToUserId\"", StringComparison.OrdinalIgnoreCase)
                || jsonText.Contains("\"AssignedToUserId\"", StringComparison.OrdinalIgnoreCase);
            
            // Десериализуем DTO из JSON
            var jsonOptions = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true
            };
            
            var updateTaskDto = JsonSerializer.Deserialize<UpdateTaskDto>(jsonText, jsonOptions);
            
            if (updateTaskDto == null)
            {
                return BadRequest(new { message = "Invalid request body" });
            }
            
            var task = await _taskService.UpdateTaskAsync(id, updateTaskDto, userId, assignedToUserIdSpecified);
            return Ok(task);
        }
        catch (JsonException ex)
        {
            return BadRequest(new { message = $"Invalid JSON: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _taskService.DeleteTaskAsync(id, userId);
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
}

