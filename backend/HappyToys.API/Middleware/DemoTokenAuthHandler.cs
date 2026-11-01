using System.Security.Claims;
using System.Text.Encodings.Web;
using HappyToys.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyToys.API.Middleware;

/// <summary>
/// Temporary login check, replaced by JWT in Step 2. Reads "Authorization: Bearer token" and looks the token
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
            .Include(s => s.User!).ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
        if (session?.User is null)
        {
            return AuthenticateResult.Fail("Invalid or expired session.");
        }

        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, session.User.Id),
            new(ClaimTypes.Role, session.User.Role!.Name),
        ];
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName));
        return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
    }
}
