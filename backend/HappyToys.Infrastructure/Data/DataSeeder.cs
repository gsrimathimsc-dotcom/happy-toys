using System.Reflection;
using System.Text.Json;
using HappyToys.Domain.Entities;
using HappyToys.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HappyToys.Infrastructure.Data;

/// <summary>
/// Adds the demonstration catalog, coupons and accounts to an empty database.
/// Passwords come from configuration, so none are stored in the code.
/// </summary>
public class DataSeeder(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration configuration, ILogger<DataSeeder> logger)
{
    public const string AdminEmail = "admin@happytoys.example";
    public const string CustomerEmail = "demo@happytoys.example";

    private sealed record SeedProduct(
        string Id, string Name, string CategoryId, string Brand, string Description, decimal Price,
        decimal OriginalPrice, int DiscountPercentage, double Rating, int ReviewCount, string ImageUrl,
        int StockQuantity, bool IsActive, DateTime CreatedDate, string AgeGroup, bool IsFeatured,
        bool IsBestSeller, bool IsNew, Dictionary<string, string> Specifications);

    public async Task SeedAsync()
    {
        if (!await db.Categories.AnyAsync()) await SeedCatalogAsync();
        await SeedUserAsync("demo-admin", "Demo Admin", AdminEmail, "Seed:AdminPassword", Role.AdminId);
        await SeedUserAsync("demo-customer", "Demo Customer", CustomerEmail, "Seed:CustomerPassword", Role.CustomerId);
        await db.SaveChangesAsync();

        if (configuration.GetValue<bool>("Seed:SampleOrders")) await SeedSampleOrdersAsync();
    }

    private static readonly (string Name, string Email, string Mobile, string City, string State, string PinCode)[] SampleCustomers =
    [
        ("Ananya Iyer", "ananya.iyer@sample.example", "9840011122", "Chennai", "Tamil Nadu", "600017"),
        ("Rohan Mehta", "rohan.mehta@sample.example", "9820033344", "Mumbai", "Maharashtra", "400050"),
        ("Priya Nair", "priya.nair@sample.example", "9447055566", "Kochi", "Kerala", "682016"),
        ("Arjun Reddy", "arjun.reddy@sample.example", "9848077788", "Hyderabad", "Telangana", "500034"),
        ("Kavya Sharma", "kavya.sharma@sample.example", "9811099900", "New Delhi", "Delhi", "110016"),
        ("Vikram Singh", "vikram.singh@sample.example", "9876512345", "Jaipur", "Rajasthan", "302001"),
        ("Meera Das", "meera.das@sample.example", "9830012345", "Kolkata", "West Bengal", "700019"),
        ("Sanjay Kulkarni", "sanjay.kulkarni@sample.example", "9822012345", "Pune", "Maharashtra", "411004"),
    ];

    /// <summary>
    /// Adds sample customers and about six months of orders so the admin charts have something to show.
    /// Runs once, and only when the store has no orders yet. Controlled by the Seed:SampleOrders setting.
    /// </summary>
    private async Task SeedSampleOrdersAsync()
    {
        if (await db.Orders.AnyAsync()) return;
        var password = configuration["Seed:CustomerPassword"];
        if (string.IsNullOrWhiteSpace(password)) return;

        var products = await db.Products.Include(p => p.Images).Where(p => p.IsActive && p.StockQuantity >= 10).ToListAsync();
        if (products.Count == 0) return;

        var random = new Random(2026);
        var customers = new List<User>();
        foreach (var c in SampleCustomers)
        {
            var user = new User
            {
                Id = $"sample-{c.Email.Split('.')[0]}",
                Name = c.Name,
                Email = c.Email,
                Mobile = c.Mobile,
                RoleId = Role.CustomerId,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(60, 200)),
                Addresses = [new UserAddress { Address = $"{random.Next(1, 99)}, Gandhi Road", City = c.City, State = c.State, PinCode = c.PinCode, IsDefault = true }],
            };
            user.PasswordHash = hasher.HashPassword(user, password);
            customers.Add(user);
        }
        db.Users.AddRange(customers);

