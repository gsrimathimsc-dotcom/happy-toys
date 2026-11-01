namespace HappyToys.API.Models;

/// <summary>
/// One product in a server-side cart. OwnerId is "user:{id}" for logged-in
/// users or "guest:{id}" for visitors (see ApiControllerBase.GetOwnerId).
/// </summary>
public class CartItem
{
    public string OwnerId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public int Quantity { get; set; }
}
