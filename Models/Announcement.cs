using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class Announcement
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = "";

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = "";

    // 类型: "notice" 公告, "homework" 作业
    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "notice";

    [Required]
    [MaxLength(50)]
    public string Author { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? Deadline { get; set; } // 作业截止时间（可选）
}