namespace HappyToys.Domain.Enums;

public enum OrderStatus
{
    Confirmed,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
}

public enum PaymentMethod
{
    Cod,
    Upi,
    Card,
}

public enum PaymentStatus
{
    /// <summary>Cash on delivery: nothing has been collected yet.</summary>
    Pending,

    /// <summary>Online demo payment. No real money moved.</summary>
    Simulated,
    Refunded,
}

public enum InventoryReason
{
    InitialStock,
    Sale,
    OrderCancelled,
    AdminAdjustment,
}

public enum ReviewStatus
{
    Pending,
    Approved,
    Rejected,
}

public enum CouponType
{
    Percentage,
    FixedAmount,
}
