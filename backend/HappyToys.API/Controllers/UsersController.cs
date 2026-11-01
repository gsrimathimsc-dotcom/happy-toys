using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/users")]
public class UsersController(IUserService users) : ApiControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request) =>
        Created(await users.RegisterAsync(request));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request) => Success(await users.LoginAsync(request));

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Headers.Authorization.ToString().Split(' ').Last();
        await users.LogoutAsync(token);
        return Success(new MessageDto("You have been logged out."));
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile() => Success(await users.GetProfileAsync(RequiredUserId));

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request) =>
        Success(await users.UpdateProfileAsync(RequiredUserId, request));
}
