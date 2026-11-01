using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/orders")]
public class OrdersController(IOrderService orders) : ApiControllerBase
{
    /// <summary>Places an order. Guests can check out without an account.</summary>
    [HttpPost]
    public async Task<IActionResult> Place(CreateOrderRequest request) =>
        Created(await orders.PlaceAsync(request, CurrentUserId));

    /// <summary>The logged-in customer's order history.</summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMine() => Success(await orders.GetForUserAsync(RequiredUserId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Success(await orders.GetByIdAsync(id, CurrentUserId, IsAdmin));

    /// <summary>Admins move an order along. Customers can only cancel their own.</summary>
    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(string id, UpdateOrderStatusRequest request) =>
        Success(await orders.UpdateStatusAsync(id, request.Status!.Value, RequiredUserId, IsAdmin));
}
