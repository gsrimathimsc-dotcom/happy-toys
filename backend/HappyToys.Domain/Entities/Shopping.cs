using HappyToys.Domain.Common;

namespace HappyToys.Domain.Entities;

/// <summary>Belongs to a logged-in user (UserId) or a visitor (GuestId), never both.</summary>
public class Cart : AuditableEntity
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string? GuestId { get; set; }
    public List<CartItem> Items { get; set; } = [];
}

public class CartItem : AuditableEntity
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public string ProductId { get; set; } = "";
    public Product? Product { get; set; }
    public int Quantity { get; set; }
}

/// <summary>Belongs to a logged-in user (UserId) or a visitor (GuestId), never both.</summary>
public class Wishlist : AuditableEntity
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string? GuestId { get; set; }
    public List<WishlistItem> Items { get; set; } = [];
}

public class WishlistItem : AuditableEntity
{
    public int Id { get; set; }
    public int WishlistId { get; set; }
    public string ProductId { get; set; } = "";
    public Product? Product { get; set; }
}
