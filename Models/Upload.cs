using System.ComponentModel.DataAnnotations;

namespace ClassBackend.Models;

public class Upload
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FileName { get; set; } = "";

    [Required]
    [MaxLength(50)]
    public string FileType { get; set; } = ""; // "image", "document", "other"

    [Required]
    public string FileData { get; set; } = ""; // Base64 编码的文件内容

    [MaxLength(50)]
    public string Username { get; set; } = "";

    // 关联类型: "message", "announcement"
    [MaxLength(20)]
    public string RelatedType { get; set; } = "";

    public int RelatedId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}