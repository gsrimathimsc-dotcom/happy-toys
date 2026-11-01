using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class ProductService(IAppDbContext db) : IProductService
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
            .OrderByDescending(p => p.ReviewCount).ThenBy(p => p.Id)
            .Take(RelatedProductCount)
            .ToListAsync();
        var bestSellers = await ActiveProducts()
            .Where(p => p.CategoryId != product.CategoryId && p.IsBestSeller)
            .OrderByDescending(p => p.ReviewCount).ThenBy(p => p.Id)
            .Take(RelatedProductCount)
            .ToListAsync();

        var related = sameCategory.Concat(bestSellers).Take(RelatedProductCount).Select(p => p.ToDto()).ToList();
        return new ProductDetailsDto(product.ToDto(), related);
    }

    public async Task<StoreSummaryDto> GetStoreSummaryAsync()
    {
        var active = db.Products.Where(p => p.IsActive);
        var productCount = await active.CountAsync();
        var categoryCount = await db.Categories.CountAsync();

        return productCount == 0
            ? new StoreSummaryDto(0, categoryCount, 0, 0)
            : new StoreSummaryDto(
                productCount,
                categoryCount,
                Math.Round(await active.AverageAsync(p => p.Rating), 1),
                await active.MaxAsync(p => p.DiscountPercentage));
    }

    public async Task<ProductDto> CreateAsync(ProductRequest request)
    {
        await EnsureCategoryExistsAsync(request.CategoryId);

        var product = new Product { Id = await NextIdAsync() };
        ApplyRequest(product, request);
        product.Images.Add(new ProductImage { Url = request.ImageUrl.Trim() });
        db.Products.Add(product);
        RecordStockChange(product.Id, product.StockQuantity, InventoryReason.InitialStock);
        await db.SaveChangesAsync();

        return await GetAnyAsync(product.Id);
    }

    public async Task<ProductDto> UpdateAsync(string id, ProductRequest request)
    {
        await EnsureCategoryExistsAsync(request.CategoryId);

        var product = await db.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw ApiException.NotFound($"Product \"{id}\" was not found.");

        RecordStockChange(id, request.StockQuantity - product.StockQuantity, InventoryReason.AdminAdjustment);
        ApplyRequest(product, request);

        var mainImage = product.Images.OrderBy(i => i.SortOrder).FirstOrDefault();
        if (mainImage is null) product.Images.Add(new ProductImage { Url = request.ImageUrl.Trim() });
        else mainImage.Url = request.ImageUrl.Trim();

        await db.SaveChangesAsync();
        return await GetAnyAsync(id);
    }

    public Task<ProductDto> UpdateStockAsync(string id, int stockQuantity) =>
        db.InTransactionAsync(async () =>
        {
            // The lock stops this change colliding with an order for the same toy.
            var products = await db.LockProductsAsync([id]);
            if (!products.TryGetValue(id, out var product))
            {
                throw ApiException.NotFound($"Product \"{id}\" was not found.");
            }

            RecordStockChange(id, stockQuantity - product.StockQuantity, InventoryReason.AdminAdjustment);
            product.StockQuantity = stockQuantity;
            await db.SaveChangesAsync();
            return await GetAnyAsync(id);
        });

    public async Task DeleteAsync(string id)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.IsActive)
            ?? throw ApiException.NotFound($"Product \"{id}\" was not found.");
        product.IsActive = false;
        await db.SaveChangesAsync();
    }

    private IQueryable<Product> ActiveProducts() =>
        db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive);

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
            "newest" => products.OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id),
            "discount" => products.OrderByDescending(p => p.DiscountPercentage).ThenBy(p => p.Id),
            _ => products.OrderByDescending(p => p.ReviewCount).ThenBy(p => p.Id),
        };
    }

    private void RecordStockChange(string productId, int change, InventoryReason reason)
    {
        if (change == 0) return;
        db.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductId = productId,
            QuantityChange = change,
            Reason = reason,
            CreatedAt = DateTime.UtcNow,
        });
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
        var product = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == id);
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
        product.StockQuantity = request.StockQuantity;
        product.IsActive = request.IsActive;
        product.AgeGroup = request.AgeGroup.Trim();
        product.IsFeatured = request.IsFeatured;
        product.IsBestSeller = request.IsBestSeller;
        product.IsNew = request.IsNew;
        product.Specifications = request.Specifications;
    }
}
