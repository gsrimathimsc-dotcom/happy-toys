using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace HappyToys.API.Tests;

public class OrdersTests
{
    private const string LimitedProduct = "p6";
    private const int LimitedStock = 12;

    private static async Task<int> StockOfAsync(TestApi api, string productId)
    {
        var data = await (await api.Guest().GetAsync($"/api/products/{productId}")).DataAsync();
        return data.GetProperty("product").GetProperty("stockQuantity").GetInt32();
    }

    [Fact]
    public async Task Guest_can_place_an_order_with_server_prices()
    {
        using var api = new TestApi();
        var response = await api.Guest().PostAsJsonAsync("/api/orders", new
        {
            customer = TestApi.Customer(),
            paymentMethod = "upi",
            // Extra price fields from a tampered browser must be ignored.
            items = new[] { new { productId = "p10", quantity = 2, price = 1 } },
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.DataAsync();
        Assert.Matches(new Regex(@"^HT-\d{8}-[0-9A-F]{8}$"), order.GetProperty("id").GetString());
        Assert.Equal("confirmed", order.GetProperty("status").GetString());
        Assert.Equal("upi", order.GetProperty("paymentMethod").GetString());
        Assert.Equal("Tamil Nadu", order.GetProperty("customer").GetProperty("state").GetString());
        Assert.Equal(1798, order.GetProperty("totals").GetProperty("total").GetDecimal());

        var id = order.GetProperty("id").GetString();
        var fetched = await (await api.Guest().GetAsync($"/api/orders/{id}")).DataAsync();
        Assert.Equal(id, fetched.GetProperty("id").GetString());
    }

    [Fact]
    public async Task Order_reduces_stock()
    {
        using var api = new TestApi();
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody((LimitedProduct, 2)));
        Assert.Equal(LimitedStock - 2, await StockOfAsync(api, LimitedProduct));
    }

    [Fact]
    public async Task Splitting_a_product_across_lines_cannot_beat_the_stock_limit()
    {
        using var api = new TestApi();
        var response = await api.Guest().PostAsJsonAsync("/api/orders",
            TestApi.OrderBody((LimitedProduct, LimitedStock), (LimitedProduct, LimitedStock)));

        await response.ErrorAsync(HttpStatusCode.Conflict);
        Assert.Equal(LimitedStock, await StockOfAsync(api, LimitedProduct));
    }

    [Fact]
    public async Task Duplicate_lines_within_stock_are_merged()
    {
        using var api = new TestApi();
        var order = await (await api.Guest().PostAsJsonAsync("/api/orders",
            TestApi.OrderBody((LimitedProduct, 1), (LimitedProduct, 2)))).DataAsync();

        Assert.Equal(1, order.GetProperty("items").GetArrayLength());
        Assert.Equal(3, order.GetProperty("items")[0].GetProperty("quantity").GetInt32());
    }

    [Fact]
    public async Task A_failed_order_changes_no_stock()
    {
        using var api = new TestApi();
        var response = await api.Guest().PostAsJsonAsync("/api/orders",
            TestApi.OrderBody((LimitedProduct, 1), ("p9", 1)));

        await response.ErrorAsync(HttpStatusCode.Conflict);
        Assert.Equal(LimitedStock, await StockOfAsync(api, LimitedProduct));
    }

    [Fact]
    public async Task Stock_never_oversells_when_customers_order_at_the_same_time()
    {
        using var api = new TestApi();
        var attempts = Enumerable.Range(0, 30).Select(_ =>
            api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody((LimitedProduct, 1))));

        var responses = await Task.WhenAll(attempts);

        Assert.Equal(LimitedStock, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        Assert.Equal(30 - LimitedStock, responses.Count(r => r.StatusCode == HttpStatusCode.Conflict));
        Assert.Equal(0, await StockOfAsync(api, LimitedProduct));
    }

    [Fact]
    public async Task Order_numbers_are_unique()
    {
        using var api = new TestApi();
        var ids = new HashSet<string>();
        for (var i = 0; i < 12; i++)
        {
            var order = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
            Assert.True(ids.Add(order.GetProperty("id").GetString()!));
        }
    }

    [Theory]
    [InlineData("null")]
    [InlineData("{broken")]
    [InlineData("""{"customer":{"name":123},"paymentMethod":"cod","items":[{"productId":"p1","quantity":1}]}""")]
    [InlineData("""{"customer":null,"paymentMethod":"cod","items":[{"productId":"p1","quantity":1}]}""")]
    [InlineData("""{"paymentMethod":"cod","items":[null]}""")]
    [InlineData("""{"paymentMethod":"cod","items":null}""")]
    public async Task Malformed_orders_get_a_clear_error_instead_of_crashing(string body)
    {
        using var api = new TestApi();
        await (await api.Guest().PostRawAsync("/api/orders", body)).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Null_line_with_valid_customer_is_rejected()
    {
        using var api = new TestApi();
        var response = await api.Guest().PostAsJsonAsync("/api/orders", new
        {
            customer = TestApi.Customer(),
            paymentMethod = "cod",
            items = new object?[] { null },
        });
        await response.ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Order_fields_are_validated()
    {
        using var api = new TestApi();
        var guest = api.Guest();
        var items = new[] { new { productId = "p10", quantity = 1 } };

        // Address too short: the same 10-character rule as the checkout form.
        var shortAddress = await guest.PostAsJsonAsync("/api/orders", new { customer = TestApi.Customer("x"), paymentMethod = "cod", items });
        Assert.Contains("address", await shortAddress.ErrorAsync(HttpStatusCode.BadRequest));

        var noState = new { name = "A", email = "a@b.co", mobile = "9876543210", address = "12 Gandhi Road", city = "Chennai", pinCode = "600020" };
        var missingState = await guest.PostAsJsonAsync("/api/orders", new { customer = noState, paymentMethod = "cod", items });
        Assert.Contains("State", await missingState.ErrorAsync(HttpStatusCode.BadRequest));

        var badMobile = new { name = "A", email = "a@b.co", mobile = "123", address = "12 Gandhi Road", city = "C", state = "S", pinCode = "600020" };
        await (await guest.PostAsJsonAsync("/api/orders", new { customer = badMobile, paymentMethod = "cod", items })).ErrorAsync(HttpStatusCode.BadRequest);

        // Net Banking is not one of the three required payment methods.
        await (await guest.PostAsJsonAsync("/api/orders", new { customer = TestApi.Customer(), paymentMethod = "netbanking", items })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostAsJsonAsync("/api/orders", new { customer = TestApi.Customer(), paymentMethod = "cod", items = Array.Empty<object>() })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("nope", 1)))).ErrorAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Order_history_shows_only_your_own_orders()
    {
        using var api = new TestApi();
        await (await api.CreateClient().GetAsync("/api/orders")).ErrorAsync(HttpStatusCode.Unauthorized);

        var customer = await api.CustomerAsync();
        var mine = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)));

