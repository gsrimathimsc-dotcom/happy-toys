using HappyToys.Domain.Common;
using HappyToys.Domain.Enums;

namespace HappyToys.Domain.Entities;

public class Category : AuditableEntity
{
    /// <summary>A readable id such as "soft-toys". It is also used in URLs.</summary>
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
}

public class Product : AuditableEntity
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string CategoryId { get; set; } = "";
    public Category? Category { get; set; }
    public string Brand { get; set; } = "";
    public string Description { get; set; } = "";

    /// <summary>Selling price in Indian Rupees.</summary>
    public decimal Price { get; set; }

    /// <summary>MRP (price before discount) in Indian Rupees.</summary>
    public decimal OriginalPrice { get; set; }
    public int DiscountPercentage { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int StockQuantity { get; set; }

    /// <summary>Deleted products are hidden, not erased, so old orders still make sense.</summary>
    public bool IsActive { get; set; } = true;
    public string AgeGroup { get; set; } = "";
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; }
    public Dictionary<string, string> Specifications { get; set; } = [];
    public List<ProductImage> Images { get; set; } = [];
}

public class ProductImage : AuditableEntity
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public string Url { get; set; } = "";

    /// <summary>The lowest number is the product's main image.</summary>
    public int SortOrder { get; set; }
}

public class Review : AuditableEntity
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public Product? Product { get; set; }
    public string UserId { get; set; } = "";
    public User? User { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
}

/// <summary>A permanent record of every stock change, for the inventory reports.</summary>
public class InventoryTransaction
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public Product? Product { get; set; }

    /// <summary>Positive adds stock and negative removes it.</summary>
    public int QuantityChange { get; set; }
    public InventoryReason Reason { get; set; }
    public string? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Coupon : AuditableEntity
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public CouponType Type { get; set; }
    public decimal Value { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}
