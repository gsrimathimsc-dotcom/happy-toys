using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Success(await categories.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Success(await categories.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = Role.Admin)]
    public async Task<IActionResult> Create(CategoryRequest request) => Created(await categories.CreateAsync(request));

    [HttpPut("{id}")]
    [Authorize(Roles = Role.Admin)]
    public async Task<IActionResult> Update(string id, CategoryRequest request) =>
        Success(await categories.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [Authorize(Roles = Role.Admin)]
    public async Task<IActionResult> Delete(string id)
    {
        await categories.DeleteAsync(id);
        return Success(new MessageDto("Category deleted."));
    }
}
