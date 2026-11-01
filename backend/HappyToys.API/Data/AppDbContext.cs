using System.Text.Json;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace HappyToys.API.Data;

/// <summary>
/// The EF Core model. In this demo it uses the in-memory provider, so no
/// database is installed. Moving to PostgreSQL later means changing the
/// provider in Program.cs and adding migrations; the services stay the same.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(product =>
        {
            product.HasOne(p => p.Category).WithMany().HasForeignKey(p => p.CategoryId);
            product.Property(p => p.Price).HasPrecision(10, 2);
            product.Property(p => p.OriginalPrice).HasPrecision(10, 2);

            // The specifications are stored as one JSON text value.
            product.Property(p => p.Specifications).HasConversion(
                value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
                value => JsonSerializer.Deserialize<Dictionary<string, string>>(value, (JsonSerializerOptions?)null) ?? new(),
                new ValueComparer<Dictionary<string, string>>(
                    (a, b) => a!.SequenceEqual(b!),
                    value => value.Aggregate(0, (hash, pair) => HashCode.Combine(hash, pair.GetHashCode())),
                    value => new Dictionary<string, string>(value)));
        });

        modelBuilder.Entity<CartItem>().HasKey(i => new { i.OwnerId, i.ProductId });
        modelBuilder.Entity<WishlistItem>().HasKey(i => new { i.OwnerId, i.ProductId });

        modelBuilder.Entity<Order>(order =>
        {
            order.Property(o => o.Status).HasConversion<string>();
            order.Property(o => o.PaymentMethod).HasConversion<string>();
            order.Property(o => o.Subtotal).HasPrecision(10, 2);
            order.Property(o => o.Discount).HasPrecision(10, 2);
            order.Property(o => o.DeliveryFee).HasPrecision(10, 2);
            order.Property(o => o.Total).HasPrecision(10, 2);
            order.OwnsOne(o => o.Customer);
            order.OwnsMany(o => o.Items, item =>
            {
                item.WithOwner().HasForeignKey("OrderId");
                item.Property<int>("Id");
                item.HasKey("Id");
                item.Property(i => i.Price).HasPrecision(10, 2);
                item.Property(i => i.OriginalPrice).HasPrecision(10, 2);
            });
        });

        modelBuilder.Entity<User>(user =>
        {
            user.HasIndex(u => u.Email).IsUnique();
            user.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<UserSession>().HasKey(s => s.Token);
    }
}
