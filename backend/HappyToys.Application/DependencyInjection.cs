using HappyToys.Application.Interfaces;
using HappyToys.Application.Services;
using HappyToys.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace HappyToys.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IWishlistService, WishlistService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
