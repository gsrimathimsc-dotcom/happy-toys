using System.Security.Claims;
using HappyToys.API.DTOs;
using HappyToys.API.Models;
using HappyToys.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

/// <summary>Small helpers shared by every controller.</summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    private const string GuestIdHeader = "X-Guest-Id";
    private const int MaxGuestIdLength = 64;

    protected string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    protected string RequiredUserId =>
        CurrentUserId ?? throw ApiException.Unauthorized("Please log in to continue.");

    protected bool IsAdmin => User.IsInRole(nameof(UserRole.Admin));

    protected OkObjectResult Success<T>(T data) => Ok(ApiResponse.Ok(data));

    protected ObjectResult Created<T>(T data) => StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(data));

    /// <summary>
    /// Who a cart or wishlist belongs to: the logged-in user, or otherwise the
    /// visitor's id sent in the X-Guest-Id header.
    /// </summary>
    protected string GetOwnerId()
    {
        if (CurrentUserId is not null) return $"user:{CurrentUserId}";

        var guestId = Request.Headers[GuestIdHeader].ToString().Trim();
        if (guestId.Length is 0 or > MaxGuestIdLength)
        {
            throw ApiException.BadRequest($"Log in or send a guest id in the {GuestIdHeader} header.");
        }
        return $"guest:{guestId}";
    }
}
