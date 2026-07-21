using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MessagesController(AppDbContext db)
    {
        _db = db;
    }

    public class CreateMessageRequest
    {
        public string Username { get; set; } = "";
        public string Content { get; set; } = "";
        public bool IsAnonymous { get; set; } = false;
    }

    public class MessageDto
    {
        public int id { get; set; }
        public string name { get; set; } = "";
        public string content { get; set; } = "";
        public bool isAnonymous { get; set; }
        public string time { get; set; } = "";
        public string? image { get; set; }
    }

    // GET /api/messages
    [HttpGet]
    public async Task<IActionResult> GetMessages()
    {
        var messages = await _db.Messages
            .Where(m => !m.IsDeleted)  // 软删除的留言不显示
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        // 转换为 DTO 并加载图片
        var result = new List<MessageDto>();
        foreach (var msg in messages)
        {
            var image = await _db.Uploads
                .Where(u => u.RelatedType == "message" && u.RelatedId == msg.Id && u.FileType == "image")
                .Select(u => u.FileData)
                .FirstOrDefaultAsync();

            result.Add(new MessageDto
            {
                id = msg.Id,
                name = msg.Username,
                content = msg.Content,
                isAnonymous = msg.IsAnonymous,
                time = msg.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                image = image
            });
        }

        return Ok(result);
    }

    // POST /api/messages
    [HttpPost]
    public async Task<IActionResult> CreateMessage([FromBody] CreateMessageRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { message = "请先登录" });

        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "留言内容不能为空" });

        if (req.Content.Length > 500)
            return BadRequest(new { message = "留言内容不能超过500字" });

        // 检查是否被禁言
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user == null)
            return BadRequest(new { message = "用户不存在" });

        if (user.IsMuted)
            return BadRequest(new { message = "你已被禁言，无法发布留言" });

        var message = new Message
        {
            Username = req.Username,
            Content = req.Content,
            IsAnonymous = req.IsAnonymous,
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "留言发布成功！",
            data = new
            {
                id = message.Id,
                name = message.Username,
                content = message.Content,
                isAnonymous = message.IsAnonymous,
                time = message.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            }
        });
    }
}