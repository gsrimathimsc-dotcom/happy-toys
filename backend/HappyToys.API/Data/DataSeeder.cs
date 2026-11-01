using System.Text.Json;
using HappyToys.API.Models;
using Microsoft.AspNetCore.Identity;

namespace HappyToys.API.Data;

/// <summary>Fills the in-memory store with the mock data each time the app starts.</summary>
public static class DataSeeder
{
    // Published in the README on purpose: these are demo accounts only.
    public const string AdminEmail = "admin@happytoys.example";
    public const string AdminPassword = "Admin@123";
    public const string CustomerEmail = "demo@happytoys.example";
    public const string CustomerPassword = "Demo@123";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher<User> hasher)
    {
        if (db.Categories.Any()) return;

        db.Categories.AddRange(ReadSeedFile<Category>("categories.json"));

        var products = ReadSeedFile<Product>("products.json");
        foreach (var product in products)
        {
            product.CreatedDate = DateTime.SpecifyKind(product.CreatedDate, DateTimeKind.Utc);
        }
        db.Products.AddRange(products);

        db.Users.AddRange(
            CreateUser("demo-admin", "Demo Admin", AdminEmail, AdminPassword, UserRole.Admin, hasher),
            CreateUser("demo-customer", "Demo Customer", CustomerEmail, CustomerPassword, UserRole.Customer, hasher));

        await db.SaveChangesAsync();
    }

    private static List<T> ReadSeedFile<T>(string fileName)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", fileName);
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        return JsonSerializer.Deserialize<List<T>>(File.ReadAllText(path), options)
            ?? throw new InvalidOperationException($"Seed file {fileName} is empty.");
    }

    private static User CreateUser(
        string id, string name, string email, string password, UserRole role, IPasswordHasher<User> hasher)
    {
        var user = new User { Id = id, Name = name, Email = email, Role = role, CreatedDate = DateTime.UtcNow };
        user.PasswordHash = hasher.HashPassword(user, password);
        return user;
    }
}
