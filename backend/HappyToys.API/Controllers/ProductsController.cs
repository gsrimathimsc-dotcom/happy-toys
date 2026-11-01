using HappyToys.API.DTOs;
using HappyToys.API.Interfaces;
using HappyToys.API.Models;
using HappyToys.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/products")]
public class ProductsController(IProductService products) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductQuery query) =>
        Success(await products.SearchAsync(query));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] ProductQuery query)
    {
        if (string.IsNullOrWhiteSpace(query.Q))
        {
            throw ApiException.BadRequest("Please enter something to search for.");
        }
        return Success(await products.SearchAsync(query));
    }

    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetByCategory(string categoryId, [FromQuery] ProductQuery query)
    {
        query.Category = categoryId;
        return Success(await products.SearchAsync(query));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Success(await products.GetDetailsAsync(id));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create(ProductRequest request) => Created(await products.CreateAsync(request));

    [HttpPut("{id}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(string id, ProductRequest request) =>
        Success(await products.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(string id)
    {
        await products.DeleteAsync(id);
        return Success(new MessageDto("Product deleted."));
    }
}
