using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassBackend.Data;
using ClassBackend.Models;

namespace ClassBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    public class RegisterRequest
    {
        public string StudentId { get; set; } = "";
        public string Username { get; set; } = "";
        public string Code { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    // 密码强度验证
    private static bool ValidatePassword(string password, out string errorMessage)
    {
        errorMessage = "";
        if (password.Length < 8)
        {
            errorMessage = "密码至少需要8位";
            return false;
        }
        if (!password.Any(char.IsUpper))
        {
            errorMessage = "密码需要包含大写字母";
            return false;
        }
        if (!password.Any(char.IsLower))
        {
            errorMessage = "密码需要包含小写字母";
            return false;
        }
        if (!password.Any(char.IsDigit))
        {
            errorMessage = "密码需要包含数字";
            return false;
        }
        return true;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        // 验证必填字段
        if (string.IsNullOrWhiteSpace(req.StudentId) || string.IsNullOrWhiteSpace(req.Username) || 
            string.IsNullOrWhiteSpace(req.Code) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "学号、用户名、识别码和密码不能为空" });

        // 密码强度验证
        if (!ValidatePassword(req.Password, out string pwdError))
            return BadRequest(new { message = pwdError });

        // 验证学号和识别码匹配（用户名可以自由选择）
        var rosterEntry = await _db.StudentRosters.FirstOrDefaultAsync(r => 
            r.StudentId == req.StudentId && r.Code == req.Code);
        
        if (rosterEntry == null)
            return BadRequest(new { message = "学号或识别码不正确" });

        // 检查是否已注册
        var exists = await _db.Users.AnyAsync(u => u.Username == req.Username);
        if (exists)
            return BadRequest(new { message = "该用户名已被注册" });

        // 确定角色
        string role;
        if (rosterEntry.IsTeacher)
            role = "teacher";
        else if (rosterEntry.IsClassLeader)
            role = "classleader";
        else
            role = "student";

        var user = new User
        {
            Username = req.Username,
            Password = req.Password,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "注册成功！请登录" });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "用户名和密码不能为空" });

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == null)
            return BadRequest(new { message = "用户名或密码错误" });

        return Ok(new
        {
            message = "登录成功",
            user = new
            {
                id = user.Id,
                username = user.Username,
                role = user.Role,
                isMuted = user.IsMuted,
                createdAt = user.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            }
        });
    }
}