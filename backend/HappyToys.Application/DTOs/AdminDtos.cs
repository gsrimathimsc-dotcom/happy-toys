using System.ComponentModel.DataAnnotations;
using HappyToys.Domain.Enums;

namespace HappyToys.Application.DTOs;

public record BestSellingProductDto(string ProductId, string Name, string ImageUrl, int UnitsSold, decimal Revenue);

public record DailyItemDto(string ProductId, string Name, int Quantity, decimal Amount);

/// <summary>One day of sales, in Indian time. Cancelled orders are not counted.</summary>
public record DailySalesDto(DateOnly Date, int Orders, int ItemsSold, decimal Sales, IReadOnlyList<DailyItemDto> Items);

public record CouponDto(
    int Id,
    string Code,
    CouponType Type,
    decimal Value,
    decimal MinimumOrderAmount,
    bool IsActive,
    DateTime? ExpiresAt);

/// <summary>One month of sales, in Indian time. Cancelled orders are not counted.</summary>
public record MonthlySalesDto(int Year, int Month, string Label, int Orders, int ItemsSold, decimal Sales);

public record CustomerDto(string Id, string Name, string Email, string Mobile, DateTime JoinedAt, int Orders, decimal TotalSpent);

public record AdminOffersDto(IReadOnlyList<ProductDto> ProductsOnOffer, IReadOnlyList<CouponDto> Coupons);

public record AdminDashboardDto(
    int TotalProducts,
    int TotalOrders,
    int TotalCustomers,
    decimal TotalSales,
    int LowStockProducts,
    int OutOfStockProducts,
    int OpenOrders,
    int ProductsOnOffer,
    int ActiveCoupons,
    DailySalesDto Today,
    IReadOnlyList<OrderDto> RecentOrders,
    IReadOnlyList<BestSellingProductDto> BestSellingProducts,
    IReadOnlyList<DailySalesDto> SalesOverview,
    IReadOnlyList<OrderStatusCountDto> OrderStatusCounts);

public record OrderStatusCountDto(OrderStatus Status, int Count);

/// <summary>Body of POST and PUT /api/admin/coupons.</summary>
public class CouponRequest : IValidatableObject
{
    [Required(ErrorMessage = "Coupon code is required.")]
    [RegularExpression("^[A-Za-z0-9]{3,30}$", ErrorMessage = "Code must be 3 to 30 letters or numbers.")]
    public string Code { get; set; } = "";

    public CouponType Type { get; set; }

    [Range(typeof(decimal), "1", "100000", ErrorMessage = "Value must be between 1 and 1,00,000.")]
    public decimal Value { get; set; }

    [Range(typeof(decimal), "0", "1000000", ErrorMessage = "Minimum order must be between ₹0 and ₹10,00,000.")]
    public decimal MinimumOrderAmount { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Type == CouponType.Percentage && Value > 100)
        {
            yield return new ValidationResult("A percentage coupon cannot be more than 100.", [nameof(Value)]);
        }
    }
}