        const int orderCount = 70;
        for (var i = 0; i < orderCount; i++)
        {
            var customer = customers[random.Next(customers.Count)];
            var address = customer.Addresses[0];
            var created = DateTime.UtcNow.AddDays(-random.Next(0, 180)).AddMinutes(-random.Next(0, 1440));
            var age = (DateTime.UtcNow - created).TotalDays;

            var lines = products.OrderBy(_ => random.Next()).Take(random.Next(1, 4)).Select(p => (Product: p, Quantity: random.Next(1, 3))).ToList();
            var subtotal = lines.Sum(l => l.Product.Price * l.Quantity);
            var delivery = subtotal >= Application.Services.Pricing.FreeDeliveryThreshold ? 0 : Application.Services.Pricing.DeliveryFee;

            var roll = random.NextDouble();
            var status = age switch
            {
                > 14 => roll < 0.08 ? OrderStatus.Cancelled : OrderStatus.Delivered,
                > 5 => roll < 0.05 ? OrderStatus.Cancelled : roll < 0.6 ? OrderStatus.Delivered : OrderStatus.Shipped,
                > 2 => roll < 0.5 ? OrderStatus.Shipped : OrderStatus.Processing,
                _ => roll < 0.6 ? OrderStatus.Confirmed : OrderStatus.Processing,
            };

            var method = (PaymentMethod)random.Next(3);
            var order = new Order
            {
                Id = $"HT-{created:yyyyMMdd}-{random.Next():X8}",
                UserId = customer.Id,
                Status = status,
                Customer = new OrderCustomer
                {
                    Name = customer.Name, Email = customer.Email, Mobile = customer.Mobile,
                    Address = address.Address, City = address.City, State = address.State, PinCode = address.PinCode,
                },
                Items = lines.Select(l => new OrderItem
                {
                    ProductId = l.Product.Id, Name = l.Product.Name, ImageUrl = l.Product.Images.FirstOrDefault()?.Url ?? "",
                    Price = l.Product.Price, OriginalPrice = l.Product.OriginalPrice, Quantity = l.Quantity,
                }).ToList(),
                Subtotal = subtotal,
                DeliveryFee = delivery,
                Total = subtotal + delivery,
                CreatedAt = created,
                UpdatedAt = created,
                Payment = new Payment
                {
                    Method = method,
                    Amount = subtotal + delivery,
                    Status = status == OrderStatus.Cancelled && method != PaymentMethod.Cod ? PaymentStatus.Refunded
                        : method == PaymentMethod.Cod ? PaymentStatus.Pending : PaymentStatus.Simulated,
                    CreatedAt = created,
                    UpdatedAt = created,
                },
            };
            db.Orders.Add(order);

            if (status == OrderStatus.Cancelled) continue;
            foreach (var (product, quantity) in lines)
            {
                if (product.StockQuantity < quantity) continue;
                product.StockQuantity -= quantity;
                db.InventoryTransactions.Add(new InventoryTransaction
                {
                    ProductId = product.Id, QuantityChange = -quantity, Reason = InventoryReason.Sale,
                    OrderId = order.Id, CreatedAt = created,
                });
            }
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Added {Customers} sample customers and {Orders} sample orders.", customers.Count, orderCount);
    }

    private async Task SeedCatalogAsync()
    {
        db.Categories.AddRange(ReadSeedFile<Category>("categories.json"));

        foreach (var seed in ReadSeedFile<SeedProduct>("products.json"))
        {
            db.Products.Add(new Product
            {
                Id = seed.Id,
                Name = seed.Name,
                CategoryId = seed.CategoryId,
                Brand = seed.Brand,
                Description = seed.Description,
                Price = seed.Price,
                OriginalPrice = seed.OriginalPrice,
                DiscountPercentage = seed.DiscountPercentage,
                Rating = seed.Rating,
                ReviewCount = seed.ReviewCount,
                StockQuantity = seed.StockQuantity,
                IsActive = seed.IsActive,
                CreatedAt = DateTime.SpecifyKind(seed.CreatedDate, DateTimeKind.Utc),
                AgeGroup = seed.AgeGroup,
                IsFeatured = seed.IsFeatured,
                IsBestSeller = seed.IsBestSeller,
                IsNew = seed.IsNew,
                Specifications = seed.Specifications,
                Images = [new ProductImage { Url = seed.ImageUrl }],
            });

            if (seed.StockQuantity > 0)
            {
                db.InventoryTransactions.Add(new InventoryTransaction
                {
                    ProductId = seed.Id,
                    QuantityChange = seed.StockQuantity,
                    Reason = InventoryReason.InitialStock,
                    CreatedAt = DateTime.UtcNow,
                });
            }
        }

        db.Coupons.AddRange(
            new Coupon { Code = "HAPPY10", Type = CouponType.Percentage, Value = 10, MinimumOrderAmount = 999 },
            new Coupon { Code = "TOYS100", Type = CouponType.FixedAmount, Value = 100, MinimumOrderAmount = 1499 });
    }

    private async Task SeedUserAsync(string id, string name, string email, string passwordSetting, int roleId)
    {
        if (await db.Users.AnyAsync(u => u.Email == email)) return;

        var password = configuration[passwordSetting];
        if (string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("Skipping the {Email} account because {Setting} is not set.", email, passwordSetting);
            return;
        }

        var user = new User { Id = id, Name = name, Email = email, RoleId = roleId };
        user.PasswordHash = hasher.HashPassword(user, password);
        db.Users.Add(user);
    }

    private static List<T> ReadSeedFile<T>(string fileName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resource = assembly.GetManifestResourceNames().Single(name => name.EndsWith($".{fileName}"));
        using var stream = assembly.GetManifestResourceStream(resource)!;
        return JsonSerializer.Deserialize<List<T>>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
            ?? throw new InvalidOperationException($"Seed file {fileName} is empty.");
    }
}
