using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = "";

    [Required]
    [MaxLength(200)]
    public string Message { get; set; } = "";

    [MaxLength(50)]
    public string Type { get; set; } = ""; // "mute", "message_deleted"

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}