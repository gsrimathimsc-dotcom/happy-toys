using HappyToys.Domain.Common;

namespace HappyToys.Domain.Entities;

public class Role
{
    public const string Customer = "Customer";
    public const string Admin = "Admin";

    public const int CustomerId = 1;
    public const int AdminId = 2;

    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class User : AuditableEntity
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";

    /// <summary>Always stored in lower case so logins are not case sensitive.</summary>
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Mobile { get; set; } = "";
    public int RoleId { get; set; } = Role.CustomerId;
    public Role? Role { get; set; }
    public List<UserAddress> Addresses { get; set; } = [];
}

public class UserAddress : AuditableEntity
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PinCode { get; set; } = "";
    public bool IsDefault { get; set; }
}

/// <summary>A login session. Temporary: JWT login replaces this table in Step 2.</summary>
public class UserSession
{
    public string Token { get; set; } = "";
    public string UserId { get; set; } = "";
    public User? User { get; set; }
    public DateTime ExpiresAt { get; set; }
}
