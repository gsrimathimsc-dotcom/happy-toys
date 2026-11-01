using HappyToys.Application.DTOs;
using HappyToys.Domain.Enums;

namespace HappyToys.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> SearchAsync(ProductQuery query);
    Task<ProductDetailsDto> GetDetailsAsync(string id);
    Task<StoreSummaryDto> GetStoreSummaryAsync();
    Task<ProductDto> CreateAsync(ProductRequest request);
    Task<ProductDto> UpdateAsync(string id, ProductRequest request);
    Task<ProductDto> UpdateStockAsync(string id, int stockQuantity);
    Task DeleteAsync(string id);
}

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync();
    Task<CategoryDto> GetByIdAsync(string id);
    Task<CategoryDto> CreateAsync(CategoryRequest request);
    Task<CategoryDto> UpdateAsync(string id, CategoryRequest request);
    Task DeleteAsync(string id);
}

public interface ICartService
{
    Task<CartDto> GetAsync(Owner owner);
    Task<CartDto> AddItemAsync(Owner owner, CartLineRequest request);
    Task<CartDto> UpdateItemAsync(Owner owner, string productId, int quantity);
    Task<CartDto> RemoveItemAsync(Owner owner, string productId);
    Task<CartValidationDto> ValidateAsync(IEnumerable<CartLineRequest> lines);
}

public interface IWishlistService
{
    Task<IReadOnlyList<ProductDto>> GetAsync(Owner owner);
    Task<IReadOnlyList<ProductDto>> AddAsync(Owner owner, string productId);
    Task<IReadOnlyList<ProductDto>> RemoveAsync(Owner owner, string productId);
}

public interface IOrderService
{
    Task<OrderDto> PlaceAsync(CreateOrderRequest request, string? userId);
    Task<IReadOnlyList<OrderDto>> GetForUserAsync(string userId);
    Task<OrderDto> GetByIdAsync(string id, string? userId, bool isAdmin);
    Task<OrderDto> UpdateStatusAsync(string id, OrderStatus status, string userId, bool isAdmin);
}

public interface IUserService
{
    Task<AuthResultDto> RegisterAsync(RegisterRequest request);
    Task<AuthResultDto> LoginAsync(LoginRequest request);
    Task LogoutAsync(string token);
    Task<UserProfileDto> GetProfileAsync(string userId);
    Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequest request);
}

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardAsync();
    Task<IReadOnlyList<OrderDto>> GetOrdersAsync(OrderStatus? status);
    Task<IReadOnlyList<ProductDto>> GetProductsAsync();
    Task<IReadOnlyList<DailySalesDto>> GetDailySalesAsync(int days);
    Task<IReadOnlyList<MonthlySalesDto>> GetMonthlySalesAsync(int months);
    Task<IReadOnlyList<CustomerDto>> GetCustomersAsync();
    Task<AdminOffersDto> GetOffersAsync();
    Task<CouponDto> CreateCouponAsync(CouponRequest request);
    Task<CouponDto> UpdateCouponAsync(int id, CouponRequest request);
    Task DeleteCouponAsync(int id);
}
