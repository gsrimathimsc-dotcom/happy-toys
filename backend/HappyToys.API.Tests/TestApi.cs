using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using HappyToys.API.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace HappyToys.API.Tests;

/// <summary>Starts the real API with its own private copy of the data for one test.</summary>
public sealed class TestApi : WebApplicationFactory<Program>
{
    public const string AdminEmail = DataSeeder.AdminEmail;
    public const string AdminPassword = DataSeeder.AdminPassword;

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("Database:Name", $"test-{Guid.NewGuid():N}");

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

    public Task<HttpClient> CustomerAsync() => LoginAsync(DataSeeder.CustomerEmail, DataSeeder.CustomerPassword);

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
