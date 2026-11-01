using System.ComponentModel.DataAnnotations;
using HappyToys.API.Models;
using HappyToys.API.Validators;

namespace HappyToys.API.DTOs;

public class CustomerDetailsRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name must be 100 characters or fewer.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email is required.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Mobile number is required.")]
    [RegularExpression(ValidationPatterns.IndianMobile, ErrorMessage = "A valid 10-digit mobile number is required.")]
    public string Mobile { get; set; } = "";

    [Required(ErrorMessage = "Delivery address is required.")]
    [StringLength(300, MinimumLength = 10, ErrorMessage = "Please enter your full delivery address (at least 10 characters).")]
    public string Address { get; set; } = "";

    [Required(ErrorMessage = "City is required.")]
    public string City { get; set; } = "";

    [Required(ErrorMessage = "State is required.")]
    public string State { get; set; } = "";

    [Required(ErrorMessage = "PIN code is required.")]
    [RegularExpression(ValidationPatterns.PinCode, ErrorMessage = "A valid 6-digit PIN code is required.")]
    public string PinCode { get; set; } = "";
}

/// <summary>
/// Body of POST /api/orders. Only product ids and quantities are accepted:
/// prices always come from the server's own data.
/// </summary>
public class CreateOrderRequest : IValidatableObject
{
    [Required(ErrorMessage = "Customer details are required.")]
    public CustomerDetailsRequest? Customer { get; set; }

    [Required(ErrorMessage = "Please choose a payment method.")]
    public PaymentMethod? PaymentMethod { get; set; }

    [MaxLength(100, ErrorMessage = "An order can have at most 100 lines.")]
    public List<CartLineRequest> Items { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Items.Count == 0)
        {
            yield return new ValidationResult("Your cart is empty.", [nameof(Items)]);
        }
        if (Items.Any(item => item is null))
        {
            yield return new ValidationResult("Order lines cannot be empty.", [nameof(Items)]);
        }
    }
}

public class UpdateOrderStatusRequest
{
    [Required(ErrorMessage = "Status is required.")]
    public OrderStatus? Status { get; set; }
}

public record OrderCustomerDto(
    string Name,
    string Email,
    string Mobile,
    string Address,
    string City,
    string State,
    string PinCode);

public record OrderItemDto(
    string ProductId,
    string Name,
    string ImageUrl,
    decimal Price,
    decimal OriginalPrice,
    int Quantity);

public record OrderDto(
    string Id,
    DateTime CreatedDate,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    OrderCustomerDto Customer,
    IReadOnlyList<OrderItemDto> Items,
    CartTotalsDto Totals,
    bool CanCancel);
