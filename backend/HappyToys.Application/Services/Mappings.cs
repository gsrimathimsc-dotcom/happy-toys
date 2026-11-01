using HappyToys.Application.DTOs;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;

namespace HappyToys.Application.Services;

/// <summary>Converts database entities into the DTOs sent to the frontend.</summary>
public static class Mappings
{
    public const int LowStockLimit = 10;

    /// <summary>Needs the product's Images loaded.</summary>
    public static string MainImageUrl(this Product p) =>
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault() ?? "";

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
        p.MainImageUrl(),
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
        p.StockQuantity,
        p.StockQuantity <= 0 ? "out-of-stock" : p.StockQuantity <= LowStockLimit ? "low-stock" : "in-stock",
        p.IsActive,
        p.CreatedAt,
        p.AgeGroup,
        p.IsFeatured,
        p.IsBestSeller,
        p.IsNew,
        p.Specifications);

    public static CartLineDto ToCartLine(this Product p, int quantity) =>
        new(p.Id, p.Name, p.MainImageUrl(), p.Price, p.OriginalPrice, p.StockQuantity, quantity);

    public static CartTotalsDto ToTotals(this IEnumerable<CartLineDto> lines) =>
        Pricing.CalculateTotals(lines.Select(l => (l.Price, l.OriginalPrice, l.Quantity)).ToList());

    /// <summary>Needs the order's Items and Payment loaded.</summary>
    public static OrderDto ToDto(this Order o)
    {
        var c = o.Customer;
        return new OrderDto(
            o.Id,
            o.CreatedAt,
            o.Status,
            o.Payment?.Method ?? PaymentMethod.Cod,
            new OrderCustomerDto(c.Name, c.Email, c.Mobile, c.Address, c.City, c.State, c.PinCode),
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.ImageUrl, i.Price, i.OriginalPrice, i.Quantity)).ToList(),
            new CartTotalsDto(o.Items.Sum(i => i.Quantity), o.Subtotal, o.Discount, o.DeliveryFee, o.Total),
            OrderService.CanCustomerCancel(o.Status));
    }

    /// <summary>Needs the user's Role and Addresses loaded.</summary>
    public static UserProfileDto ToDto(this User u)
    {
        var address = u.Addresses.FirstOrDefault(a => a.IsDefault);
        return new UserProfileDto(
            u.Id,
            u.Name,
            u.Email,
            (u.Role?.Name ?? Role.Customer).ToLowerInvariant(),
            u.Mobile,
            address?.Address ?? "",
            address?.City ?? "",
            address?.State ?? "",
            address?.PinCode ?? "");
    }
}
