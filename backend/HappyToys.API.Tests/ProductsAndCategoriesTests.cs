using System.Net;
using System.Net.Http.Json;

namespace HappyToys.API.Tests;

public class ProductsAndCategoriesTests
{
    private static object NewProduct(decimal price = 500, decimal originalPrice = 1000) => new
    {
        name = "Test Kite",
        categoryId = "outdoor-toys",
        brand = "SkyFun",
        description = "A kite for testing.",
        price,
        originalPrice,
        imageUrl = "/images/products/p1.svg",
        stockQuantity = 5,
    };

    [Fact]
    public async Task All_products_are_paged_and_sorted_by_popularity()
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync("/api/products?pageSize=5&page=2")).DataAsync();

        Assert.Equal(40, data.GetProperty("totalCount").GetInt32());
        Assert.Equal(5, data.GetProperty("items").GetArrayLength());
        Assert.Equal(8, data.GetProperty("totalPages").GetInt32());

        var all = await (await api.Guest().GetAsync("/api/products?pageSize=100")).DataAsync();
        var reviews = all.GetProperty("items").EnumerateArray().Select(p => p.GetProperty("reviewCount").GetInt32()).ToList();
        Assert.Equal(reviews.OrderByDescending(r => r), reviews);
    }

    [Theory]
    [InlineData("price-asc")]
    [InlineData("price-desc")]
    public async Task Sorting_by_price_works(string sort)
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync($"/api/products?pageSize=100&sort={sort}")).DataAsync();
        var prices = data.GetProperty("items").EnumerateArray().Select(p => p.GetProperty("price").GetDecimal()).ToList();
        Assert.Equal(sort == "price-asc" ? prices.Order() : prices.OrderDescending(), prices);
    }

    [Fact]
    public async Task Filters_can_be_combined()
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync(
            "/api/products?category=soft-toys&minPrice=100&maxPrice=1000&minRating=4&inStock=true&pageSize=100")).DataAsync();

        Assert.True(data.GetProperty("totalCount").GetInt32() > 0);
        foreach (var product in data.GetProperty("items").EnumerateArray())
        {
            Assert.Equal("soft-toys", product.GetProperty("categoryId").GetString());
            Assert.InRange(product.GetProperty("price").GetDecimal(), 100, 1000);
            Assert.True(product.GetProperty("rating").GetDouble() >= 4);
            Assert.True(product.GetProperty("stockQuantity").GetInt32() > 0);
        }
    }

    [Theory]
    [InlineData("featured", "isFeatured")]
    [InlineData("best-sellers", "isBestSeller")]
    [InlineData("new-arrivals", "isNew")]
    public async Task Home_page_collections_only_return_matching_products(string collection, string flag)
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync($"/api/products?collection={collection}&pageSize=100")).DataAsync();
        Assert.True(data.GetProperty("totalCount").GetInt32() > 0);
        Assert.All(data.GetProperty("items").EnumerateArray(), p => Assert.True(p.GetProperty(flag).GetBoolean()));
    }

    [Fact]
    public async Task Search_matches_every_word_in_any_order()
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync("/api/products/search?q=bear%20teddy")).DataAsync();
        Assert.Contains(data.GetProperty("items").EnumerateArray(), p => p.GetProperty("id").GetString() == "p10");

        var none = await (await api.Guest().GetAsync("/api/products/search?q=teddy%20zzzzz")).DataAsync();
        Assert.Equal(0, none.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task Search_needs_a_search_term()
    {
        using var api = new TestApi();
        await (await api.Guest().GetAsync("/api/products/search")).ErrorAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Products_by_category_returns_only_that_category()
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync("/api/products/category/soft-toys")).DataAsync();
        Assert.Equal(4, data.GetProperty("totalCount").GetInt32());
    }

    [Theory]
    [InlineData("/api/products?category=nope", HttpStatusCode.NotFound)]
    [InlineData("/api/products/category/nope", HttpStatusCode.NotFound)]
    [InlineData("/api/products/nope", HttpStatusCode.NotFound)]
    [InlineData("/api/categories/nope", HttpStatusCode.NotFound)]
    [InlineData("/api/does-not-exist", HttpStatusCode.NotFound)]
    [InlineData("/api/products?minPrice=9000&maxPrice=1", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?minPrice=-1", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?minPrice=abc", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?sort=zzz", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?collection=zzz", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?page=0", HttpStatusCode.BadRequest)]
    [InlineData("/api/products?pageSize=1000", HttpStatusCode.BadRequest)]
    public async Task Bad_requests_get_a_clear_error(string url, HttpStatusCode expected)
    {
        using var api = new TestApi();
        await (await api.Guest().GetAsync(url)).ErrorAsync(expected);
    }

    [Fact]
    public async Task Product_details_include_related_products_but_not_itself()
    {
        using var api = new TestApi();
        var data = await (await api.Guest().GetAsync("/api/products/p10")).DataAsync();

        Assert.Equal("p10", data.GetProperty("product").GetProperty("id").GetString());
        Assert.Equal("Soft Toys", data.GetProperty("product").GetProperty("categoryName").GetString());
        Assert.NotEmpty(data.GetProperty("product").GetProperty("specifications").EnumerateObject());

        var related = data.GetProperty("related").EnumerateArray().Select(p => p.GetProperty("id").GetString()).ToList();
        Assert.Equal(4, related.Count);
        Assert.DoesNotContain("p10", related);
    }

    [Fact]
    public async Task Categories_include_product_counts()
    {
        using var api = new TestApi();
        var all = await (await api.Guest().GetAsync("/api/categories")).DataAsync();
        Assert.Equal(10, all.GetArrayLength());
        Assert.All(all.EnumerateArray(), c => Assert.Equal(4, c.GetProperty("productCount").GetInt32()));

        var one = await (await api.Guest().GetAsync("/api/categories/board-games")).DataAsync();
        Assert.Equal("Board Games", one.GetProperty("name").GetString());
    }

    [Fact]
    public async Task Only_admins_can_change_products()
    {
        using var api = new TestApi();
        await (await api.Guest().PostAsJsonAsync("/api/products", NewProduct())).ErrorAsync(HttpStatusCode.Unauthorized);

        var customer = await api.CustomerAsync();
        await (await customer.PostAsJsonAsync("/api/products", NewProduct())).ErrorAsync(HttpStatusCode.Forbidden);
        await (await customer.PutAsJsonAsync("/api/products/p1", NewProduct())).ErrorAsync(HttpStatusCode.Forbidden);
        await (await customer.DeleteAsync("/api/products/p1")).ErrorAsync(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Admin_can_create_update_and_delete_a_product()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        var created = await admin.PostAsJsonAsync("/api/products", NewProduct());
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var product = await created.DataAsync();
        var id = product.GetProperty("id").GetString();
        Assert.Equal("p41", id);
        Assert.Equal(50, product.GetProperty("discountPercentage").GetInt32());

        var updated = await (await admin.PutAsJsonAsync($"/api/products/{id}", NewProduct(price: 750))).DataAsync();
        Assert.Equal(750, updated.GetProperty("price").GetDecimal());
        Assert.Equal(25, updated.GetProperty("discountPercentage").GetInt32());

        await (await admin.DeleteAsync($"/api/products/{id}")).DataAsync();
        await (await api.Guest().GetAsync($"/api/products/{id}")).ErrorAsync(HttpStatusCode.NotFound);

        // Still listed for admins, and marked as inactive.
        var adminList = await (await admin.GetAsync("/api/admin/products")).DataAsync();
        Assert.Contains(adminList.EnumerateArray(), p => p.GetProperty("id").GetString() == id && !p.GetProperty("isActive").GetBoolean());
    }

    [Fact]
    public async Task Product_requests_are_validated()
    {
        using var api = new TestApi();
        var admin = await api.AdminAsync();

        await (await admin.PostAsJsonAsync("/api/products", NewProduct(price: 2000, originalPrice: 1000))).ErrorAsync(HttpStatusCode.BadRequest);
        await (await admin.PostAsJsonAsync("/api/products", new { name = "" })).ErrorAsync(HttpStatusCode.BadRequest);

        var wrongCategory = new
        {
            name = "X", categoryId = "nope", brand = "B", description = "D",
            price = 1, originalPrice = 1, imageUrl = "/x.png", stockQuantity = 1,
        };
        await (await admin.PostAsJsonAsync("/api/products", wrongCategory)).ErrorAsync(HttpStatusCode.BadRequest);
        await (await admin.PutAsJsonAsync("/api/products/nope", NewProduct())).ErrorAsync(HttpStatusCode.NotFound);
    }
}
