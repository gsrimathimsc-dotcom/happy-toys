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
