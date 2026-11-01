using System.Net;
using System.Net.Http.Json;

namespace HappyToys.API.Tests;

public class AdminManagementTests
{
    [Theory]
    [InlineData("/api/admin/reports/monthly")]
    [InlineData("/api/admin/customers")]
    public async Task New_admin_reports_are_for_admins_only(string url)
    {
        using var api = new TestApi();
        await (await api.CreateClient().GetAsync(url)).ErrorAsync(HttpStatusCode.Unauthorized);
        await (await (await api.CustomerAsync()).GetAsync(url)).ErrorAsync(HttpStatusCode.Forbidden);
        Assert.Equal(HttpStatusCode.OK, (await (await api.AdminAsync()).GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task Monthly_report_totals_this_months_orders_and_skips_cancelled()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();
        await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 2)));
        var toCancel = await (await api.Guest().PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p1", 1)))).DataAsync();
        await admin.PutAsJsonAsync($"/api/orders/{toCancel.GetProperty("id").GetString()}/status", new { status = "cancelled" });

        var report = await (await admin.GetAsync("/api/admin/reports/monthly?months=3")).DataAsync();
        Assert.Equal(3, report.GetArrayLength());
        Assert.Equal(1, report[0].GetProperty("orders").GetInt32());
        Assert.Equal(2, report[0].GetProperty("itemsSold").GetInt32());
        Assert.Equal(0, report[1].GetProperty("orders").GetInt32());

        await (await admin.GetAsync("/api/admin/reports/monthly?months=0")).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Customer_list_shows_orders_and_total_spent()
    {
        using var api = new TestApi();
        var customer = await api.CustomerAsync();
        await customer.PostAsJsonAsync("/api/orders", TestApi.OrderBody(("p10", 2)));

        var list = await (await (await api.AdminAsync()).GetAsync("/api/admin/customers")).DataAsync();
        var row = Assert.Single(list.EnumerateArray());
        Assert.Equal(1, row.GetProperty("orders").GetInt32());
        Assert.Equal(1798, row.GetProperty("totalSpent").GetDecimal());
        Assert.False(row.TryGetProperty("passwordHash", out _));
    }

    [Fact]
    public async Task Categories_can_be_added_renamed_and_deleted()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        var created = await admin.PostAsJsonAsync("/api/categories", new { name = "Water Toys", description = "Splash and play." });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.Equal("water-toys", (await created.DataAsync()).GetProperty("id").GetString());

        var renamed = await (await admin.PutAsJsonAsync("/api/categories/water-toys", new { name = "Pool Toys", description = "Fun in the pool." })).DataAsync();
        Assert.Equal("Pool Toys", renamed.GetProperty("name").GetString());

        Assert.Equal(HttpStatusCode.OK, (await admin.DeleteAsync("/api/categories/water-toys")).StatusCode);
        await (await admin.DeleteAsync("/api/categories/water-toys")).ErrorAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Category_rules_are_enforced()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        await (await admin.PostAsJsonAsync("/api/categories", new { name = "", description = "x" })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await admin.PostAsJsonAsync("/api/categories", new { name = "Soft Toys", description = "Duplicate." })).ErrorAsync(HttpStatusCode.Conflict);
        await (await admin.DeleteAsync("/api/categories/soft-toys")).ErrorAsync(HttpStatusCode.Conflict);

        var customer = await api.CustomerAsync();
        await (await customer.PostAsJsonAsync("/api/categories", new { name = "Sneaky", description = "x" })).ErrorAsync(HttpStatusCode.Forbidden);
        await (await api.CreateClient().DeleteAsync("/api/categories/soft-toys")).ErrorAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Coupons_can_be_added_edited_and_deleted()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        var created = await admin.PostAsJsonAsync("/api/admin/coupons", new { code = "diwali20", type = "Percentage", value = 20, minimumOrderAmount = 500, isActive = true });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var coupon = await created.DataAsync();
        Assert.Equal("DIWALI20", coupon.GetProperty("code").GetString());
        var id = coupon.GetProperty("id").GetInt32();

        var edited = await (await admin.PutAsJsonAsync($"/api/admin/coupons/{id}", new { code = "DIWALI20", type = "Percentage", value = 25, minimumOrderAmount = 500, isActive = false })).DataAsync();
        Assert.Equal(25, edited.GetProperty("value").GetDecimal());
        Assert.False(edited.GetProperty("isActive").GetBoolean());

        Assert.Equal(HttpStatusCode.OK, (await admin.DeleteAsync($"/api/admin/coupons/{id}")).StatusCode);
        await (await admin.DeleteAsync($"/api/admin/coupons/{id}")).ErrorAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Coupon_rules_are_enforced()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        await (await admin.PostAsJsonAsync("/api/admin/coupons", new { code = "HAPPY10", type = "Percentage", value = 10, minimumOrderAmount = 0, isActive = true })).ErrorAsync(HttpStatusCode.Conflict);
        await (await admin.PostAsJsonAsync("/api/admin/coupons", new { code = "BAD CODE", type = "Percentage", value = 10, minimumOrderAmount = 0, isActive = true })).ErrorAsync(HttpStatusCode.BadRequest);
        await (await admin.PostAsJsonAsync("/api/admin/coupons", new { code = "TOOMUCH", type = "Percentage", value = 150, minimumOrderAmount = 0, isActive = true })).ErrorAsync(HttpStatusCode.BadRequest);
    }
}
