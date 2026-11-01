namespace HappyToys.API.Models;

public class Product
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
    public string ImageUrl { get; set; } = "";
    public int StockQuantity { get; set; }

    /// <summary>Deleted products are hidden, not erased, so old orders still make sense.</summary>
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; }
    public string AgeGroup { get; set; } = "";
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; }
    public Dictionary<string, string> Specifications { get; set; } = [];
}
