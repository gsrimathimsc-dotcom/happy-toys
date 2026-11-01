using System.Security.Cryptography;
using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

/// <summary>
/// Passwords are hashed and accounts are stored in PostgreSQL. Sessions here
/// are simple random tokens until JWT login replaces them in Step 2.
/// </summary>
public class UserService(IAppDbContext db, IPasswordHasher<User> hasher) : IUserService
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
            RoleId = Role.CustomerId,
        };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return await CreateSessionAsync(user.Id);
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

        return await CreateSessionAsync(user.Id);
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

        var address = user.Addresses.FirstOrDefault(a => a.IsDefault);
        if (address is null)
        {
            address = new UserAddress { UserId = user.Id, IsDefault = true };
            user.Addresses.Add(address);
        }
        address.Address = request.Address?.Trim() ?? "";
        address.City = request.City?.Trim() ?? "";
        address.State = request.State?.Trim() ?? "";
        address.PinCode = request.PinCode ?? "";

        await db.SaveChangesAsync();
        return user.ToDto();
    }

    private async Task<AuthResultDto> CreateSessionAsync(string userId)
    {
        var session = new UserSession
        {
            Token = RandomNumberGenerator.GetHexString(64, lowercase: true),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.Add(SessionLength),
        };
        db.UserSessions.Add(session);
        await db.SaveChangesAsync();

        var user = await FindUserAsync(userId);
        return new AuthResultDto(session.Token, session.ExpiresAt, user.ToDto());
    }

    private async Task<User> FindUserAsync(string userId) =>
        await db.Users.Include(u => u.Role).Include(u => u.Addresses).FirstOrDefaultAsync(u => u.Id == userId)
        ?? throw ApiException.Unauthorized("Please log in to continue.");

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
