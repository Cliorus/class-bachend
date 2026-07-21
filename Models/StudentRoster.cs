namespace ClassBackend.Models;

public class StudentRoster
{
    public int Id { get; set; }
    public string StudentId { get; set; } = "";
    public string Username { get; set; } = "";
    public string Code { get; set; } = "";
    public bool IsTeacher { get; set; }
    public bool IsClassLeader { get; set; }
}