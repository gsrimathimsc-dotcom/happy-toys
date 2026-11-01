using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using HappyToys.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace HappyToys.API.Tests;

/// <summary>
/// Starts the real API on a real PostgreSQL database, freshly copied for each test.
/// Set HAPPYTOYS_TEST_DB to a connection string for a server you can create databases on.
/// </summary>
public sealed class TestApi : WebApplicationFactory<Program>
{
    public const string AdminEmail = DataSeeder.AdminEmail;
    public const string AdminPassword = "Test-Admin-1";
    public const string CustomerPassword = "Test-Customer-1";
    private const string TemplateDatabase = "happytoys_test_template";

    private static readonly string ServerConnection = Environment.GetEnvironmentVariable("HAPPYTOYS_TEST_DB")
        ?? throw new InvalidOperationException("Set HAPPYTOYS_TEST_DB to run these tests (see SETUP_GUIDE.md).");

    // CREATE DATABASE allows one copy of the template at a time.
    private static readonly SemaphoreSlim CopyLock = new(1, 1);
    private static bool templateReady;

    private readonly string databaseName = $"happytoys_test_{Guid.NewGuid():N}";

    public TestApi()
    {
        PrepareDatabaseAsync().GetAwaiter().GetResult();
    }

    public string ConnectionString => Connection(databaseName);

    private static string Connection(string database) =>
        new NpgsqlConnectionStringBuilder(ServerConnection) { Database = database }.ConnectionString;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", ConnectionString);
        builder.UseSetting("Cors:AllowedOrigins:0", "http://localhost:5173");
    }

    private async Task PrepareDatabaseAsync()
    {
        await CopyLock.WaitAsync();
        try
        {
            if (!templateReady)
            {
                await BuildTemplateAsync();
                templateReady = true;
            }
            await ExecuteAsync($"""CREATE DATABASE "{databaseName}" TEMPLATE "{TemplateDatabase}" """);
        }
        finally
        {
            CopyLock.Release();
        }
    }

    /// <summary>Runs the real migrations and seed once, so every test starts from them.</summary>
    private static async Task BuildTemplateAsync()
    {
        await ExecuteAsync($"""DROP DATABASE IF EXISTS "{TemplateDatabase}" WITH (FORCE)""");
        await ExecuteAsync($"""CREATE DATABASE "{TemplateDatabase}" """);

        using (var builder = new SeedHost(Connection(TemplateDatabase)))
        {
            using var scope = builder.Services.CreateScope();
            await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<DataSeeder>().SeedAsync();
        }

        NpgsqlConnection.ClearAllPools();
    }

    private sealed class SeedHost(string connection) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:DefaultConnection", connection);
            builder.UseSetting("Seed:AdminPassword", AdminPassword);
            builder.UseSetting("Seed:CustomerPassword", CustomerPassword);
        }
    }

    private static async Task ExecuteAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(Connection("postgres"));
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Reads one number straight from the database, bypassing the API.</summary>
    public async Task<long> ScalarAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        return Convert.ToInt64(await command.ExecuteScalarAsync());
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            NpgsqlConnection.ClearAllPools();
            ExecuteAsync($"""DROP DATABASE IF EXISTS "{databaseName}" WITH (FORCE)""").GetAwaiter().GetResult();
        }
    }

    public HttpClient Guest(string guestId = "guest-1")
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Guest-Id", guestId);
        return client;
    }

    public async Task<HttpClient> LoginAsync(string email, string password)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/users/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var token = (await response.DataAsync()).GetProperty("token").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public Task<HttpClient> AdminAsync() => LoginAsync(AdminEmail, AdminPassword);

    public Task<HttpClient> CustomerAsync() => LoginAsync(DataSeeder.CustomerEmail, CustomerPassword);

    public static object Customer(string address = "12 Gandhi Road, Adyar") => new
    {
        name = "Priya Sharma",
        email = "priya@example.com",
        mobile = "9876543210",
        address,
        city = "Chennai",
        state = "Tamil Nadu",
        pinCode = "600020",
    };

    public static object OrderBody(params (string ProductId, int Quantity)[] lines) => new
    {
        customer = Customer(),
        paymentMethod = "cod",
        items = lines.Select(l => new { productId = l.ProductId, quantity = l.Quantity }).ToArray(),
    };
}

public static class ResponseExtensions
{
    public static async Task<JsonElement> JsonAsync(this HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<JsonElement>()).Clone();

    /// <summary>Checks the standard success shape and returns "data".</summary>
    public static async Task<JsonElement> DataAsync(this HttpResponseMessage response)
    {
        var json = await response.JsonAsync();
        Assert.True(json.GetProperty("success").GetBoolean(), json.ToString());
        return json.GetProperty("data");
    }

    /// <summary>Checks the status and the standard error shape, and returns the message.</summary>
    public static async Task<string> ErrorAsync(this HttpResponseMessage response, HttpStatusCode expected)
    {
        Assert.Equal(expected, response.StatusCode);
        Assert.Contains("application/json", response.Content.Headers.ContentType?.MediaType);
        var json = await response.JsonAsync();
        Assert.False(json.GetProperty("success").GetBoolean());
        var message = json.GetProperty("error").GetString();
        Assert.False(string.IsNullOrWhiteSpace(message));
        return message!;
    }

    public static Task<HttpResponseMessage> PostRawAsync(this HttpClient client, string url, string body) =>
        client.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"));
}
