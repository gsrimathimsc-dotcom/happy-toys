namespace HappyToys.API.Validators;

/// <summary>Regular expressions shared by the request DTOs.</summary>
public static class ValidationPatterns
{
    /// <summary>10 digits starting with 6-9.</summary>
    public const string IndianMobile = @"^[6-9]\d{9}$";

    /// <summary>6 digits, not starting with 0.</summary>
    public const string PinCode = @"^[1-9]\d{5}$";
}
