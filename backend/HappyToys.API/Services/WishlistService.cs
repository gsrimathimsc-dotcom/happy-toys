using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

public class WishlistService(AppDbContext db) : IWishlistService
{
    public async Task<IReadOnlyList<ProductDto>> GetAsync(string ownerId)
    {
        var ids = await db.WishlistItems
            .Where(i => i.OwnerId == ownerId)
            .OrderBy(i => i.AddedDate)
            .Select(i => i.ProductId)
            .ToListAsync();
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Where(p => ids.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        return ids.Where(products.ContainsKey).Select(id => products[id].ToDto()).ToList();
    }

    public async Task<IReadOnlyList<ProductDto>> AddAsync(string ownerId, string productId)
    {
        if (!await db.Products.AnyAsync(p => p.Id == productId && p.IsActive))
        {
            throw ApiException.NotFound("This product no longer exists.");
        }

        // Adding the same toy twice is harmless, so it is not an error.
        if (await db.WishlistItems.FindAsync(ownerId, productId) is null)
        {
            db.WishlistItems.Add(new WishlistItem { OwnerId = ownerId, ProductId = productId, AddedDate = DateTime.UtcNow });
            await db.SaveChangesAsync();
        }

        return await GetAsync(ownerId);
    }

    public async Task<IReadOnlyList<ProductDto>> RemoveAsync(string ownerId, string productId)
    {
        var item = await db.WishlistItems.FindAsync(ownerId, productId)
            ?? throw ApiException.NotFound("This product is not in your wishlist.");
        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();
        return await GetAsync(ownerId);
    }
}
