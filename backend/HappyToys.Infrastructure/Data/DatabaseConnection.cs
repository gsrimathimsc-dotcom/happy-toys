using Microsoft.Extensions.Configuration;
using Npgsql;

namespace HappyToys.Infrastructure.Data;

public static class DatabaseConnection
{
    /// <summary>
    /// Finds the connection string. Hosting services such as Neon provide DATABASE_URL;
    /// on a developer's computer it comes from ConnectionStrings:DefaultConnection.
    /// </summary>
    public static string Resolve(IConfiguration configuration)
    {
        var value = configuration["DATABASE_URL"];
        if (string.IsNullOrWhiteSpace(value)) value = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                "No database is configured. Set ConnectionStrings:DefaultConnection or DATABASE_URL (see SETUP_GUIDE.md).");
        }

        return value.StartsWith("postgres", StringComparison.OrdinalIgnoreCase) ? FromUrl(value) : value;
    }

    /// <summary>Turns "postgresql://user:pass@host/db?sslmode=require" into Npgsql's format.</summary>
    public static string FromUrl(string url)
    {
        var uri = new Uri(url);
        var credentials = uri.UserInfo.Split(':', 2);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : null,
        };

        // Online databases require an encrypted connection.
        var query = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
        var sslMode = query.FirstOrDefault(part => part.StartsWith("sslmode=", StringComparison.OrdinalIgnoreCase));
        if (sslMode is not null && Enum.TryParse<SslMode>(sslMode["sslmode=".Length..], ignoreCase: true, out var mode))
        {
            builder.SslMode = mode;
        }

        return builder.ConnectionString;
    }
}
