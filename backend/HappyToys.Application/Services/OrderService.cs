using System.Security.Cryptography;
using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class OrderService(IAppDbContext db) : IOrderService
{
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

    public Task<OrderDto> PlaceAsync(CreateOrderRequest request, string? userId)
    {
        // The same product on two lines counts as one line, so the stock check
        // below always sees the full quantity.
        var requested = request.Items
            .GroupBy(l => l.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(l => l.Quantity)))
            .ToList();

        return db.InTransactionAsync(async () =>
        {
            var products = await db.LockProductsAsync(requested.Select(l => l.ProductId).ToList());

            // Check every line before changing anything, so a failed order changes no stock.
            foreach (var (productId, quantity) in requested)
            {
                if (!products.TryGetValue(productId, out var product) || !product.IsActive)
                {
                    throw ApiException.NotFound("One of the products in your cart no longer exists.");
                }
                if (quantity > product.StockQuantity)
                {
                    throw ApiException.Conflict($"Sorry, only {product.StockQuantity} units of {product.Name} are available.");
                }
            }

            var images = await MainImagesAsync(products.Keys);
            var orderId = await NewOrderNumberAsync();
            var items = requested.Select(line =>
            {
                var product = products[line.ProductId];
                product.StockQuantity -= line.Quantity;
                RecordStockChange(product.Id, -line.Quantity, InventoryReason.Sale, orderId);
                return new OrderItem
                {
                    ProductId = product.Id,
                    Name = product.Name,
                    ImageUrl = images.GetValueOrDefault(product.Id, ""),
                    Price = product.Price,
                    OriginalPrice = product.OriginalPrice,
                    Quantity = line.Quantity,
                };
            }).ToList();

            var totals = Pricing.CalculateTotals(items.Select(i => (i.Price, i.OriginalPrice, i.Quantity)).ToList());
            var customer = request.Customer!;
            var method = request.PaymentMethod!.Value;
            var order = new Order
            {
                Id = orderId,
                UserId = userId,
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
                Payment = new Payment
                {
                    Method = method,
                    Status = method == PaymentMethod.Cod ? PaymentStatus.Pending : PaymentStatus.Simulated,
                    Amount = totals.Total,
                },
                Subtotal = totals.Subtotal,
                Discount = totals.Discount,
                DeliveryFee = totals.DeliveryFee,
                Total = totals.Total,
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return order.ToDto();
        });
    }

    public async Task<IReadOnlyList<OrderDto>> GetForUserAsync(string userId)
    {
        var orders = await OrdersWithDetails()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return orders.Select(o => o.ToDto()).ToList();
    }

    public async Task<OrderDto> GetByIdAsync(string id, string? userId, bool isAdmin)
    {
        var order = await OrdersWithDetails().FirstOrDefaultAsync(o => o.Id == id);

        // A guest order is opened with its hard-to-guess number. An account's
        // order is private: other people get the same answer as a wrong number.
        var canView = order is not null && (order.UserId is null || order.UserId == userId || isAdmin);
        if (!canView)
        {
            throw ApiException.NotFound("Order not found. Please check the order number.");
        }
        return order!.ToDto();
    }

    public Task<OrderDto> UpdateStatusAsync(string id, OrderStatus status, string userId, bool isAdmin) =>
        db.InTransactionAsync(async () =>
        {
            var order = await db.LockOrderAsync(id);
            if (order is null || !(isAdmin || order.UserId == userId))
            {
                throw ApiException.NotFound("Order not found. Please check the order number.");
            }
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
                if (order.Payment is { Status: PaymentStatus.Simulated } payment)
                {
                    payment.Status = PaymentStatus.Refunded;
                }
            }

            order.Status = status;
            await db.SaveChangesAsync();
            return order.ToDto();
        });

    private IQueryable<Order> OrdersWithDetails() =>
        db.Orders.AsNoTracking().Include(o => o.Items).Include(o => o.Payment);

    private async Task ReturnStockAsync(Order order)
    {
        var products = await db.LockProductsAsync(order.Items.Select(i => i.ProductId).ToList());
        foreach (var item in order.Items)
        {
            products[item.ProductId].StockQuantity += item.Quantity;
            RecordStockChange(item.ProductId, item.Quantity, InventoryReason.OrderCancelled, order.Id);
        }
    }

    private void RecordStockChange(string productId, int change, InventoryReason reason, string orderId) =>
        db.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductId = productId,
            QuantityChange = change,
            Reason = reason,
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow,
        });

    private async Task<Dictionary<string, string>> MainImagesAsync(IEnumerable<string> productIds)
    {
        var ids = productIds.ToList();
        var images = await db.ProductImages.AsNoTracking()
            .Where(i => ids.Contains(i.ProductId))
            .OrderBy(i => i.SortOrder)
            .ToListAsync();
        return images.GroupBy(i => i.ProductId).ToDictionary(g => g.Key, g => g.First().Url);
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
