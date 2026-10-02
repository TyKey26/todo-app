using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.API.Data;
using TodoApp.API.Models;

namespace TodoApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly AppDbContext _db;
    public TodosController(AppDbContext db) => _db = db;

    // GET /api/todos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItem>>> GetAll() =>
        await _db.Todos.OrderByDescending(t => t.CreatedAt).ToListAsync();

    // GET /api/todos/stats
    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var total = await _db.Todos.CountAsync();
        var done = await _db.Todos.CountAsync(t => t.Completed);
        return Ok(new
        {
            total,
            completed = done,
            active = total - done
        });
    }

    // POST /api/todos
    [HttpPost]
    public async Task<ActionResult<TodoItem>> Create([FromBody] TodoItem item)
    {
        _db.Todos.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
    }

    // DELETE /api/todos/completed  ← ВАЖНО: объявлен ДО {id}, иначе конфликт роутов
    [HttpDelete("completed")]
    public async Task<IActionResult> ClearCompleted()
    {
        var completed = await _db.Todos.Where(t => t.Completed).ToListAsync();
        if (completed.Count == 0)
            return Ok(new { deleted = 0 });

        _db.Todos.RemoveRange(completed);
        await _db.SaveChangesAsync();
        return Ok(new { deleted = completed.Count });
    }

    // PUT /api/todos/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TodoItem updated)
    {
        var item = await _db.Todos.FindAsync(id);
        if (item is null) return NotFound();

        item.Title = updated.Title;
        item.Completed = updated.Completed;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/todos/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Todos.FindAsync(id);
        if (item is null) return NotFound();

        _db.Todos.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}