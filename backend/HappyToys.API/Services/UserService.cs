using System.Security.Cryptography;
using HappyToys.API.Data;
using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.API.Services;

/// <summary>
/// DEMO authentication: passwords are hashed, but accounts live in memory and
/// sessions are simple random tokens. This is not production-grade security.
/// </summary>
public class UserService(AppDbContext db, IPasswordHasher<User> hasher) : IUserService
{
    private static readonly TimeSpan SessionLength = TimeSpan.FromDays(7);

    public async Task<AuthResultDto> RegisterAsync(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);
        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            throw ApiException.Conflict("An account with this email already exists. Please log in.");
        }

        var user = new User
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = request.Name.Trim(),
            Email = email,
            CreatedDate = DateTime.UtcNow,
        };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        db.Users.Add(user);

        return await CreateSessionAsync(user);
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // The same message for both cases, so nobody can test which emails have accounts.
        if (user is null || hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            throw ApiException.Unauthorized("Incorrect email or password.");
        }

        return await CreateSessionAsync(user);
    }

    public async Task LogoutAsync(string token)
    {
        var session = await db.UserSessions.FindAsync(token);
        if (session is not null)
        {
            db.UserSessions.Remove(session);
            await db.SaveChangesAsync();
        }
    }

    public async Task<UserProfileDto> GetProfileAsync(string userId) => (await FindUserAsync(userId)).ToDto();

    public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await FindUserAsync(userId);
        user.Name = request.Name.Trim();
        user.Mobile = request.Mobile ?? "";
        user.Address = request.Address?.Trim() ?? "";
        user.City = request.City?.Trim() ?? "";
        user.State = request.State?.Trim() ?? "";
        user.PinCode = request.PinCode ?? "";
        await db.SaveChangesAsync();
        return user.ToDto();
    }

    private async Task<AuthResultDto> CreateSessionAsync(User user)
    {
        var session = new UserSession
        {
            Token = RandomNumberGenerator.GetHexString(64, lowercase: true),
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.Add(SessionLength),
        };
        db.UserSessions.Add(session);
        await db.SaveChangesAsync();
        return new AuthResultDto(session.Token, session.ExpiresAt, user.ToDto());
    }

    private async Task<User> FindUserAsync(string userId) =>
        await db.Users.FirstOrDefaultAsync(u => u.Id == userId)
        ?? throw ApiException.Unauthorized("Please log in to continue.");

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
