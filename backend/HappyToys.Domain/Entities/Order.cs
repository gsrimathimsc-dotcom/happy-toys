using HappyToys.Domain.Common;
using HappyToys.Domain.Enums;

namespace HappyToys.Domain.Entities;

public class Order : AuditableEntity
{
    /// <summary>The order number shown to customers, e.g. "HT-20261101-9F3A61C2".</summary>
    public string Id { get; set; } = "";

    /// <summary>Empty for guest checkouts.</summary>
    public string? UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Confirmed;
    public OrderCustomer Customer { get; set; } = new();
    public List<OrderItem> Items { get; set; } = [];
    public Payment? Payment { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
}

/// <summary>The delivery details as they were when the order was placed.</summary>
public class OrderCustomer
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Mobile { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PinCode { get; set; } = "";
}

/// <summary>
/// A copy of the product at the moment of purchase, so later price or name
/// changes never alter an existing order.
/// </summary>
public class OrderItem
{
    public int Id { get; set; }
    public string OrderId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string Name { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public int Quantity { get; set; }
}

public class Payment : AuditableEntity
{
    public int Id { get; set; }
    public string OrderId { get; set; } = "";
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
}
