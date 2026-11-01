using System.ComponentModel.DataAnnotations;

namespace HappyToys.Application.DTOs;

public record CategoryDto(string Id, string Name, string Description, int ProductCount);

public record ProductDto(
    string Id,
    string Name,
    string CategoryId,
    string CategoryName,
    string Brand,
    string Description,
    decimal Price,
    decimal OriginalPrice,
    int DiscountPercentage,
    double Rating,
    int ReviewCount,
    string ImageUrl,
    IReadOnlyList<string> ImageUrls,
    int StockQuantity,
    string StockStatus,
    bool IsActive,
    DateTime CreatedDate,
    string AgeGroup,
    bool IsFeatured,
    bool IsBestSeller,
    bool IsNew,
    Dictionary<string, string> Specifications);

public record ProductDetailsDto(ProductDto Product, IReadOnlyList<ProductDto> Related);

/// <summary>Filters for GET /api/products. All of them are optional.</summary>
public class ProductQuery : IValidatableObject
{
    public static readonly string[] SortOptions = ["popularity", "newest", "price-asc", "price-desc", "discount"];
    public static readonly string[] Collections = ["featured", "best-sellers", "new-arrivals", "offers"];

    /// <summary>A category id such as "soft-toys".</summary>
    public string? Category { get; set; }

    /// <summary>Search words. A product must match every word.</summary>
    public string? Q { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }

    [Range(0, 5, ErrorMessage = "Minimum rating must be between 0 and 5.")]
    public double? MinRating { get; set; }
    public bool? InStock { get; set; }

    /// <summary>One of: featured, best-sellers, new-arrivals, offers.</summary>
    public string? Collection { get; set; }

    /// <summary>One of: popularity, newest, price-asc, price-desc, discount.</summary>
    public string? Sort { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or higher.")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
    public int PageSize { get; set; } = 12;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (MinPrice < 0 || MaxPrice < 0)
        {
            yield return new ValidationResult("Prices cannot be negative.", [nameof(MinPrice)]);
        }
        if (MinPrice > MaxPrice)
        {
            yield return new ValidationResult("Minimum price cannot be greater than maximum price.", [nameof(MinPrice)]);
        }
        if (Sort is not null && !SortOptions.Contains(Sort))
        {
            yield return new ValidationResult($"Sort must be one of: {string.Join(", ", SortOptions)}.", [nameof(Sort)]);
        }
        if (Collection is not null && !Collections.Contains(Collection))
        {
            yield return new ValidationResult($"Collection must be one of: {string.Join(", ", Collections)}.", [nameof(Collection)]);
        }
    }
}

/// <summary>Body of PATCH /api/products/{id}/stock (admin only).</summary>
public class UpdateStockRequest
{
    [Range(0, 100000, ErrorMessage = "Stock must be between 0 and 1,00,000.")]
    public int StockQuantity { get; set; }
}

/// <summary>Body of POST and PUT /api/products (admin only).</summary>
public class ProductRequest : IValidatableObject
{
    [Required(ErrorMessage = "Product name is required.")]
    [StringLength(120, ErrorMessage = "Product name must be 120 characters or fewer.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Category is required.")]
    public string CategoryId { get; set; } = "";

    [Required(ErrorMessage = "Brand is required.")]
    [StringLength(60, ErrorMessage = "Brand must be 60 characters or fewer.")]
    public string Brand { get; set; } = "";

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description must be 2000 characters or fewer.")]
    public string Description { get; set; } = "";

    [Range(typeof(decimal), "1", "1000000", ErrorMessage = "Price must be between ₹1 and ₹10,00,000.")]
    public decimal Price { get; set; }

    [Range(typeof(decimal), "1", "1000000", ErrorMessage = "Original price must be between ₹1 and ₹10,00,000.")]
    public decimal OriginalPrice { get; set; }

    [Required(ErrorMessage = "Image URL is required.")]
    public string ImageUrl { get; set; } = "";

    [Range(0, 100000, ErrorMessage = "Stock must be between 0 and 1,00,000.")]
    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
    public string AgeGroup { get; set; } = "";
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; }
    public Dictionary<string, string> Specifications { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (OriginalPrice < Price)
        {
            yield return new ValidationResult("Original price cannot be lower than the selling price.", [nameof(OriginalPrice)]);
        }
    }
}

/// <summary>Body of POST and PUT /api/categories (admin only).</summary>
public class CategoryRequest
{
    [Required(ErrorMessage = "Category name is required.")]
    [StringLength(60, ErrorMessage = "Category name must be 60 characters or fewer.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(300, ErrorMessage = "Description must be 300 characters or fewer.")]
    public string Description { get; set; } = "";
}
