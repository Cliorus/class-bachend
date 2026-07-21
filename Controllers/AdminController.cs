using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    public class AdminRequest
    {
        public string AdminUsername { get; set; } = "";
        public string TargetUsername { get; set; } = "";
    }

    public class DeleteMessageRequest
    {
        public string AdminUsername { get; set; } = "";
        public int MessageId { get; set; }
    }

    // 检查是否有管理员权限（教师或班委）
    private async Task<bool> IsAdmin(string username)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        return user != null && (user.Role == "teacher" || user.Role == "classleader");
    }

    // 创建通知
    private async Task CreateNotification(string username, string message, string type)
    {
        var notification = new Notification
        {
            Username = username,
            Message = message,
            Type = type,
            CreatedAt = DateTime.UtcNow
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
    }

    // ===== 禁言用户 =====
    [HttpPost("mute")]
    public async Task<IActionResult> MuteUser([FromBody] AdminRequest req)
    {
        if (!await IsAdmin(req.AdminUsername))
            return BadRequest(new { message = "无权限：需要教师或班委账号" });

        var target = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.TargetUsername);
        if (target == null)
            return BadRequest(new { message = "目标用户不存在" });

        if (target.Role == "teacher")
            return BadRequest(new { message = "不能禁言教师" });

        target.IsMuted = true;
        await _db.SaveChangesAsync();

        // 创建通知
        await CreateNotification(target.Username, "你已被管理员禁言，暂时无法发布留言", "mute");

        return Ok(new { message = "已禁言用户：" + target.Username });
    }

    // ===== 解除禁言 =====
    [HttpPost("unmute")]
    public async Task<IActionResult> UnmuteUser([FromBody] AdminRequest req)
    {
        if (!await IsAdmin(req.AdminUsername))
            return BadRequest(new { message = "无权限：需要教师或班委账号" });

        var target = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.TargetUsername);
        if (target == null)
            return BadRequest(new { message = "目标用户不存在" });

        target.IsMuted = false;
        await _db.SaveChangesAsync();

        // 创建通知
        await CreateNotification(target.Username, "你的禁言已被解除，现在可以正常发布留言", "mute");

        return Ok(new { message = "已解除禁言：" + target.Username });
    }

    // ===== 删除留言 =====
    [HttpPost("deletemessage")]
    public async Task<IActionResult> DeleteMessage([FromBody] DeleteMessageRequest req)
    {
        if (!await IsAdmin(req.AdminUsername))
            return BadRequest(new { message = "无权限：需要教师或班委账号" });

        var message = await _db.Messages.FirstOrDefaultAsync(m => m.Id == req.MessageId);
        if (message == null)
            return BadRequest(new { message = "留言不存在" });

        message.IsDeleted = true;
        await _db.SaveChangesAsync();

        // 创建通知
        await CreateNotification(message.Username, "你的留言已被管理员删除", "message_deleted");

        return Ok(new { message = "留言已删除" });
    }

    // ===== 授予班委权限 =====
    [HttpPost("setclassleader")]
    public async Task<IActionResult> SetClassLeader([FromBody] AdminRequest req)
    {
        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.AdminUsername);
        if (admin == null || admin.Role != "teacher")
            return BadRequest(new { message = "无权限：只有教师可以授予班委权限" });

        var target = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.TargetUsername);
        if (target == null)
            return BadRequest(new { message = "目标用户不存在" });

        if (target.Role == "teacher")
            return BadRequest(new { message = "不能修改教师的角色" });

        target.Role = "classleader";
        await _db.SaveChangesAsync();

        // 创建通知
        await CreateNotification(target.Username, "你已被授予班委权限", "mute");

        return Ok(new { message = "已授予班委权限：" + target.Username });
    }

    // ===== 撤销班委权限 =====
    [HttpPost("removeclassleader")]
    public async Task<IActionResult> RemoveClassLeader([FromBody] AdminRequest req)
    {
        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.AdminUsername);
        if (admin == null || admin.Role != "teacher")
            return BadRequest(new { message = "无权限：只有教师可以撤销班委权限" });

        var target = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.TargetUsername);
        if (target == null)
            return BadRequest(new { message = "目标用户不存在" });

        target.Role = "student";
        await _db.SaveChangesAsync();

        // 创建通知
        await CreateNotification(target.Username, "你的班委权限已被撤销", "mute");

        return Ok(new { message = "已撤销班委权限：" + target.Username });
    }

    // ===== 获取用户列表 =====
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string adminUsername)
    {
        if (!await IsAdmin(adminUsername))
            return BadRequest(new { message = "无权限" });

        var users = await _db.Users
            .OrderBy(u => u.CreatedAt)
            .Select(u => new
            {
                id = u.Id,
                username = u.Username,
                role = u.Role,
                isMuted = u.IsMuted,
                createdAt = u.CreatedAt.ToString("yyyy-MM-dd")
            })
            .ToListAsync();

        return Ok(users);
    }
}