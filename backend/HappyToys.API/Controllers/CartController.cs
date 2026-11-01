using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/cart")]
public class CartController(ICartService cart) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Success(await cart.GetAsync(GetOwnerId()));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(CartLineRequest request) =>
        Created(await cart.AddItemAsync(GetOwnerId(), request));

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(string id, UpdateCartItemRequest request) =>
        Success(await cart.UpdateItemAsync(GetOwnerId(), id, request.Quantity));

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(string id) =>
        Success(await cart.RemoveItemAsync(GetOwnerId(), id));

    /// <summary>
    /// Checks a cart saved in the browser against today's prices and stock.
    /// It stores nothing, so it works for guests without an id.
    /// </summary>
    [HttpPost("validate")]
    public async Task<IActionResult> Validate(ValidateCartRequest request) =>
        Success(await cart.ValidateAsync(request.Items));
}
