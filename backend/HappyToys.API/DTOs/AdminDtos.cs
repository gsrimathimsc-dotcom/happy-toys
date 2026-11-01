namespace HappyToys.API.DTOs;

public record BestSellingProductDto(string ProductId, string Name, string ImageUrl, int UnitsSold, decimal Revenue);

public record DailySalesDto(DateOnly Date, int Orders, decimal Sales);

public record AdminDashboardDto(
    int TotalProducts,
    int TotalOrders,
    int TotalCustomers,
    decimal TotalSales,
    IReadOnlyList<OrderDto> RecentOrders,
    IReadOnlyList<BestSellingProductDto> BestSellingProducts,
    IReadOnlyList<DailySalesDto> SalesOverview);
