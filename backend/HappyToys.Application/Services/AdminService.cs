using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class AdminService(IAppDbContext db) : IAdminService
{
    private const int RecentOrderCount = 5;
    private const int BestSellerCount = 5;
    private const int SalesOverviewDays = 7;

    // Daily figures follow the store's clock, so an order at 1 am in India counts for that day.
    private static readonly TimeSpan IndiaOffset = TimeSpan.FromHours(5.5);

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var orders = await OrdersWithDetails().OrderByDescending(o => o.CreatedAt).ToListAsync();
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

        var activeProducts = db.Products.Where(p => p.IsActive);
        var overview = BuildDailySales(paidOrders, SalesOverviewDays);

        return new AdminDashboardDto(
            await activeProducts.CountAsync(),
            orders.Count,
            await db.Users.CountAsync(u => u.RoleId == Role.CustomerId),
            paidOrders.Sum(o => o.Total),
            await activeProducts.CountAsync(p => p.StockQuantity > 0 && p.StockQuantity <= Mappings.LowStockLimit),
            await activeProducts.CountAsync(p => p.StockQuantity == 0),
            orders.Count(o => o.Status is OrderStatus.Confirmed or OrderStatus.Processing),
            await activeProducts.CountAsync(p => p.DiscountPercentage > 0),
            await ActiveCoupons().CountAsync(),
            overview[^1],
            orders.Take(RecentOrderCount).Select(o => o.ToDto()).ToList(),
            bestSelling,
            overview,
            Enum.GetValues<OrderStatus>()
                .Select(status => new OrderStatusCountDto(status, orders.Count(o => o.Status == status)))
                .ToList());
    }

    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(OrderStatus? status)
    {
        var orders = await OrdersWithDetails()
            .Where(o => status == null || o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return orders.Select(o => o.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<ProductDto>> GetProductsAsync()
    {
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .OrderBy(p => p.Name)
            .ToListAsync();
        return products.Select(p => p.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<DailySalesDto>> GetDailySalesAsync(int days)
    {
        // One extra day of orders covers the difference between UTC and Indian time.
        var since = DateTime.UtcNow.AddDays(-(days + 1));
        var orders = await OrdersWithDetails()
            .Where(o => o.Status != OrderStatus.Cancelled && o.CreatedAt >= since)
            .ToListAsync();

        return BuildDailySales(orders, days).AsEnumerable().Reverse().ToList();
    }

    public async Task<AdminOffersDto> GetOffersAsync()
    {
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.DiscountPercentage > 0)
            .OrderByDescending(p => p.DiscountPercentage).ThenBy(p => p.Name)
            .ToListAsync();
        var coupons = await db.Coupons.AsNoTracking().OrderBy(c => c.Code).ToListAsync();

        return new AdminOffersDto(
            products.Select(p => p.ToDto()).ToList(),
            coupons.Select(ToDto).ToList());
    }

    public async Task<IReadOnlyList<MonthlySalesDto>> GetMonthlySalesAsync(int months)
    {
        var today = IndiaDate(DateTime.UtcNow);
        var firstMonth = new DateOnly(today.Year, today.Month, 1).AddMonths(-(months - 1));
        // A day of slack covers the difference between UTC and Indian time.
        // PostgreSQL only accepts a UTC date here, so the kind is set explicitly.
        var since = DateTime.SpecifyKind(
            firstMonth.ToDateTime(TimeOnly.MinValue).Subtract(IndiaOffset).AddDays(-1), DateTimeKind.Utc);
        var orders = await OrdersWithDetails()
            .Where(o => o.Status != OrderStatus.Cancelled && o.CreatedAt >= since)
            .ToListAsync();
        var byMonth = orders.ToLookup(o =>
        {
            var date = IndiaDate(o.CreatedAt);
            return (date.Year, date.Month);
        });

        return Enumerable.Range(0, months)
            .Select(offset => firstMonth.AddMonths(offset))
            .Select(month =>
            {
                var inMonth = byMonth[(month.Year, month.Month)].ToList();
                return new MonthlySalesDto(
                    month.Year,
                    month.Month,
                    month.ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture),
                    inMonth.Count,
                    inMonth.SelectMany(o => o.Items).Sum(i => i.Quantity),
                    inMonth.Sum(o => o.Total));
            })
            .Reverse()
            .ToList();
    }

    public async Task<IReadOnlyList<CustomerDto>> GetCustomersAsync()
    {
        var customers = await db.Users.AsNoTracking()
            .Where(u => u.RoleId == Role.CustomerId)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
        var totals = (await db.Orders.AsNoTracking()
                .Where(o => o.UserId != null && o.Status != OrderStatus.Cancelled)
                .Select(o => new { o.UserId, o.Total })
                .ToListAsync())
            .GroupBy(o => o.UserId!)
            .ToDictionary(g => g.Key, g => (Orders: g.Count(), Spent: g.Sum(o => o.Total)));

        return customers
            .Select(u =>
            {
                var (orders, spent) = totals.GetValueOrDefault(u.Id);
                return new CustomerDto(u.Id, u.Name, u.Email, u.Mobile, u.CreatedAt, orders, spent);
            })
            .ToList();
    }

    public async Task<CouponDto> CreateCouponAsync(CouponRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Coupons.AnyAsync(c => c.Code == code))
        {
            throw ApiException.Conflict($"Coupon \"{code}\" already exists.");
        }

        var coupon = new Coupon();
        ApplyCoupon(coupon, request, code);
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();
        return ToDto(coupon);
    }

    public async Task<CouponDto> UpdateCouponAsync(int id, CouponRequest request)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw ApiException.NotFound("Coupon was not found.");
        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Coupons.AnyAsync(c => c.Id != id && c.Code == code))
        {
            throw ApiException.Conflict($"Coupon \"{code}\" already exists.");
        }

        ApplyCoupon(coupon, request, code);
        await db.SaveChangesAsync();
        return ToDto(coupon);
    }

    public async Task DeleteCouponAsync(int id)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw ApiException.NotFound("Coupon was not found.");
        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync();
    }

    private static void ApplyCoupon(Coupon coupon, CouponRequest request, string code)
    {
        coupon.Code = code;
        coupon.Type = request.Type;
        coupon.Value = request.Value;
        coupon.MinimumOrderAmount = request.MinimumOrderAmount;
        coupon.IsActive = request.IsActive;
        coupon.ExpiresAt = request.ExpiresAt?.ToUniversalTime();
    }

    private static CouponDto ToDto(Coupon c) =>
        new(c.Id, c.Code, c.Type, c.Value, c.MinimumOrderAmount, c.IsActive, c.ExpiresAt);

    private IQueryable<Order> OrdersWithDetails() =>
        db.Orders.AsNoTracking().Include(o => o.Items).Include(o => o.Payment);

    private IQueryable<Coupon> ActiveCoupons()
    {
        var now = DateTime.UtcNow;
        return db.Coupons.Where(c => c.IsActive && (c.ExpiresAt == null || c.ExpiresAt > now));
    }

    private static DateOnly IndiaDate(DateTime utc) => DateOnly.FromDateTime(utc.Add(IndiaOffset));

    /// <summary>One row per day (oldest first), including days with no sales.</summary>
    private static List<DailySalesDto> BuildDailySales(List<Order> orders, int days)
    {
        var today = IndiaDate(DateTime.UtcNow);
        var byDay = orders.ToLookup(o => IndiaDate(o.CreatedAt));

        return Enumerable.Range(0, days)
            .Select(offset => today.AddDays(offset - days + 1))
            .Select(day =>
            {
                var items = byDay[day]
                    .SelectMany(o => o.Items)
                    .GroupBy(i => i.ProductId)
                    .Select(g => new DailyItemDto(g.Key, g.First().Name, g.Sum(i => i.Quantity), g.Sum(i => i.Price * i.Quantity)))
                    .OrderByDescending(i => i.Quantity)
                    .ToList();

                return new DailySalesDto(day, byDay[day].Count(), items.Sum(i => i.Quantity), byDay[day].Sum(o => o.Total), items);
            })
            .ToList();
    }
}
