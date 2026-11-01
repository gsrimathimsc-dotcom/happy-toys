namespace HappyToys.Application.DTOs;

/// <summary>Who a cart or wishlist belongs to: a logged-in user, or otherwise a visitor.</summary>
public record Owner(string? UserId, string? GuestId);

/// <summary>Live figures for the home page, so nothing there is typed in by hand.</summary>
public record StoreSummaryDto(int ProductCount, int CategoryCount, double AverageRating, int HighestDiscount);
