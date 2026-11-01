using System.Net;
using System.Net.Http.Json;

namespace HappyToys.API.Tests;

public class CartAndWishlistTests
{
    // p6 has 12 in stock and p9 is out of stock in the seed data.
    private const string LimitedProduct = "p6";
    private const int LimitedStock = 12;
    private const string OutOfStockProduct = "p9";

    [Fact]
    public async Task Cart_supports_add_update_and_remove()
    {
        using var api = new TestApi();
        var guest = api.Guest();

        var added = await guest.PostAsJsonAsync("/api/cart/items", new { productId = "p10", quantity = 2 });
        Assert.Equal(HttpStatusCode.Created, added.StatusCode);

        // Adding the same product again increases the quantity.
        var cart = await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = "p10", quantity = 1 })).DataAsync();
        Assert.Equal(1, cart.GetProperty("items").GetArrayLength());
        Assert.Equal(3, cart.GetProperty("totals").GetProperty("itemCount").GetInt32());

        var updated = await (await guest.PutAsJsonAsync("/api/cart/items/p10", new { quantity = 1 })).DataAsync();
        Assert.Equal(1, updated.GetProperty("totals").GetProperty("itemCount").GetInt32());

        var fromGet = await (await guest.GetAsync("/api/cart")).DataAsync();
        Assert.Equal(1, fromGet.GetProperty("items").GetArrayLength());

        var removed = await (await guest.DeleteAsync("/api/cart/items/p10")).DataAsync();
        Assert.Equal(0, removed.GetProperty("items").GetArrayLength());
        Assert.Equal(0, removed.GetProperty("totals").GetProperty("deliveryFee").GetDecimal());
    }

    [Fact]
    public async Task Delivery_is_charged_below_999_and_free_from_999()
    {
        using var api = new TestApi();
        var guest = api.Guest();

        // Rainbow Stacking Rings: ₹299 (MRP ₹449).
        var one = await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = "p5", quantity = 1 })).DataAsync();
        var totals = one.GetProperty("totals");
        Assert.Equal(49, totals.GetProperty("deliveryFee").GetDecimal());
        Assert.Equal(449, totals.GetProperty("subtotal").GetDecimal());
        Assert.Equal(150, totals.GetProperty("discount").GetDecimal());
        Assert.Equal(348, totals.GetProperty("total").GetDecimal());

        var four = await (await guest.PutAsJsonAsync("/api/cart/items/p5", new { quantity = 4 })).DataAsync();
        Assert.Equal(0, four.GetProperty("totals").GetProperty("deliveryFee").GetDecimal());
        Assert.Equal(1196, four.GetProperty("totals").GetProperty("total").GetDecimal());
    }

    [Fact]
    public async Task Carts_are_private_to_each_visitor()
    {
        using var api = new TestApi();
        await api.Guest("a").PostAsJsonAsync("/api/cart/items", new { productId = "p10", quantity = 1 });
        var other = await (await api.Guest("b").GetAsync("/api/cart")).DataAsync();
        Assert.Equal(0, other.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task Cart_checks_stock()
    {
        using var api = new TestApi();
        var guest = api.Guest();

        await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = OutOfStockProduct, quantity = 1 })).ErrorAsync(HttpStatusCode.Conflict);
        await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = LimitedProduct, quantity = LimitedStock + 1 })).ErrorAsync(HttpStatusCode.Conflict);

        await guest.PostAsJsonAsync("/api/cart/items", new { productId = LimitedProduct, quantity = LimitedStock });
        await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = LimitedProduct, quantity = 1 })).ErrorAsync(HttpStatusCode.Conflict);
        await (await guest.PutAsJsonAsync($"/api/cart/items/{LimitedProduct}", new { quantity = LimitedStock + 1 })).ErrorAsync(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Cart_requests_are_validated()
    {
        using var api = new TestApi();
        var guest = api.Guest();

        await (await guest.PostRawAsync("/api/cart/items", "null")).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostRawAsync("/api/cart/items", "{not json")).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostRawAsync("/api/cart/items", """{"productId":"p1","quantity":true}""")).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = "p1", quantity = 0 })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await guest.PostAsJsonAsync("/api/cart/items", new { productId = "nope", quantity = 1 })).ErrorAsync(HttpStatusCode.NotFound);
        await (await guest.PutAsJsonAsync("/api/cart/items/p1", new { quantity = 1 })).ErrorAsync(HttpStatusCode.NotFound);
        await (await guest.DeleteAsync("/api/cart/items/p1")).ErrorAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Server_cart_needs_a_login_or_guest_id()
    {
        using var api = new TestApi();
        await (await api.CreateClient().GetAsync("/api/cart")).ErrorAsync(HttpStatusCode.BadRequest);
        await (await api.CreateClient().GetAsync("/api/wishlist")).ErrorAsync(HttpStatusCode.BadRequest);

        var customer = await api.CustomerAsync();
        Assert.Equal(HttpStatusCode.OK, (await customer.GetAsync("/api/cart")).StatusCode);
    }

    [Fact]
    public async Task Browser_cart_is_corrected_to_current_prices_and_stock()
    {
        using var api = new TestApi();
        var data = await (await api.CreateClient().PostAsJsonAsync("/api/cart/validate", new
        {
            items = new object[]
            {
                new { productId = "p10", quantity = 1 },
                new { productId = LimitedProduct, quantity = 500 },
                new { productId = OutOfStockProduct, quantity = 1 },
                new { productId = "gone", quantity = 1 },
            },
        })).DataAsync();

        Assert.False(data.GetProperty("isValid").GetBoolean());
        Assert.Equal(3, data.GetProperty("issues").GetArrayLength());

        var lines = data.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(2, lines.Count);
        Assert.Equal(899, lines[0].GetProperty("price").GetDecimal());
        Assert.Equal(LimitedStock, lines[1].GetProperty("quantity").GetInt32());
    }

    [Fact]
    public async Task Valid_browser_cart_is_accepted_unchanged()
    {
        using var api = new TestApi();
        var data = await (await api.CreateClient().PostAsJsonAsync("/api/cart/validate", new
        {
            items = new[] { new { productId = "p10", quantity = 2 } },
        })).DataAsync();

        Assert.True(data.GetProperty("isValid").GetBoolean());
        Assert.Equal(1798, data.GetProperty("totals").GetProperty("total").GetDecimal());
    }

    [Fact]
    public async Task Wishlist_supports_add_view_and_remove()
    {
        using var api = new TestApi();
        var guest = api.Guest();

        Assert.Equal(HttpStatusCode.Created, (await guest.PostAsJsonAsync("/api/wishlist", new { productId = "p10" })).StatusCode);

        // Adding twice keeps one entry.
        var list = await (await guest.PostAsJsonAsync("/api/wishlist", new { productId = "p10" })).DataAsync();
        Assert.Equal(1, list.GetArrayLength());
        Assert.Equal("p10", list[0].GetProperty("id").GetString());

        Assert.Equal(1, (await (await guest.GetAsync("/api/wishlist")).DataAsync()).GetArrayLength());

        var removed = await (await guest.DeleteAsync("/api/wishlist/p10")).DataAsync();
        Assert.Equal(0, removed.GetArrayLength());
        await (await guest.DeleteAsync("/api/wishlist/p10")).ErrorAsync(HttpStatusCode.NotFound);
        await (await guest.PostAsJsonAsync("/api/wishlist", new { productId = "nope" })).ErrorAsync(HttpStatusCode.NotFound);
    }
}
