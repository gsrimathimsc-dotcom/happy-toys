using HappyToys.Application.Interfaces;
using HappyToys.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HappyToys.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = DatabaseConnection.Resolve(configuration);

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connection, npgsql => npgsql.EnableRetryOnFailure()));
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddScoped<DataSeeder>();

        return services;
    }
}
