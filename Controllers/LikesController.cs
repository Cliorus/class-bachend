using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LikesController : ControllerBase
{
    private readonly AppDbContext _db;

    public LikesController(AppDbContext db)
    {
        _db = db;
    }

    public class LikeRequest
    {
        public string Username { get; set; } = "";
        public int MessageId { get; set; }
    }

    // GET /api/likes?messageId=xxx
    [HttpGet]
    public async Task<IActionResult> GetLikes([FromQuery] int messageId)
    {
        var likeCount = await _db.Likes.CountAsync(l => l.MessageId == messageId);
        return Ok(new { count = likeCount });
    }

    // GET /api/likes/check?username=xxx&messageId=xxx
    [HttpGet("check")]
    public async Task<IActionResult> CheckLike([FromQuery] string username, [FromQuery] int messageId)
    {
        var hasLiked = await _db.Likes.AnyAsync(l => l.Username == username && l.MessageId == messageId);
        return Ok(new { hasLiked = hasLiked });
    }

    // POST /api/likes
    [HttpPost]
    public async Task<IActionResult> Like([FromBody] LikeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { message = "请先登录" });

        var existingLike = await _db.Likes.FirstOrDefaultAsync(l => l.Username == req.Username && l.MessageId == req.MessageId);
        if (existingLike != null)
            return BadRequest(new { message = "你已经点赞过了" });

        var like = new Like
        {
            Username = req.Username,
            MessageId = req.MessageId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Likes.Add(like);
        await _db.SaveChangesAsync();

        var count = await _db.Likes.CountAsync(l => l.MessageId == req.MessageId);
        return Ok(new { message = "点赞成功！", count = count });
    }

    // DELETE /api/likes
    [HttpDelete]
    public async Task<IActionResult> Unlike([FromBody] LikeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { message = "请先登录" });

        var like = await _db.Likes.FirstOrDefaultAsync(l => l.Username == req.Username && l.MessageId == req.MessageId);
        if (like == null)
            return BadRequest(new { message = "你还没有点赞" });

        _db.Likes.Remove(like);
        await _db.SaveChangesAsync();

        var count = await _db.Likes.CountAsync(l => l.MessageId == req.MessageId);
        return Ok(new { message = "取消点赞", count = count });
    }
}