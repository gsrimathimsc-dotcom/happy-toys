using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class WishlistService(IAppDbContext db) : IWishlistService
{
    public async Task<IReadOnlyList<ProductDto>> GetAsync(Owner owner)
    {
        var products = await db.WishlistItems.AsNoTracking()
            .Where(i => owner.UserId != null
                ? db.Wishlists.Any(w => w.Id == i.WishlistId && w.UserId == owner.UserId)
                : db.Wishlists.Any(w => w.Id == i.WishlistId && w.GuestId == owner.GuestId))
            .Where(i => i.Product!.IsActive)
            .OrderBy(i => i.Id)
            .Include(i => i.Product!).ThenInclude(p => p.Category)
            .Include(i => i.Product!).ThenInclude(p => p.Images)
            .Select(i => i.Product!)
            .ToListAsync();

        return products.Select(p => p.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<ProductDto>> AddAsync(Owner owner, string productId)
    {
        if (!await db.Products.AnyAsync(p => p.Id == productId && p.IsActive))
        {
            throw ApiException.NotFound("This product no longer exists.");
        }

        var wishlist = await FindWishlistAsync(owner);
        if (wishlist is null)
        {
            wishlist = new Wishlist { UserId = owner.UserId, GuestId = owner.GuestId };
            db.Wishlists.Add(wishlist);
        }

        // Adding the same toy twice is harmless, so it is not an error.
        if (wishlist.Items.All(i => i.ProductId != productId))
        {
            wishlist.Items.Add(new WishlistItem { ProductId = productId });
            await db.SaveChangesAsync();
        }

        return await GetAsync(owner);
    }

    public async Task<IReadOnlyList<ProductDto>> RemoveAsync(Owner owner, string productId)
    {
        var wishlist = await FindWishlistAsync(owner);
        var item = wishlist?.Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw ApiException.NotFound("This product is not in your wishlist.");

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();
        return await GetAsync(owner);
    }

    private Task<Wishlist?> FindWishlistAsync(Owner owner) =>
        db.Wishlists.Include(w => w.Items)
            .FirstOrDefaultAsync(w => owner.UserId != null ? w.UserId == owner.UserId : w.GuestId == owner.GuestId);
}
