using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Interfaces;

/// <summary>
/// What the services need from the database. They use this interface, so
/// they contain the business rules and no PostgreSQL-specific code.
/// </summary>
public interface IAppDbContext
{
    DbSet<Role> Roles { get; }
    DbSet<User> Users { get; }
    DbSet<UserAddress> UserAddresses { get; }
    DbSet<UserSession> UserSessions { get; }
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Wishlist> Wishlists { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<InventoryTransaction> InventoryTransactions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Runs the work as one transaction: everything saves, or nothing does.</summary>
    Task<T> InTransactionAsync<T>(Func<Task<T>> work);

    /// <summary>
    /// Inside a transaction: loads products and makes other orders for them wait,
    /// so two customers can never buy the last toy.
    /// </summary>
    Task<Dictionary<string, Product>> LockProductsAsync(IReadOnlyList<string> ids);

    /// <summary>Inside a transaction: loads an order and makes other changes to it wait.</summary>
    Task<Order?> LockOrderAsync(string id);
}
