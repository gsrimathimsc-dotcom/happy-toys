using HappyToys.Application.DTOs;

namespace HappyToys.Application.Services;

/// <summary>The store's pricing rules, kept in one place so all totals match.</summary>
public static class Pricing
{
    public const decimal FreeDeliveryThreshold = 999;
    public const decimal DeliveryFee = 49;

    public static CartTotalsDto CalculateTotals(IReadOnlyCollection<(decimal Price, decimal OriginalPrice, int Quantity)> lines)
    {
        var itemCount = lines.Sum(l => l.Quantity);
        var subtotal = lines.Sum(l => l.OriginalPrice * l.Quantity);
        var sellingTotal = lines.Sum(l => l.Price * l.Quantity);
        var deliveryFee = itemCount == 0 || sellingTotal >= FreeDeliveryThreshold ? 0 : DeliveryFee;

        return new CartTotalsDto(itemCount, subtotal, subtotal - sellingTotal, deliveryFee, sellingTotal + deliveryFee);
    }

    /// <summary>The discount shown on a product, always worked out from its prices.</summary>
    public static int CalculateDiscountPercentage(decimal price, decimal originalPrice) =>
        originalPrice <= 0 ? 0 : (int)Math.Round((1 - price / originalPrice) * 100, MidpointRounding.AwayFromZero);
}
