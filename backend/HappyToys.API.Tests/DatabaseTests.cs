using System.Net;
using System.Net.Http.Json;
using HappyToys.Infrastructure.Data;

namespace HappyToys.API.Tests;

/// <summary>Checks PostgreSQL itself: tables, rules, and data that outlives a restart.</summary>
public class DatabaseTests
{
    [Fact]
    public async Task All_16_required_tables_exist()
    {
        using var api = new TestApi();
        string[] tables =
        [
            "Users", "Roles", "UserAddresses", "Categories", "Products", "ProductImages", "Carts", "CartItems",
            "Wishlists", "WishlistItems", "Orders", "OrderItems", "Payments", "Reviews", "InventoryTransactions", "Coupons",
        ];

        foreach (var table in tables)
        {
            var found = await api.ScalarAsync(
                $"SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '{table}'");
            Assert.True(found == 1, $"Table {table} is missing");
        }
    }

    [Fact]
    public async Task Seed_data_is_loaded_and_consistent()
    {
        using var api = new TestApi();
        Assert.Equal(10, await api.ScalarAsync("""SELECT count(*) FROM "Categories" """));
        Assert.Equal(40, await api.ScalarAsync("""SELECT count(*) FROM "Products" """));
        Assert.Equal(40, await api.ScalarAsync("""SELECT count(*) FROM "ProductImages" """));
        Assert.Equal(2, await api.ScalarAsync("""SELECT count(*) FROM "Roles" """));
        Assert.Equal(2, await api.ScalarAsync("""SELECT count(*) FROM "Coupons" """));

        // Every category has products, and stock agrees with the inventory history.
        Assert.Equal(0, await api.ScalarAsync("""
            SELECT count(*) FROM "Categories" c
            WHERE NOT EXISTS (SELECT 1 FROM "Products" p WHERE p."CategoryId" = c."Id")
            """));
        Assert.Equal(0, await api.ScalarAsync("""
            SELECT count(*) FROM "Products" p
            WHERE p."StockQuantity" <> COALESCE(
                (SELECT sum(t."QuantityChange") FROM "InventoryTransactions" t WHERE t."ProductId" = p."Id"), 0)
            """));
    }

    [Fact]
    public async Task Passwords_are_stored_only_as_hashes()
    {
        using var api = new TestApi();
        Assert.Equal(0, await api.ScalarAsync(
            $"""SELECT count(*) FROM "Users" WHERE "PasswordHash" LIKE '%{TestApi.CustomerPassword}%' OR length("PasswordHash") < 60 """));
    }

    [Fact]
    public async Task Database_rules_block_bad_data_even_without_the_api()
    {
        using var api = new TestApi();

        await Assert.ThrowsAsync<Npgsql.PostgresException>(() =>
            api.ScalarAsync("""UPDATE "Products" SET "StockQuantity" = -1 WHERE "Id" = 'p1' RETURNING 1"""));
        await Assert.ThrowsAsync<Npgsql.PostgresException>(() =>
            api.ScalarAsync("""UPDATE "Products" SET "CategoryId" = 'nope' WHERE "Id" = 'p1' RETURNING 1"""));
        await Assert.ThrowsAsync<Npgsql.PostgresException>(() =>
            api.ScalarAsync("""INSERT INTO "Coupons" ("Code", "Type", "Value", "MinimumOrderAmount", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('HAPPY10', 'Percentage', 5, 0, true, now(), now()) RETURNING 1"""));
    }

    [Fact]
    public async Task Orders_accounts_and_carts_survive_a_server_restart()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        var order = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        var id = order.GetProperty("id").GetString();
        await customer.PostAsJsonAsync("/api/cart/items", new { productId = "p5", quantity = 2 });

