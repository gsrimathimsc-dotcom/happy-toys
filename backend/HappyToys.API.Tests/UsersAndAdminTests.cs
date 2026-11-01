using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HappyToys.API.Tests;

public class UsersAndAdminTests
{
    private static object NewUser(string email = "new@example.com") =>
        new { name = "New User", email, password = "secret1" };

    [Fact]
    public async Task Register_then_login_works_and_ignores_email_case()
    {
        using var api = new TestApi();
        var client = api.CreateClient();

        var registered = await client.PostAsJsonAsync("/api/users/register", NewUser());
        Assert.Equal(HttpStatusCode.Created, registered.StatusCode);
        var data = await registered.DataAsync();
        Assert.Equal("customer", data.GetProperty("user").GetProperty("role").GetString());
        Assert.False(data.GetProperty("user").TryGetProperty("passwordHash", out _));

        var login = await client.PostAsJsonAsync("/api/users/login", new { email = "NEW@example.com", password = "secret1" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task Registration_is_validated()
    {
        using var api = new TestApi();
        var client = api.CreateClient();

        await client.PostAsJsonAsync("/api/users/register", NewUser());
        await (await client.PostAsJsonAsync("/api/users/register", NewUser("NEW@example.com"))).ErrorAsync(HttpStatusCode.Conflict);
        await (await client.PostAsJsonAsync("/api/users/register", new { name = "A", email = "bad", password = "1" })).ErrorAsync(HttpStatusCode.BadRequest);

        var response = await client.PostAsJsonAsync("/api/users/register", new { name = "Valid Name", email = "a@b.co", password = "1" });
        var json = await response.JsonAsync();
        Assert.True(json.GetProperty("errors").TryGetProperty("password", out _));
    }

    [Theory]
    [InlineData("demo@happytoys.example", "wrong-password")]
    [InlineData("nobody@example.com", "any-password")]
    public async Task Wrong_login_details_are_refused(string email, string password)
    {
        using var api = new TestApi();
        var response = await api.CreateClient().PostAsJsonAsync("/api/users/login", new { email, password });
        Assert.Equal("Incorrect email or password.", await response.ErrorAsync(HttpStatusCode.Unauthorized));
    }

    [Fact]
    public async Task Profile_can_be_read_and_edited()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();

        var updated = await (await customer.PutAsJsonAsync("/api/users/profile", new
        {
            name = "Renamed",
            mobile = "9876543210",
            address = "1 Main Road",
            city = "Chennai",
            state = "Tamil Nadu",
            pinCode = "600020",
        })).DataAsync();
        Assert.Equal("Renamed", updated.GetProperty("name").GetString());

        var profile = await (await customer.GetAsync("/api/users/profile")).DataAsync();
        Assert.Equal("600020", profile.GetProperty("pinCode").GetString());

        await (await customer.PutAsJsonAsync("/api/users/profile", new { name = "X", mobile = "1" })).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Profile_needs_a_valid_session()
    {
        using var api = new TestApi();
        await (await api.CreateClient().GetAsync("/api/users/profile")).ErrorAsync(HttpStatusCode.Unauthorized);

        var fake = api.CreateClient();
        fake.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "made-up");
        await (await fake.GetAsync("/api/users/profile")).ErrorAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_ends_the_session()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();

        await (await customer.PostAsync("/api/users/logout", null)).DataAsync();
        await (await customer.GetAsync("/api/users/profile")).ErrorAsync(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("/api/admin/dashboard")]
    [InlineData("/api/admin/orders")]
    [InlineData("/api/admin/products")]
    [InlineData("/api/admin/offers")]
    [InlineData("/api/admin/reports/daily")]
    public async Task Admin_endpoints_are_for_admins_only(string url)
    {
        using var api = new TestApi();
        await (await api.CreateClient().GetAsync(url)).ErrorAsync(HttpStatusCode.Unauthorized);
        await (await (await api.CustomerAsync()).GetAsync(url)).ErrorAsync(HttpStatusCode.Forbidden);
        Assert.Equal(HttpStatusCode.OK, (await (await api.AdminAsync()).GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task Dashboard_reports_sales_and_ignores_cancelled_orders()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        var customer = await api.CustomerAsync();

        await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 2)));
        var toCancel = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p1", 1)))).DataAsync();
        await customer.PutAsJsonAsync($"/api/orders/{toCancel.GetProperty("id").GetString()}/status", new { status = "cancelled" });

        var data = await (await admin.GetAsync("/api/admin/dashboard")).DataAsync();
        Assert.Equal(40, data.GetProperty("totalProducts").GetInt32());
        Assert.Equal(2, data.GetProperty("totalOrders").GetInt32());
        Assert.Equal(1, data.GetProperty("totalCustomers").GetInt32());
        Assert.Equal(1798, data.GetProperty("totalSales").GetDecimal());
        Assert.Equal(2, data.GetProperty("recentOrders").GetArrayLength());
        Assert.Equal("p10", data.GetProperty("bestSellingProducts")[0].GetProperty("productId").GetString());
        Assert.Equal(2, data.GetProperty("bestSellingProducts")[0].GetProperty("unitsSold").GetInt32());

        var overview = data.GetProperty("salesOverview");
        Assert.Equal(7, overview.GetArrayLength());
        Assert.Equal(1798, overview[6].GetProperty("sales").GetDecimal());
    }

    [Fact]
    public async Task Dashboard_counts_stock_offers_and_today()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 2), ("p5", 1)));

        var data = await (await admin.GetAsync("/api/admin/dashboard")).DataAsync();
        Assert.Equal(1, data.GetProperty("outOfStockProducts").GetInt32());
        Assert.True(data.GetProperty("lowStockProducts").GetInt32() > 0);
        Assert.Equal(1, data.GetProperty("openOrders").GetInt32());
        Assert.Equal(2, data.GetProperty("activeCoupons").GetInt32());
        Assert.True(data.GetProperty("productsOnOffer").GetInt32() > 0);
        Assert.Equal(1, data.GetProperty("today").GetProperty("orders").GetInt32());
        Assert.Equal(3, data.GetProperty("today").GetProperty("itemsSold").GetInt32());
        Assert.Equal(2097, data.GetProperty("today").GetProperty("sales").GetDecimal());
    }

    [Fact]
    public async Task Daily_report_lists_each_days_items_and_total()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 2)));
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1), ("p5", 4)));

        var report = await (await admin.GetAsync("/api/admin/reports/daily?days=7")).DataAsync();
        Assert.Equal(7, report.GetArrayLength());

        var today = report[0];
        Assert.Equal(2, today.GetProperty("orders").GetInt32());
        Assert.Equal(7, today.GetProperty("itemsSold").GetInt32());
        Assert.Equal(3893, today.GetProperty("sales").GetDecimal());

        var items = today.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(2, items.Count);
        Assert.Equal("p5", items[0].GetProperty("productId").GetString());
        Assert.Equal(1196, items[0].GetProperty("amount").GetDecimal());

        await (await admin.GetAsync("/api/admin/reports/daily?days=0")).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Cancelled_orders_are_left_out_of_the_daily_report()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        var order = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        await admin.PutAsJsonAsync($"/api/orders/{order.GetProperty("id").GetString()}/status", new { status = "cancelled" });

        var report = await (await admin.GetAsync("/api/admin/reports/daily?days=1")).DataAsync();
        Assert.Equal(0, report[0].GetProperty("itemsSold").GetInt32());
    }

    [Fact]
    public async Task Offers_list_discounted_products_and_coupons()
    {
        using var api = new TestApi();
        var data = await (await (await api.AdminAsync()).GetAsync("/api/admin/offers")).DataAsync();

        var discounts = data.GetProperty("productsOnOffer").EnumerateArray().Select(p => p.GetProperty("discountPercentage").GetInt32()).ToList();
        Assert.Equal(discounts.OrderDescending(), discounts);
        Assert.Contains(data.GetProperty("coupons").EnumerateArray(), c => c.GetProperty("code").GetString() == "HAPPY10");
    }

    [Fact]
    public async Task Only_admins_can_change_stock_and_changes_are_validated()
    {
        using var api = new TestApi();
        var body = new { stockQuantity = 50 };
        await (await api.CreateClient().PatchAsJsonAsync("/api/products/p6/stock", body)).ErrorAsync(HttpStatusCode.Unauthorized);
        await (await (await api.CustomerAsync()).PatchAsJsonAsync("/api/products/p6/stock", body)).ErrorAsync(HttpStatusCode.Forbidden);

        var admin = await api.AdminAsync();
        await (await admin.PatchAsJsonAsync("/api/products/p6/stock", new { stockQuantity = -1 })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await admin.PatchAsJsonAsync("/api/products/nope/stock", body)).ErrorAsync(HttpStatusCode.NotFound);

        var updated = await (await admin.PatchAsJsonAsync("/api/products/p6/stock", body)).DataAsync();
        Assert.Equal(50, updated.GetProperty("stockQuantity").GetInt32());
        Assert.Equal("in-stock", updated.GetProperty("stockStatus").GetString());
        Assert.Equal(38, await api.ScalarAsync("""SELECT "QuantityChange" FROM "InventoryTransactions" WHERE "ProductId" = 'p6' AND "Reason" = 'AdminAdjustment' """));
    }

    [Fact]
    public async Task Admin_orders_can_be_filtered_by_status()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        var order = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        await admin.PutAsJsonAsync($"/api/orders/{order.GetProperty("id").GetString()}/status", new { status = "processing" });

        Assert.Equal(1, (await (await admin.GetAsync("/api/admin/orders")).DataAsync()).GetArrayLength());
        Assert.Equal(1, (await (await admin.GetAsync("/api/admin/orders?status=processing")).DataAsync()).GetArrayLength());
        Assert.Equal(0, (await (await admin.GetAsync("/api/admin/orders?status=shipped")).DataAsync()).GetArrayLength());
    }

    [Fact]
    public async Task Wrong_http_methods_and_frontend_cors_are_handled()
    {
        using var api = new TestApi();
        var client = api.CreateClient();

        await (await client.DeleteAsync("/api/categories")).ErrorAsync(HttpStatusCode.MethodNotAllowed);

        var preflight = new HttpRequestMessage(HttpMethod.Options, "/api/products");
        preflight.Headers.Add("Origin", "http://localhost:5173");
        preflight.Headers.Add("Access-Control-Request-Method", "GET");
        var response = await client.SendAsync(preflight);
        Assert.Equal("http://localhost:5173", response.Headers.GetValues("Access-Control-Allow-Origin").Single());
    }

    [Fact]
    public async Task Swagger_documents_every_required_endpoint()
    {
        using var api = new TestApi();
        var swagger = await (await api.CreateClient().GetAsync("/swagger/v1/swagger.json")).JsonAsync();
        var paths = swagger.GetProperty("paths");

        (string Path, string Method)[] required =
        [
            ("/api/products", "get"), ("/api/products/{id}", "get"), ("/api/products/search", "get"),
            ("/api/products/category/{categoryId}", "get"), ("/api/products", "post"),
            ("/api/products/{id}", "put"), ("/api/products/{id}", "delete"),
            ("/api/categories", "get"), ("/api/categories/{id}", "get"),
            ("/api/cart", "get"), ("/api/cart/items", "post"),
            ("/api/cart/items/{id}", "put"), ("/api/cart/items/{id}", "delete"),
            ("/api/wishlist", "get"), ("/api/wishlist", "post"), ("/api/wishlist/{productId}", "delete"),
            ("/api/orders", "post"), ("/api/orders", "get"), ("/api/orders/{id}", "get"), ("/api/orders/{id}/status", "put"),
            ("/api/users/register", "post"), ("/api/users/login", "post"),
            ("/api/users/profile", "get"), ("/api/users/profile", "put"),
            ("/api/admin/dashboard", "get"), ("/api/admin/orders", "get"), ("/api/admin/products", "get"),
        ];

        Assert.Equal(27, required.Length);
        Assert.All(required, endpoint => Assert.True(
            paths.TryGetProperty(endpoint.Path, out var path) && path.TryGetProperty(endpoint.Method, out _),
            $"{endpoint.Method} {endpoint.Path} is missing"));
    }
}
