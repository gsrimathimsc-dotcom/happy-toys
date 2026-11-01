using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/wishlist")]
public class WishlistController(IWishlistService wishlist) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Success(await wishlist.GetAsync(GetOwner()));

    [HttpPost]
    public async Task<IActionResult> Add(WishlistRequest request) =>
        Created(await wishlist.AddAsync(GetOwner(), request.ProductId));

    [HttpDelete("{productId}")]
    public async Task<IActionResult> Remove(string productId) =>
        Success(await wishlist.RemoveAsync(GetOwner(), productId));
}
