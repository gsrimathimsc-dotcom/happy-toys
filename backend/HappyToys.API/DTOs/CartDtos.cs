using System.ComponentModel.DataAnnotations;

namespace HappyToys.API.DTOs;

public record CartTotalsDto(int ItemCount, decimal Subtotal, decimal Discount, decimal DeliveryFee, decimal Total);

public record CartLineDto(
    string ProductId,
    string Name,
    string ImageUrl,
    decimal Price,
    decimal OriginalPrice,
    int StockQuantity,
    int Quantity);

public record CartDto(IReadOnlyList<CartLineDto> Items, CartTotalsDto Totals);

/// <summary>
/// Result of checking a browser-saved cart: the lines at today's prices and
/// stock, plus a plain message for anything that had to change.
/// </summary>
public record CartValidationDto(
    IReadOnlyList<CartLineDto> Items,
    CartTotalsDto Totals,
    bool IsValid,
    IReadOnlyList<string> Issues);

public class CartLineRequest
{
    [Required(ErrorMessage = "Product id is required.")]
    public string ProductId { get; set; } = "";

    [Range(1, 1000, ErrorMessage = "Quantity must be between 1 and 1000.")]
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemRequest
{
    [Range(1, 1000, ErrorMessage = "Quantity must be between 1 and 1000.")]
    public int Quantity { get; set; }
}

/// <summary>Body of POST /api/cart/validate.</summary>
public class ValidateCartRequest : IValidatableObject
{
    [MaxLength(100, ErrorMessage = "A cart can have at most 100 lines.")]
    public List<CartLineRequest> Items { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Items.Any(item => item is null))
        {
            yield return new ValidationResult("Cart lines cannot be empty.", [nameof(Items)]);
        }
    }
}

public class WishlistRequest
{
    [Required(ErrorMessage = "Product id is required.")]
    public string ProductId { get; set; } = "";
}
