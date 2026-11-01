using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

public class ProductService(AppDbContext db) : IProductService
{
    private const int RelatedProductCount = 4;

    public async Task<PagedResult<ProductDto>> SearchAsync(ProductQuery query)
    {
        if (query.Category is not null && !await db.Categories.AnyAsync(c => c.Id == query.Category))
        {
            throw ApiException.NotFound($"Category \"{query.Category}\" was not found.");
        }

        var products = ApplySort(ApplyFilters(ActiveProducts(), query), query);

        var totalCount = await products.CountAsync();
        var items = await products
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);
        return new PagedResult<ProductDto>(
            items.Select(p => p.ToDto()).ToList(), totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<ProductDetailsDto> GetDetailsAsync(string id)
    {
        var product = await ActiveProducts().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw ApiException.NotFound($"Product \"{id}\" was not found.");

        // Same-category toys come first, then best sellers fill any empty places.
        var sameCategory = await ActiveProducts()
            .Where(p => p.CategoryId == product.CategoryId && p.Id != id)
            .OrderByDescending(p => p.ReviewCount)
            .Take(RelatedProductCount)
            .ToListAsync();
        var bestSellers = await ActiveProducts()
            .Where(p => p.CategoryId != product.CategoryId && p.IsBestSeller)
            .OrderByDescending(p => p.ReviewCount)
            .Take(RelatedProductCount)
            .ToListAsync();

        var related = sameCategory.Concat(bestSellers).Take(RelatedProductCount).Select(p => p.ToDto()).ToList();
        return new ProductDetailsDto(product.ToDto(), related);
    }

    public async Task<ProductDto> CreateAsync(ProductRequest request)
    {
        await EnsureCategoryExistsAsync(request.CategoryId);

        var product = new Product { Id = await NextIdAsync(), CreatedDate = DateTime.UtcNow };
        ApplyRequest(product, request);
        db.Products.Add(product);
        await db.SaveChangesAsync();

        return await GetAnyAsync(product.Id);
    }

    public async Task<ProductDto> UpdateAsync(string id, ProductRequest request)
    {
        await EnsureCategoryExistsAsync(request.CategoryId);

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id)
            ?? throw ApiException.NotFound($"Product \"{id}\" was not found.");
        ApplyRequest(product, request);
        await db.SaveChangesAsync();

        return await GetAnyAsync(id);
    }

    public async Task DeleteAsync(string id)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.IsActive)
            ?? throw ApiException.NotFound($"Product \"{id}\" was not found.");
        product.IsActive = false;
        await db.SaveChangesAsync();
    }

    private IQueryable<Product> ActiveProducts() =>
        db.Products.AsNoTracking().Include(p => p.Category).Where(p => p.IsActive);

    private static IQueryable<Product> ApplyFilters(IQueryable<Product> products, ProductQuery query)
    {
        if (query.Category is not null) products = products.Where(p => p.CategoryId == query.Category);
        if (query.MinPrice is not null) products = products.Where(p => p.Price >= query.MinPrice);
        if (query.MaxPrice is not null) products = products.Where(p => p.Price <= query.MaxPrice);
        if (query.MinRating is not null) products = products.Where(p => p.Rating >= query.MinRating);
        if (query.InStock == true) products = products.Where(p => p.StockQuantity > 0);

        // Every search word must match somewhere, so "soft bear" finds a soft teddy bear.
        var words = (query.Q ?? "").ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var word in words)
        {
            products = products.Where(p =>
                p.Name.ToLower().Contains(word) ||
                p.Brand.ToLower().Contains(word) ||
                p.Description.ToLower().Contains(word) ||
                p.Category!.Name.ToLower().Contains(word));
        }

        return query.Collection switch
        {
            "featured" => products.Where(p => p.IsFeatured),
            "best-sellers" => products.Where(p => p.IsBestSeller),
            "new-arrivals" => products.Where(p => p.IsNew),
            "offers" => products.Where(p => p.StockQuantity > 0 && p.DiscountPercentage > 0),
            _ => products,
        };
    }

    private static IQueryable<Product> ApplySort(IQueryable<Product> products, ProductQuery query)
    {
        var sort = query.Sort ?? query.Collection switch
        {
            "new-arrivals" => "newest",
            "offers" => "discount",
            _ => "popularity",
        };

        // Id is the tie-breaker, so pages never repeat or skip a product.
        return sort switch
        {
            "price-asc" => products.OrderBy(p => p.Price).ThenBy(p => p.Id),
            "price-desc" => products.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
            "newest" => products.OrderByDescending(p => p.CreatedDate).ThenBy(p => p.Id),
            "discount" => products.OrderByDescending(p => p.DiscountPercentage).ThenBy(p => p.Id),
            _ => products.OrderByDescending(p => p.ReviewCount).ThenBy(p => p.Id),
        };
    }

    private async Task EnsureCategoryExistsAsync(string categoryId)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == categoryId))
        {
            throw ApiException.BadRequest($"Category \"{categoryId}\" does not exist.");
        }
    }

    private async Task<string> NextIdAsync()
    {
        var ids = await db.Products.Select(p => p.Id).ToListAsync();
        var highest = ids.Select(id => int.TryParse(id.TrimStart('p'), out var number) ? number : 0).DefaultIfEmpty(0).Max();
        return $"p{highest + 1}";
    }

    private async Task<ProductDto> GetAnyAsync(string id)
    {
        var product = await db.Products.AsNoTracking().Include(p => p.Category).FirstAsync(p => p.Id == id);
        return product.ToDto();
    }

    private static void ApplyRequest(Product product, ProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.CategoryId = request.CategoryId;
        product.Brand = request.Brand.Trim();
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.DiscountPercentage = Pricing.CalculateDiscountPercentage(request.Price, request.OriginalPrice);
        product.ImageUrl = request.ImageUrl.Trim();
        product.StockQuantity = request.StockQuantity;
        product.IsActive = request.IsActive;
        product.AgeGroup = request.AgeGroup.Trim();
        product.IsFeatured = request.IsFeatured;
        product.IsBestSeller = request.IsBestSeller;
        product.IsNew = request.IsNew;
        product.Specifications = request.Specifications;
    }
}
