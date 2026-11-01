namespace HappyToys.Domain.Common;

/// <summary>Adds created and updated times. AppDbContext fills them in automatically.</summary>
public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
