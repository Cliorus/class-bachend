using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnnouncementsController(AppDbContext db)
    {
        _db = db;
    }

    public class CreateAnnouncementRequest
    {
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public string Type { get; set; } = "notice"; // "notice" 或 "homework"
        public string Author { get; set; } = "";
        public DateTime? Deadline { get; set; }
    }

    // GET /api/announcements
    [HttpGet]
    public async Task<IActionResult> GetAnnouncements()
    {
        var announcements = await _db.Announcements
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                id = a.Id,
                title = a.Title,
                content = a.Content,
                type = a.Type,
                author = a.Author,
                createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                deadline = a.Deadline.HasValue ? a.Deadline.Value.ToString("yyyy-MM-dd HH:mm") : null
            })
            .ToListAsync();

        return Ok(announcements);
    }

    // POST /api/announcements
    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { message = "标题和内容不能为空" });

        if (string.IsNullOrWhiteSpace(req.Author))
            return BadRequest(new { message = "请先登录" });

        var announcement = new Announcement
        {
            Title = req.Title,
            Content = req.Content,
            Type = req.Type == "homework" ? "homework" : "notice",
            Author = req.Author,
            Deadline = req.Deadline,
            CreatedAt = DateTime.UtcNow
        };

        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "发布成功！",
            data = new
            {
                id = announcement.Id,
                title = announcement.Title,
                content = announcement.Content,
                type = announcement.Type,
                author = announcement.Author,
                createdAt = announcement.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                deadline = announcement.Deadline.HasValue ? announcement.Deadline.Value.ToString("yyyy-MM-dd HH:mm") : null
            }
        });
    }

    // DELETE /api/announcements/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        var announcement = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id);
        if (announcement == null)
            return BadRequest(new { message = "公告不存在" });

        _db.Announcements.Remove(announcement);
        await _db.SaveChangesAsync();

        return Ok(new { message = "删除成功" });
    }
}