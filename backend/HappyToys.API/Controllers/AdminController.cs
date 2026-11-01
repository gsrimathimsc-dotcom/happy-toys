using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

/// <summary>Demonstration admin panel. Every endpoint needs an Admin account.</summary>
[Route("api/admin")]
[Authorize(Roles = Role.Admin)]
public class AdminController(IAdminService admin) : ApiControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard() => Success(await admin.GetDashboardAsync());

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status) =>
        Success(await admin.GetOrdersAsync(status));

    /// <summary>All products, including deleted ones.</summary>
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts() => Success(await admin.GetProductsAsync());
}
