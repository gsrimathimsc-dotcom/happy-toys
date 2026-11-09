using HappyToys.Application.DTOs;
using HappyToys.Application.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HappyToys.API.Middleware;

/// <summary>
/// The one place that turns exceptions into API errors, so a failure always
/// reaches the frontend as { success: false, error: "..." }.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ApiException exception)
        {
            await WriteErrorAsync(context, exception.StatusCode, exception.Message);
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // A unique rule in the database was hit (for example two requests at once).
            logger.LogWarning(exception, "Duplicate record on {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status409Conflict, "That already exists. Please use a different value.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled error on {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, "Something went wrong. Please try again.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
    {
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(ApiResponse.Fail(message));
    }
}
