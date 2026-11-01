using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using System.ComponentModel.DataAnnotations;
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

    /// <summary>Orders, items sold and sales per day, newest day first.</summary>
    [HttpGet("reports/daily")]
    public async Task<IActionResult> GetDailySales([FromQuery, Range(1, 90, ErrorMessage = "Days must be between 1 and 90.")] int days = 30) =>
        Success(await admin.GetDailySalesAsync(days));

    /// <summary>Orders, items sold and sales per month, newest month first.</summary>
    [HttpGet("reports/monthly")]
    public async Task<IActionResult> GetMonthlySales([FromQuery, Range(1, 36, ErrorMessage = "Months must be between 1 and 36.")] int months = 12) =>
        Success(await admin.GetMonthlySalesAsync(months));

    /// <summary>Every customer with their order count and total spent.</summary>
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers() => Success(await admin.GetCustomersAsync());

    [HttpPost("coupons")]
    public async Task<IActionResult> CreateCoupon(CouponRequest request) =>
        Created(await admin.CreateCouponAsync(request));

    [HttpPut("coupons/{id:int}")]
    public async Task<IActionResult> UpdateCoupon(int id, CouponRequest request) =>
        Success(await admin.UpdateCouponAsync(id, request));

    [HttpDelete("coupons/{id:int}")]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        await admin.DeleteCouponAsync(id);
        return Success(new MessageDto("Coupon deleted."));
    }

    /// <summary>Products on discount and every coupon.</summary>
    [HttpGet("offers")]
    public async Task<IActionResult> GetOffers() => Success(await admin.GetOffersAsync());
}
