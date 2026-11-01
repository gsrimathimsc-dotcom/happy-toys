using System.Security.Cryptography;
using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    // Lets only one request change stock at a time, so two customers can never
    // buy the last toy. With a real database this becomes a transaction.
    private static readonly SemaphoreSlim StockLock = new(1, 1);

    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedChanges = new()
    {
        [OrderStatus.Confirmed] = [OrderStatus.Processing, OrderStatus.Cancelled],
        [OrderStatus.Processing] = [OrderStatus.Shipped, OrderStatus.Cancelled],
        [OrderStatus.Shipped] = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = [],
    };

    public static bool CanCustomerCancel(OrderStatus status) =>
        status is OrderStatus.Confirmed or OrderStatus.Processing;

    public async Task<OrderDto> PlaceAsync(CreateOrderRequest request, string? userId)
    {
        // The same product on two lines counts as one line, so the stock check
        // below always sees the full quantity.
        var requested = request.Items
            .GroupBy(l => l.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(l => l.Quantity)))
            .ToList();
        var ids = requested.Select(l => l.ProductId).ToList();

        await StockLock.WaitAsync();
        try
        {
            var products = await db.Products
                .Where(p => ids.Contains(p.Id) && p.IsActive)
                .ToDictionaryAsync(p => p.Id);

            // Check every line before changing anything, so a failed order changes no stock.
            foreach (var (productId, quantity) in requested)
            {
                if (!products.TryGetValue(productId, out var product))
                {
                    throw ApiException.NotFound("One of the products in your cart no longer exists.");
                }
                if (quantity > product.StockQuantity)
                {
                    throw ApiException.Conflict($"Sorry, only {product.StockQuantity} units of {product.Name} are available.");
                }
            }

            var items = requested.Select(line =>
            {
                var product = products[line.ProductId];
                product.StockQuantity -= line.Quantity;
                return new OrderItem
                {
                    ProductId = product.Id,
                    Name = product.Name,
                    ImageUrl = product.ImageUrl,
                    Price = product.Price,
                    OriginalPrice = product.OriginalPrice,
                    Quantity = line.Quantity,
                };
            }).ToList();

            var totals = Pricing.CalculateTotals(items.Select(i => (i.Price, i.OriginalPrice, i.Quantity)).ToList());
            var customer = request.Customer!;
            var order = new Order
            {
                Id = await NewOrderNumberAsync(),
                UserId = userId,
                CreatedDate = DateTime.UtcNow,
                PaymentMethod = request.PaymentMethod!.Value,
                Customer = new OrderCustomer
                {
                    Name = customer.Name.Trim(),
                    Email = customer.Email.Trim(),
                    Mobile = customer.Mobile,
                    Address = customer.Address.Trim(),
                    City = customer.City.Trim(),
                    State = customer.State.Trim(),
                    PinCode = customer.PinCode,
                },
                Items = items,
                Subtotal = totals.Subtotal,
                Discount = totals.Discount,
                DeliveryFee = totals.DeliveryFee,
                Total = totals.Total,
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return order.ToDto();
        }
        finally
        {
            StockLock.Release();
        }
    }

    public async Task<IReadOnlyList<OrderDto>> GetForUserAsync(string userId)
    {
        var orders = await db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync();
        return orders.Select(o => o.ToDto()).ToList();
    }

    public async Task<OrderDto> GetByIdAsync(string id, string? userId, bool isAdmin)
    {
        var order = await db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);

        // A guest order is opened with its hard-to-guess number. An account's
        // order is private: other people get the same answer as a wrong number.
        var canView = order is not null && (order.UserId is null || order.UserId == userId || isAdmin);
        if (!canView)
        {
            throw ApiException.NotFound("Order not found. Demo orders are cleared when the server restarts.");
        }
        return order!.ToDto();
    }

    public async Task<OrderDto> UpdateStatusAsync(string id, OrderStatus status, string userId, bool isAdmin)
    {
        await StockLock.WaitAsync();
        try
        {
            var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id && (isAdmin || o.UserId == userId))
                ?? throw ApiException.NotFound("Order not found. Demo orders are cleared when the server restarts.");

            if (!isAdmin && status != OrderStatus.Cancelled)
            {
                throw ApiException.Forbidden("Customers can only cancel an order.");
            }
            if (!AllowedChanges[order.Status].Contains(status))
            {
                throw ApiException.Conflict($"An order that is {order.Status} cannot be changed to {status}.");
            }

            if (status == OrderStatus.Cancelled)
            {
                await ReturnStockAsync(order);
            }
            order.Status = status;
            await db.SaveChangesAsync();
            return order.ToDto();
        }
        finally
        {
            StockLock.Release();
        }
    }

    private async Task ReturnStockAsync(Order order)
    {
        var ids = order.Items.Select(i => i.ProductId).ToList();
        var products = await db.Products.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id);
        foreach (var item in order.Items)
        {
            products[item.ProductId].StockQuantity += item.Quantity;
        }
    }

    /// <summary>Creates a number like "HT-20261101-9F3A61C2", checked to be unused.</summary>
    private async Task<string> NewOrderNumberAsync()
    {
        string id;
        do
        {
            id = $"HT-{DateTime.UtcNow:yyyyMMdd}-{RandomNumberGenerator.GetHexString(8)}";
        }
        while (await db.Orders.AnyAsync(o => o.Id == id));
        return id;
    }
}
