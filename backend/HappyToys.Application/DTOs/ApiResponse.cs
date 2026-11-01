namespace HappyToys.Application.DTOs;

/// <summary>
/// Every API answer has this shape, so the frontend handles them all the same way:
/// { "success": true, "data": ... } or { "success": false, "error": "...", "errors": { ... } }.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }

    /// <summary>Messages per form field, for validation failures.</summary>
    public Dictionary<string, string[]>? Errors { get; init; }
}

public static class ApiResponse
{
    public static ApiResponse<T> Ok<T>(T data) => new() { Success = true, Data = data };

    public static ApiResponse<object> Fail(string error, Dictionary<string, string[]>? errors = null) =>
        new() { Success = false, Error = error, Errors = errors };
}

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public record MessageDto(string Message);
