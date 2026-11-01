using HappyToys.API.DTOs;
using HappyToys.API.Models;

namespace HappyToys.API.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> SearchAsync(ProductQuery query);
    Task<ProductDetailsDto> GetDetailsAsync(string id);
    Task<ProductDto> CreateAsync(ProductRequest request);
    Task<ProductDto> UpdateAsync(string id, ProductRequest request);
    Task DeleteAsync(string id);
}

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync();
    Task<CategoryDto> GetByIdAsync(string id);
}

public interface ICartService
{
    Task<CartDto> GetAsync(string ownerId);
    Task<CartDto> AddItemAsync(string ownerId, CartLineRequest request);
    Task<CartDto> UpdateItemAsync(string ownerId, string productId, int quantity);
    Task<CartDto> RemoveItemAsync(string ownerId, string productId);
    Task<CartValidationDto> ValidateAsync(IEnumerable<CartLineRequest> lines);
}

public interface IWishlistService
{
    Task<IReadOnlyList<ProductDto>> GetAsync(string ownerId);
    Task<IReadOnlyList<ProductDto>> AddAsync(string ownerId, string productId);
    Task<IReadOnlyList<ProductDto>> RemoveAsync(string ownerId, string productId);
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
}
