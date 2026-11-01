using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

public class AdminService(AppDbContext db) : IAdminService
{
    private const int RecentOrderCount = 5;
    private const int BestSellerCount = 5;
    private const int SalesOverviewDays = 7;

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var orders = await db.Orders.AsNoTracking().OrderByDescending(o => o.CreatedDate).ToListAsync();
        var paidOrders = orders.Where(o => o.Status != OrderStatus.Cancelled).ToList();

        var bestSelling = paidOrders
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductId)
            .Select(g => new BestSellingProductDto(
                g.Key,
                g.First().Name,
                g.First().ImageUrl,
                g.Sum(i => i.Quantity),
                g.Sum(i => i.Price * i.Quantity)))
            .OrderByDescending(p => p.UnitsSold)
            .Take(BestSellerCount)
            .ToList();

        return new AdminDashboardDto(
            await db.Products.CountAsync(p => p.IsActive),
            orders.Count,
            await db.Users.CountAsync(u => u.Role == UserRole.Customer),
            paidOrders.Sum(o => o.Total),
            orders.Take(RecentOrderCount).Select(o => o.ToDto()).ToList(),
            bestSelling,
            BuildSalesOverview(paidOrders));
    }

    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(OrderStatus? status)
    {
        var orders = await db.Orders.AsNoTracking()
            .Where(o => status == null || o.Status == status)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync();
        return orders.Select(o => o.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync()
    {
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .ToListAsync();
        return products.Select(p => p.ToDto()).ToList();
    }

    /// <summary>One row per day (oldest first), including days with no sales.</summary>
    private static List<DailySalesDto> BuildSalesOverview(List<Order> orders)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var byDay = orders.ToLookup(o => DateOnly.FromDateTime(o.CreatedDate));

        return Enumerable.Range(0, SalesOverviewDays)
            .Select(offset => today.AddDays(offset - SalesOverviewDays + 1))
            .Select(day => new DailySalesDto(day, byDay[day].Count(), byDay[day].Sum(o => o.Total)))
            .ToList();
    }
}
