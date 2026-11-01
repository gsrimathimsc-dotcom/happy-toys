using HappyToys.Application.Interfaces;
using HappyToys.Domain.Common;
using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Infrastructure.Data;

/// <summary>The PostgreSQL database. Table rules are in the Configurations folder.</summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAt == default) entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    public Task<T> InTransactionAsync<T>(Func<Task<T>> work) =>
        // The strategy repeats the work if a brief network fault interrupts it.
        Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            ChangeTracker.Clear();
            await using var transaction = await Database.BeginTransactionAsync();
            var result = await work();
            await transaction.CommitAsync();
            return result;
        });

    public async Task<Dictionary<string, Product>> LockProductsAsync(IReadOnlyList<string> ids)
    {
        // Sorted, so two orders with the same toys always lock in the same order and cannot deadlock.
        var sortedIds = ids.Order(StringComparer.Ordinal).ToArray();
        var products = await Products
            .FromSql($"""SELECT * FROM "Products" WHERE "Id" = ANY({sortedIds}) ORDER BY "Id" FOR UPDATE""")
            .ToListAsync();
        return products.ToDictionary(p => p.Id);
    }

    public async Task<Order?> LockOrderAsync(string id)
    {
        var order = await Orders
            .FromSql($"""SELECT * FROM "Orders" WHERE "Id" = {id} FOR UPDATE""")
            .FirstOrDefaultAsync();
        if (order is null) return null;

        await Entry(order).Collection(o => o.Items).LoadAsync();
        await Entry(order).Reference(o => o.Payment).LoadAsync();
        return order;
    }
}
