using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly AppDbContext _db;

    public UploadsController(AppDbContext db)
    {
        _db = db;
    }

    public class UploadRequest
    {
        public string FileName { get; set; } = "";
        public string FileType { get; set; } = "";
        public string FileData { get; set; } = "";
        public string Username { get; set; } = "";
        public string RelatedType { get; set; } = "";
        public int RelatedId { get; set; }
    }

    // POST /api/uploads
    [HttpPost]
    public async Task<IActionResult> Upload([FromBody] UploadRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FileName) || string.IsNullOrWhiteSpace(req.FileData))
            return BadRequest(new { message = "文件数据不能为空" });

        if (string.IsNullOrWhiteSpace(req.Username))
            return BadRequest(new { message = "请先登录" });

        // 限制文件大小（Base64 编码后约 1MB）
        if (req.FileData.Length > 1400000)
            return BadRequest(new { message = "文件大小不能超过 1MB" });

        var upload = new Upload
        {
            FileName = req.FileName,
            FileType = req.FileType,
            FileData = req.FileData,
            Username = req.Username,
            RelatedType = req.RelatedType,
            RelatedId = req.RelatedId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Uploads.Add(upload);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "上传成功！",
            data = new
            {
                id = upload.Id,
                fileName = upload.FileName,
                fileType = upload.FileType,
                fileData = upload.FileData
            }
        });
    }

    // GET /api/uploads?relatedType=xxx&relatedId=xxx
    [HttpGet]
    public async Task<IActionResult> GetUploads([FromQuery] string relatedType, [FromQuery] int relatedId)
    {
        var uploads = await _db.Uploads
            .Where(u => u.RelatedType == relatedType && u.RelatedId == relatedId)
            .OrderBy(u => u.CreatedAt)
            .Select(u => new
            {
                id = u.Id,
                fileName = u.FileName,
                fileType = u.FileType,
                fileData = u.FileData,
                username = u.Username,
                createdAt = u.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            })
            .ToListAsync();

        return Ok(uploads);
    }
}