        // A second copy of the API, sharing nothing with the first except PostgreSQL.
        using var restarted = api.WithWebHostBuilder(_ => { });
        var client = restarted.CreateClient();
        client.DefaultRequestHeaders.Authorization = customer.DefaultRequestHeaders.Authorization;

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/orders/{id}")).StatusCode);
        var cart = await (await client.GetAsync("/api/cart")).DataAsync();
        Assert.Equal(2, cart.GetProperty("totals").GetProperty("itemCount").GetInt32());
    }

    [Fact]
    public async Task Placing_an_order_writes_payment_stock_and_inventory_together()
    {
        using var api = new TestApi();
        var order = await (await api.Guest().PostAsJsonAsync("/api/orders", new
        {
            customer = TestApi.Customer(),
            paymentMethod = "upi",
            items = new[] { new { productId = "p6", quantity = 2 } },
        })).DataAsync();
        var id = order.GetProperty("id").GetString();

        Assert.Equal(1, await api.ScalarAsync($"""SELECT count(*) FROM "Payments" WHERE "OrderId" = '{id}' AND "Status" = 'Simulated' AND "Method" = 'Upi' """));
        Assert.Equal(1, await api.ScalarAsync($"""SELECT count(*) FROM "OrderItems" WHERE "OrderId" = '{id}' """));
        Assert.Equal(-2, await api.ScalarAsync($"""SELECT "QuantityChange" FROM "InventoryTransactions" WHERE "OrderId" = '{id}' AND "Reason" = 'Sale' """));
    }

    [Fact]
    public async Task A_refused_order_leaves_no_trace_in_the_database()
    {
        using var api = new TestApi();
        await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p6", 1), ("p9", 1)))).ErrorAsync(HttpStatusCode.Conflict);

        Assert.Equal(0, await api.ScalarAsync("""SELECT count(*) FROM "Orders" """));
        Assert.Equal(0, await api.ScalarAsync("""SELECT count(*) FROM "Payments" """));
        Assert.Equal(0, await api.ScalarAsync("""SELECT count(*) FROM "InventoryTransactions" WHERE "OrderId" IS NOT NULL"""));
    }

    [Fact]
    public async Task Cancelling_writes_a_stock_return_and_refunds_a_simulated_payment()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        var order = await (await customer.PostAsJsonAsync("/api/orders", new
        {
            customer = TestApi.Customer(),
            paymentMethod = "card",
            items = new[] { new { productId = "p6", quantity = 2 } },
        })).DataAsync();
        var id = order.GetProperty("id").GetString();

        await customer.PutAsJsonAsync($"/api/orders/{id}/status", new { status = "cancelled" });

        Assert.Equal(2, await api.ScalarAsync($"""SELECT "QuantityChange" FROM "InventoryTransactions" WHERE "OrderId" = '{id}' AND "Reason" = 'OrderCancelled' """));
        Assert.Equal(1, await api.ScalarAsync($"""SELECT count(*) FROM "Payments" WHERE "OrderId" = '{id}' AND "Status" = 'Refunded' """));
    }

    [Fact]
    public async Task Admin_stock_changes_are_recorded()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        var current = (await (await admin.GetAsync("/api/products/p6")).DataAsync()).GetProperty("product");

        var update = await admin.PutAsJsonAsync("/api/products/p6", new
        {
            name = current.GetProperty("name").GetString(),
            categoryId = current.GetProperty("categoryId").GetString(),
            brand = current.GetProperty("brand").GetString(),
            description = current.GetProperty("description").GetString(),
            price = current.GetProperty("price").GetDecimal(),
            originalPrice = current.GetProperty("originalPrice").GetDecimal(),
            imageUrl = current.GetProperty("imageUrl").GetString(),
            stockQuantity = 20,
        });

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(8, await api.ScalarAsync("""SELECT "QuantityChange" FROM "InventoryTransactions" WHERE "ProductId" = 'p6' AND "Reason" = 'AdminAdjustment' """));
    }

    [Theory]
    [InlineData("postgresql://neon_user:p%40ss@ep-cool.neon.tech/shop?sslmode=require", "ep-cool.neon.tech", "p@ss")]
    [InlineData("postgres://me:secret@db.example.com:6000/shop", "db.example.com", "secret")]
    public void Hosting_style_database_urls_are_understood(string url, string host, string password)
    {
        var builder = new Npgsql.NpgsqlConnectionStringBuilder(DatabaseConnection.FromUrl(url));
        Assert.Equal(host, builder.Host);
        Assert.Equal(password, builder.Password);
        Assert.Equal("shop", builder.Database);
    }
}
