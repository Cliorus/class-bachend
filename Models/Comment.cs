using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class Comment
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = "";

    [Required]
    public int MessageId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Content { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}