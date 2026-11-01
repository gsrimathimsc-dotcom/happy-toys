namespace HappyToys.API.Models;

public enum UserRole
{
    Customer,
    Admin,
}

public class User
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";

    /// <summary>Always stored in lower case so logins are not case sensitive.</summary>
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.Customer;
    public string Mobile { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PinCode { get; set; } = "";
    public DateTime CreatedDate { get; set; }
}

/// <summary>A demo login session. The token is sent as "Authorization: Bearer ...".</summary>
public class UserSession
{
    public string Token { get; set; } = "";
    public string UserId { get; set; } = "";
    public User? User { get; set; }
    public DateTime ExpiresAt { get; set; }
}