        var history = await (await customer.GetAsync("/api/orders")).DataAsync();
        Assert.Equal(1, history.GetArrayLength());
        Assert.Equal(mine.GetProperty("id").GetString(), history[0].GetProperty("id").GetString());
    }

    [Fact]
    public async Task An_accounts_order_is_hidden_from_other_people()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        var order = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        var id = order.GetProperty("id").GetString();

        Assert.Equal(HttpStatusCode.OK, (await customer.GetAsync($"/api/orders/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await (await api.AdminAsync()).GetAsync($"/api/orders/{id}")).StatusCode);
        await (await api.CreateClient().GetAsync($"/api/orders/{id}")).ErrorAsync(HttpStatusCode.NotFound);
        await (await api.CreateClient().GetAsync("/api/orders/HT-00000000-00000000")).ErrorAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Admin_moves_an_order_through_its_stages()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        var order = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        var url = $"/api/orders/{order.GetProperty("id").GetString()}/status";

        // Stages cannot be skipped.
        await (await admin.PutAsJsonAsync(url, new { status = "delivered" })).ErrorAsync(HttpStatusCode.Conflict);

        foreach (var status in new[] { "processing", "shipped", "delivered" })
        {
            var updated = await (await admin.PutAsJsonAsync(url, new { status })).DataAsync();
            Assert.Equal(status, updated.GetProperty("status").GetString());
        }

        await (await admin.PutAsJsonAsync(url, new { status = "cancelled" })).ErrorAsync(HttpStatusCode.Conflict);
        await (await admin.PutAsJsonAsync(url, new { status = "wrong" })).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Customer_can_cancel_their_order_and_stock_returns()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        var order = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody((LimitedProduct, 2)))).DataAsync();
        Assert.True(order.GetProperty("canCancel").GetBoolean());
        var url = $"/api/orders/{order.GetProperty("id").GetString()}/status";

        await (await customer.PutAsJsonAsync(url, new { status = "shipped" })).ErrorAsync(HttpStatusCode.Forbidden);

        var cancelled = await (await customer.PutAsJsonAsync(url, new { status = "cancelled" })).DataAsync();
        Assert.Equal("cancelled", cancelled.GetProperty("status").GetString());
        Assert.False(cancelled.GetProperty("canCancel").GetBoolean());
        Assert.Equal(LimitedStock, await StockOfAsync(api, LimitedProduct));

        // Cancelling twice must not return the stock twice.
        await (await customer.PutAsJsonAsync(url, new { status = "cancelled" })).ErrorAsync(HttpStatusCode.Conflict);
        Assert.Equal(LimitedStock, await StockOfAsync(api, LimitedProduct));
    }

    [Fact]
    public async Task Customer_cannot_cancel_after_shipping_or_touch_other_orders()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        var admin = await api.AdminAsync();
        var order = await (await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        var url = $"/api/orders/{order.GetProperty("id").GetString()}/status";

        await admin.PutAsJsonAsync(url, new { status = "processing" });
        await admin.PutAsJsonAsync(url, new { status = "shipped" });
        await (await customer.PutAsJsonAsync(url, new { status = "cancelled" })).ErrorAsync(HttpStatusCode.Conflict);

        var guestOrder = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 1)))).DataAsync();
        var guestUrl = $"/api/orders/{guestOrder.GetProperty("id").GetString()}/status";
        await (await customer.PutAsJsonAsync(guestUrl, new { status = "cancelled" })).ErrorAsync(HttpStatusCode.NotFound);
        await (await api.CreateClient().PutAsJsonAsync(guestUrl, new { status = "cancelled" })).ErrorAsync(HttpStatusCode.Unauthorized);
    }
}
