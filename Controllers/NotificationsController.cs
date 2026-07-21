using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/notifications?username=xxx
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] string username)
    {
        if (string.IsNullOrEmpty(username))
            return BadRequest(new { message = "请提供用户名" });

        var notifications = await _db.Notifications
            .Where(n => n.Username == username)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                id = n.Id,
                message = n.Message,
                type = n.Type,
                isRead = n.IsRead,
                createdAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            })
            .ToListAsync();

        return Ok(notifications);
    }

    // POST /api/notifications/read
    public class ReadRequest
    {
        public string Username { get; set; } = "";
        public int NotificationId { get; set; }
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkAsRead([FromBody] ReadRequest req)
    {
        if (string.IsNullOrEmpty(req.Username))
            return BadRequest(new { message = "请提供用户名" });

        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == req.NotificationId && n.Username == req.Username);

        if (notification == null)
            return BadRequest(new { message = "通知不存在" });

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "已标记为已读" });
    }

    // POST /api/notifications/delete
    [HttpPost("delete")]
    public async Task<IActionResult> DeleteNotification([FromBody] ReadRequest req)
    {
        if (string.IsNullOrEmpty(req.Username))
            return BadRequest(new { message = "请提供用户名" });

        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == req.NotificationId && n.Username == req.Username);

        if (notification == null)
            return BadRequest(new { message = "通知不存在" });

        _db.Notifications.Remove(notification);
        await _db.SaveChangesAsync();

        return Ok(new { message = "通知已删除" });
    }

    // GET /api/notifications/unread-count?username=xxx
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount([FromQuery] string username)
    {
        if (string.IsNullOrEmpty(username))
            return BadRequest(new { message = "请提供用户名" });

        var count = await _db.Notifications
            .CountAsync(n => n.Username == username && !n.IsRead);

        return Ok(new { count = count });
    }
}