using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyToys.Application.Services;

public class CategoryService(IAppDbContext db) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        var counts = await db.Products
            .Where(p => p.IsActive)
            .GroupBy(p => p.CategoryId)
            .Select(g => new { CategoryId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.CategoryId, g => g.Count);

        var categories = await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync();
        return categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, counts.GetValueOrDefault(c.Id)))
            .ToList();
    }

    public async Task<CategoryDto> GetByIdAsync(string id)
    {
        var categories = await GetAllAsync();
        return categories.FirstOrDefault(c => c.Id == id)
            ?? throw ApiException.NotFound($"Category \"{id}\" was not found.");
    }
}
