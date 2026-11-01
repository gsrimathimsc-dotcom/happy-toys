using System.Text.Json;
using System.Text.Json.Serialization;
using HappyToys.API.Middleware;
using HappyToys.Application;
using HappyToys.Application.DTOs;
using HappyToys.Infrastructure;
using HappyToys.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

const string FrontendCorsPolicy = "Frontend";

var builder = WebApplication.CreateBuilder(args);

// One set of JSON rules for controllers and for the error middleware.
void ConfigureJson(JsonSerializerOptions options)
{
    options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.RespectNullableAnnotations = true;
    options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
}

builder.Services.ConfigureHttpJsonOptions(options => ConfigureJson(options.SerializerOptions));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        ConfigureJson(options.JsonSerializerOptions);
        options.AllowInputFormatterExceptionMessages = false;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(BuildValidationError(context));
    });

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services
    .AddAuthentication(DemoTokenAuthHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, DemoTokenAuthHandler>(DemoTokenAuthHandler.SchemeName, null);
builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy(FrontendCorsPolicy, policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Happy Toys API",
        Version = "v1",
        Description = "Happy Toys e-commerce API, backed by PostgreSQL.",
    });
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Paste the token returned by POST /api/users/login.",
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = [],
    });
});

var app = builder.Build();

// On a developer's computer the database prepares itself. Online, these steps
// are run on purpose, so several server copies never migrate at the same time.
if (app.Configuration.GetValue<bool>("Database:PrepareOnStartup"))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<DataSeeder>().SeedAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Gives empty answers such as 401, 403, 404 and 405 the standard error shape.
app.UseStatusCodePages(async context =>
{
    var response = context.HttpContext.Response;
    var message = response.StatusCode switch
    {
        StatusCodes.Status401Unauthorized => "Please log in to continue.",
        StatusCodes.Status403Forbidden => "You do not have permission to do this.",
        StatusCodes.Status404NotFound => "This address does not exist.",
        StatusCodes.Status405MethodNotAllowed => "This action is not allowed here.",
        _ => "The request could not be completed.",
    };
    await response.WriteAsJsonAsync(ApiResponse.Fail(message));
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Shows the first problem as the main message, and every problem per form field.
static ApiResponse<object> BuildValidationError(ActionContext context)
{
    var errors = context.ModelState
        .Where(entry => entry.Value is { Errors.Count: > 0 })
        .ToDictionary(
            entry => ToFieldName(entry.Key),
            entry => entry.Value!.Errors.Select(error => FriendlyMessage(error.ErrorMessage)).ToArray());

    var firstMessage = errors.Values.SelectMany(messages => messages).FirstOrDefault() ?? "The request is not valid.";
    return ApiResponse.Fail(firstMessage, errors);
}

// "Customer.PinCode" becomes "customer.pinCode", matching the JSON the frontend sends.
static string ToFieldName(string key) =>
    string.Join('.', key.TrimStart('$', '.').Split('.').Select(part => JsonNamingPolicy.CamelCase.ConvertName(part)));

// Text from the JSON reader and model binder is replaced with something a person can act on.
static string FriendlyMessage(string message) =>
    string.IsNullOrEmpty(message) || message.StartsWith("The input was not valid") || message.EndsWith("field is required.")
        ? "The request is missing information or has an invalid value."
        : message;

// Lets the integration tests start the app.
public partial class Program;
