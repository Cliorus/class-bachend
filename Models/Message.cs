using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class Message
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = "";

    [Required]
    [MaxLength(500)]
    public string Content { get; set; } = "";

    public bool IsAnonymous { get; set; } = false;

    // 是否已被管理员删除（软删除）
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}