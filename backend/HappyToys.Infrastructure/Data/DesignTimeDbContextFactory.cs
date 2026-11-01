using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HappyToys.Infrastructure.Data;

/// <summary>
/// Used only by the "dotnet ef" commands. Creating a migration does not connect
/// to a database. To apply one, set DATABASE_URL or pass --connection.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var url = Environment.GetEnvironmentVariable("DATABASE_URL");
        var connection = string.IsNullOrWhiteSpace(url)
            ? "Host=localhost;Database=happytoys;Username=postgres"
            : DatabaseConnection.FromUrl(url);

        var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(connection).Options;
        return new AppDbContext(options);
    }
}
