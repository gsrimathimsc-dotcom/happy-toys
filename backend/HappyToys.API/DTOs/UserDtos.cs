using System.ComponentModel.DataAnnotations;
using HappyToys.API.Models;
using HappyToys.API.Validators;

namespace HappyToys.API.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Please enter your name.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email is required.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = "";
}

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email is required.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = "";
}

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Please enter your name.")]
    public string Name { get; set; } = "";

    [RegularExpression(ValidationPatterns.IndianMobile, ErrorMessage = "A valid 10-digit mobile number is required.")]
    public string? Mobile { get; set; }

    [StringLength(300, ErrorMessage = "Address must be 300 characters or fewer.")]
    public string? Address { get; set; }

    [StringLength(100, ErrorMessage = "City must be 100 characters or fewer.")]
    public string? City { get; set; }

    [StringLength(100, ErrorMessage = "State must be 100 characters or fewer.")]
    public string? State { get; set; }

    [RegularExpression(ValidationPatterns.PinCode, ErrorMessage = "A valid 6-digit PIN code is required.")]
    public string? PinCode { get; set; }
}

public record UserProfileDto(
    string Id,
    string Name,
    string Email,
    UserRole Role,
    string Mobile,
    string Address,
    string City,
    string State,
    string PinCode);

public record AuthResultDto(string Token, DateTime ExpiresAt, UserProfileDto User);
