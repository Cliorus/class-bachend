using Microsoft.EntityFrameworkCore;
using ClassBackend.Models;

namespace ClassBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Upload> Uploads { get; set; }
    public DbSet<StudentRoster> StudentRosters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // 确保用户对同一留言只能点赞一次
        modelBuilder.Entity<Like>()
            .HasIndex(l => new { l.Username, l.MessageId })
            .IsUnique();
    }
}