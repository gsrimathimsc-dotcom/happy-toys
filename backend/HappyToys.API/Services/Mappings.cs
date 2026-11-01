using HappyToys.API.DTOs;
using HappyToys.API.Models;

namespace HappyToys.API.Services;

/// <summary>Converts database models into the DTOs sent to the frontend.</summary>
public static class Mappings
{
    public const int LowStockLimit = 10;

    public static ProductDto ToDto(this Product p) => new(
        p.Id,
        p.Name,
        p.CategoryId,
        p.Category?.Name ?? "",
        p.Brand,
        p.Description,
        p.Price,
        p.OriginalPrice,
        p.DiscountPercentage,
        p.Rating,
        p.ReviewCount,
        p.ImageUrl,
        p.StockQuantity,
        p.StockQuantity <= 0 ? "out-of-stock" : p.StockQuantity <= LowStockLimit ? "low-stock" : "in-stock",
        p.IsActive,
        p.CreatedDate,
        p.AgeGroup,
        p.IsFeatured,
        p.IsBestSeller,
        p.IsNew,
        p.Specifications);

    public static CartLineDto ToCartLine(this Product p, int quantity) =>
        new(p.Id, p.Name, p.ImageUrl, p.Price, p.OriginalPrice, p.StockQuantity, quantity);

    public static CartTotalsDto ToTotals(this IEnumerable<CartLineDto> lines) =>
        Pricing.CalculateTotals(lines.Select(l => (l.Price, l.OriginalPrice, l.Quantity)).ToList());

    public static OrderDto ToDto(this Order o)
    {
        var c = o.Customer;
        return new OrderDto(
            o.Id,
            o.CreatedDate,
            o.Status,
            o.PaymentMethod,
            new OrderCustomerDto(c.Name, c.Email, c.Mobile, c.Address, c.City, c.State, c.PinCode),
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.ImageUrl, i.Price, i.OriginalPrice, i.Quantity)).ToList(),
            new CartTotalsDto(o.Items.Sum(i => i.Quantity), o.Subtotal, o.Discount, o.DeliveryFee, o.Total),
            OrderService.CanCustomerCancel(o.Status));
    }

    public static UserProfileDto ToDto(this User u) =>
        new(u.Id, u.Name, u.Email, u.Role, u.Mobile, u.Address, u.City, u.State, u.PinCode);
}
