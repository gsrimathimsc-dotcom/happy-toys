using System.Text.Json;
using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyToys.Infrastructure.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.Property(c => c.Id).HasMaxLength(60);
        builder.Property(c => c.Name).HasMaxLength(100);
        builder.Property(c => c.Description).HasMaxLength(300);
        builder.HasIndex(c => c.Name).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(p => p.Id).HasMaxLength(20);
        builder.Property(p => p.Name).HasMaxLength(120);
        builder.Property(p => p.CategoryId).HasMaxLength(60);
        builder.Property(p => p.Brand).HasMaxLength(60);
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.AgeGroup).HasMaxLength(40);
        builder.Property(p => p.Price).HasPrecision(10, 2);
        builder.Property(p => p.OriginalPrice).HasPrecision(10, 2);

        builder.HasOne(p => p.Category).WithMany().HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(p => p.Images).WithOne().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.Price);
        builder.HasIndex(p => p.IsActive);

        builder.ToTable(table =>
        {
            table.HasCheckConstraint("CK_Products_StockNotNegative", "\"StockQuantity\" >= 0");
            table.HasCheckConstraint("CK_Products_PricePositive", "\"Price\" > 0 AND \"OriginalPrice\" >= \"Price\"");
        });

        // The specifications differ per toy, so they are stored as one JSON value.
        builder.Property(p => p.Specifications)
            .HasColumnType("jsonb")
            .HasConversion(
                value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
                value => JsonSerializer.Deserialize<Dictionary<string, string>>(value, (JsonSerializerOptions?)null) ?? new(),
                new ValueComparer<Dictionary<string, string>>(
                    (a, b) => a!.SequenceEqual(b!),
                    value => value.Aggregate(0, (hash, pair) => HashCode.Combine(hash, pair.GetHashCode())),
                    value => new Dictionary<string, string>(value)));
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.Property(i => i.Url).HasMaxLength(500);
        builder.HasIndex(i => new { i.ProductId, i.SortOrder });
    }
}

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.Property(r => r.Comment).HasMaxLength(1000);
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(r => r.Product).WithMany().HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);

        // One review per customer per toy.
        builder.HasIndex(r => new { r.ProductId, r.UserId }).IsUnique();
        builder.ToTable(table => table.HasCheckConstraint("CK_Reviews_Rating", "\"Rating\" BETWEEN 1 AND 5"));
    }
}

public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.Property(t => t.Reason).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.OrderId).HasMaxLength(30);
        builder.HasOne(t => t.Product).WithMany().HasForeignKey(t => t.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(t => t.ProductId);
        builder.HasIndex(t => t.OrderId);
    }
}

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.Property(c => c.Code).HasMaxLength(30);
        builder.Property(c => c.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.Value).HasPrecision(10, 2);
        builder.Property(c => c.MinimumOrderAmount).HasPrecision(10, 2);
        builder.HasIndex(c => c.Code).IsUnique();
    }
}
