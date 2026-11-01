using System.Security.Claims;
using System.Text.Encodings.Web;
using HappyToys.API.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyToys.API.Middleware;

/// <summary>
/// DEMO login check. Reads "Authorization: Bearer token" and looks the token
/// up in the session table. It feeds ASP.NET's normal [Authorize] attributes,
/// so a real provider can replace it later without touching the controllers.
/// </summary>
public class DemoTokenAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    AppDbContext db) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "DemoToken";
    private const string BearerPrefix = "Bearer ";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        if (!header.StartsWith(BearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var token = header[BearerPrefix.Length..].Trim();
        var session = await db.UserSessions.AsNoTracking()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
        if (session?.User is null)
        {
            return AuthenticateResult.Fail("Invalid or expired session.");
        }

        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, session.User.Id),
            new(ClaimTypes.Role, session.User.Role.ToString()),
        ];
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName));
        return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
    }
}
