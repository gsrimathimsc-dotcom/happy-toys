using HappyToys.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HappyToys.API.Controllers;

[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Success(await categories.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Success(await categories.GetByIdAsync(id));
}
