using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

public class CartService(AppDbContext db) : ICartService
{
    public async Task<CartDto> GetAsync(string ownerId)
    {
        var items = await db.CartItems.AsNoTracking().Where(i => i.OwnerId == ownerId).ToListAsync();
        var ids = items.Select(i => i.ProductId).ToList();
        var products = await db.Products.AsNoTracking()
            .Where(p => ids.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        var lines = items
            .Where(i => products.ContainsKey(i.ProductId))
            .Select(i => products[i.ProductId].ToCartLine(i.Quantity))
            .ToList();
        return new CartDto(lines, lines.ToTotals());
    }

    public async Task<CartDto> AddItemAsync(string ownerId, CartLineRequest request)
    {
        var product = await FindAvailableProductAsync(request.ProductId);
        var item = await db.CartItems.FindAsync(ownerId, request.ProductId);
        var quantity = (item?.Quantity ?? 0) + request.Quantity;
        EnsureInStock(product, quantity);

        if (item is null)
        {
            db.CartItems.Add(new CartItem { OwnerId = ownerId, ProductId = request.ProductId, Quantity = quantity });
        }
        else
        {
            item.Quantity = quantity;
        }

        await db.SaveChangesAsync();
        return await GetAsync(ownerId);
    }

    public async Task<CartDto> UpdateItemAsync(string ownerId, string productId, int quantity)
    {
        var item = await FindItemAsync(ownerId, productId);
        var product = await FindAvailableProductAsync(productId);
        EnsureInStock(product, quantity);

        item.Quantity = quantity;
        await db.SaveChangesAsync();
        return await GetAsync(ownerId);
    }

    public async Task<CartDto> RemoveItemAsync(string ownerId, string productId)
    {
        db.CartItems.Remove(await FindItemAsync(ownerId, productId));
        await db.SaveChangesAsync();
        return await GetAsync(ownerId);
    }

    public async Task<CartValidationDto> ValidateAsync(IEnumerable<CartLineRequest> lines)
    {
        var requested = lines
            .GroupBy(l => l.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(l => l.Quantity)))
            .ToList();
        var ids = requested.Select(l => l.ProductId).ToList();
        var products = await db.Products.AsNoTracking()
            .Where(p => ids.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        var checkedLines = new List<CartLineDto>();
        var issues = new List<string>();
        foreach (var (productId, quantity) in requested)
        {
            if (!products.TryGetValue(productId, out var product))
            {
                issues.Add("A product in your cart is no longer available and was removed.");
            }
            else if (product.StockQuantity <= 0)
            {
                issues.Add($"{product.Name} is out of stock and was removed.");
            }
            else if (quantity > product.StockQuantity)
            {
                issues.Add($"Only {product.StockQuantity} units of {product.Name} are available, so the quantity was reduced.");
                checkedLines.Add(product.ToCartLine(product.StockQuantity));
            }
            else
            {
                checkedLines.Add(product.ToCartLine(quantity));
            }
        }

        return new CartValidationDto(checkedLines, checkedLines.ToTotals(), issues.Count == 0, issues);
    }

    private async Task<CartItem> FindItemAsync(string ownerId, string productId) =>
        await db.CartItems.FindAsync(ownerId, productId)
        ?? throw ApiException.NotFound("This product is not in your cart.");

    private async Task<Product> FindAvailableProductAsync(string productId) =>
        await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId && p.IsActive)
        ?? throw ApiException.NotFound("This product no longer exists.");

    private static void EnsureInStock(Product product, int quantity)
    {
        if (product.StockQuantity <= 0)
        {
            throw ApiException.Conflict($"{product.Name} is out of stock.");
        }
        if (quantity > product.StockQuantity)
        {
            throw ApiException.Conflict($"Only {product.StockQuantity} units of {product.Name} are available.");
        }
    }
}
