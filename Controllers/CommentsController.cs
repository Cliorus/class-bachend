using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CommentsController(AppDbContext db)
    {
        _db = db;
    }

    public class CreateCommentRequest
    {
        public string Username { get; set; } = "";
        public int MessageId { get; set; }
        public string Content { get; set; } = "";
    }

    // GET /api/comments?messageId=xxx
    [HttpGet]
    public async Task<IActionResult> GetComments([FromQuery] int messageId)
    {
        var comments = await _db.Comments
            .Where(c => c.MessageId == messageId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                id = c.Id,
                username = c.Username,
                content = c.Content,
                createdAt = c.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST /api/comments
    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { message = "请先登录" });

        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "评论内容不能为空" });

        if (req.Content.Length > 500)
            return BadRequest(new { message = "评论内容不能超过500字" });

        var comment = new Comment
        {
            Username = req.Username,
            MessageId = req.MessageId,
            Content = req.Content,
            CreatedAt = DateTime.UtcNow
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "评论成功！",
            data = new
            {
                id = comment.Id,
                username = comment.Username,
                content = comment.Content,
                createdAt = comment.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            }
        });
    }
}