using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class CartService(IAppDbContext db) : ICartService
{
    public async Task<CartDto> GetAsync(Owner owner)
    {
        var cart = await db.Carts.AsNoTracking()
            .Include(c => c.Items).ThenInclude(i => i.Product!).ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => owner.UserId != null ? c.UserId == owner.UserId : c.GuestId == owner.GuestId);

        var lines = (cart?.Items ?? [])
            .Where(i => i.Product is { IsActive: true })
            .OrderBy(i => i.Id)
            .Select(i => i.Product!.ToCartLine(i.Quantity))
            .ToList();
        return new CartDto(lines, lines.ToTotals());
    }

    public async Task<CartDto> AddItemAsync(Owner owner, CartLineRequest request)
    {
        var product = await FindAvailableProductAsync(request.ProductId);
        var cart = await FindCartAsync(owner);
        if (cart is null)
        {
            cart = new Cart { UserId = owner.UserId, GuestId = owner.GuestId };
            db.Carts.Add(cart);
        }

        var item = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        var quantity = (item?.Quantity ?? 0) + request.Quantity;
        EnsureInStock(product, quantity);

        if (item is null) cart.Items.Add(new CartItem { ProductId = request.ProductId, Quantity = quantity });
        else item.Quantity = quantity;

        await db.SaveChangesAsync();
        return await GetAsync(owner);
    }

    public async Task<CartDto> UpdateItemAsync(Owner owner, string productId, int quantity)
    {
        var item = await FindItemAsync(owner, productId);
        var product = await FindAvailableProductAsync(productId);
        EnsureInStock(product, quantity);

        item.Quantity = quantity;
        await db.SaveChangesAsync();
        return await GetAsync(owner);
    }

    public async Task<CartDto> RemoveItemAsync(Owner owner, string productId)
    {
        db.CartItems.Remove(await FindItemAsync(owner, productId));
        await db.SaveChangesAsync();
        return await GetAsync(owner);
    }

    public async Task<CartValidationDto> ValidateAsync(IEnumerable<CartLineRequest> lines)
    {
        var requested = lines
            .GroupBy(l => l.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(l => l.Quantity)))
            .ToList();
        var ids = requested.Select(l => l.ProductId).ToList();
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Images)
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

    private Task<Cart?> FindCartAsync(Owner owner) =>
        db.Carts.Include(c => c.Items)
            .FirstOrDefaultAsync(c => owner.UserId != null ? c.UserId == owner.UserId : c.GuestId == owner.GuestId);

    private async Task<CartItem> FindItemAsync(Owner owner, string productId)
    {
        var cart = await FindCartAsync(owner);
        return cart?.Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw ApiException.NotFound("This product is not in your cart.");
    }

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
