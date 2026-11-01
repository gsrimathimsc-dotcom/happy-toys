using HappyToys.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyToys.Infrastructure.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.Name).HasMaxLength(30);
        builder.HasIndex(r => r.Name).IsUnique();
        builder.HasData(
            new Role { Id = Role.CustomerId, Name = Role.Customer },
            new Role { Id = Role.AdminId, Name = Role.Admin });
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.Id).HasMaxLength(40);
        builder.Property(u => u.Name).HasMaxLength(100);
        builder.Property(u => u.Email).HasMaxLength(200);
        builder.Property(u => u.PasswordHash).HasMaxLength(200);
        builder.Property(u => u.Mobile).HasMaxLength(15);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasOne(u => u.Role).WithMany().HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(u => u.Addresses).WithOne().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
{
    public void Configure(EntityTypeBuilder<UserAddress> builder)
    {
        builder.Property(a => a.Address).HasMaxLength(300);
        builder.Property(a => a.City).HasMaxLength(100);
        builder.Property(a => a.State).HasMaxLength(100);
        builder.Property(a => a.PinCode).HasMaxLength(6);
        builder.HasIndex(a => a.UserId);
    }
}

public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.HasKey(s => s.Token);
        builder.Property(s => s.Token).HasMaxLength(64);
        builder.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.Property(c => c.GuestId).HasMaxLength(64);
        builder.HasOne<User>().WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);

        // One cart per person.
        builder.HasIndex(c => c.UserId).IsUnique();
        builder.HasIndex(c => c.GuestId).IsUnique();
        builder.ToTable(table => table.HasCheckConstraint(
            "CK_Carts_OneOwner", "(\"UserId\" IS NULL) <> (\"GuestId\" IS NULL)"));
    }
}

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(i => new { i.CartId, i.ProductId }).IsUnique();
        builder.ToTable(table => table.HasCheckConstraint("CK_CartItems_Quantity", "\"Quantity\" > 0"));
    }
}

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.Property(w => w.GuestId).HasMaxLength(64);
        builder.HasOne<User>().WithMany().HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(w => w.Items).WithOne().HasForeignKey(i => i.WishlistId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(w => w.UserId).IsUnique();
        builder.HasIndex(w => w.GuestId).IsUnique();
        builder.ToTable(table => table.HasCheckConstraint(
            "CK_Wishlists_OneOwner", "(\"UserId\" IS NULL) <> (\"GuestId\" IS NULL)"));
    }
}

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);

        // The same toy cannot be saved twice.
        builder.HasIndex(i => new { i.WishlistId, i.ProductId }).IsUnique();
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.Id).HasMaxLength(30);
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.Subtotal).HasPrecision(10, 2);
        builder.Property(o => o.Discount).HasPrecision(10, 2);
        builder.Property(o => o.DeliveryFee).HasPrecision(10, 2);
        builder.Property(o => o.Total).HasPrecision(10, 2);

        // Deleting an account keeps its orders for the sales records.
        builder.HasOne<User>().WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.SetNull);
        builder.HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(o => o.Payment).WithOne().HasForeignKey<Payment>(p => p.OrderId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);

        builder.OwnsOne(o => o.Customer, customer =>
        {
            customer.Property(c => c.Name).HasMaxLength(100).HasColumnName("CustomerName");
            customer.Property(c => c.Email).HasMaxLength(200).HasColumnName("CustomerEmail");
            customer.Property(c => c.Mobile).HasMaxLength(15).HasColumnName("CustomerMobile");
            customer.Property(c => c.Address).HasMaxLength(300).HasColumnName("DeliveryAddress");
            customer.Property(c => c.City).HasMaxLength(100).HasColumnName("DeliveryCity");
            customer.Property(c => c.State).HasMaxLength(100).HasColumnName("DeliveryState");
            customer.Property(c => c.PinCode).HasMaxLength(6).HasColumnName("DeliveryPinCode");
        });
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Property(i => i.ProductId).HasMaxLength(20);
        builder.Property(i => i.Name).HasMaxLength(120);
        builder.Property(i => i.ImageUrl).HasMaxLength(500);
        builder.Property(i => i.Price).HasPrecision(10, 2);
        builder.Property(i => i.OriginalPrice).HasPrecision(10, 2);

        // Sold toys cannot be erased, which keeps every order's history correct.
        builder.HasOne<Product>().WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(i => i.OrderId);
        builder.ToTable(table => table.HasCheckConstraint("CK_OrderItems_Quantity", "\"Quantity\" > 0"));
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(p => p.Method).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Amount).HasPrecision(10, 2);
    }
}
