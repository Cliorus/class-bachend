using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = "";

    [Required]
    [MaxLength(100)]
    public string Password { get; set; } = "";

    // 角色: "student" 学生, "teacher" 教师, "classleader" 班委
    [MaxLength(20)]
    public string Role { get; set; } = "student";

    // 是否被禁言
    public bool IsMuted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}