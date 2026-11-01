namespace HappyToys.API.Models;

/// <summary>One saved product. OwnerId works the same way as in CartItem.</summary>
public class WishlistItem
{
    public string OwnerId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public DateTime AddedDate { get; set; }
}
