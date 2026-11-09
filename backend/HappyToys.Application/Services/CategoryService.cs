using HappyToys.Application.DTOs;
using HappyToys.Application.Interfaces;
using HappyToys.Domain.Entities;
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

    public async Task<CategoryDto> CreateAsync(CategoryRequest request)
    {
        var id = Slugify(request.Name);
        if (id.Length == 0) throw ApiException.BadRequest("Category name must contain letters or numbers.");
        // A new category has no id of its own to skip, so the id passed here matches nothing.
        await EnsureNameFreeAsync(request.Name, "");

        db.Categories.Add(new Category { Id = id, Name = request.Name.Trim(), Description = request.Description.Trim() });
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<CategoryDto> UpdateAsync(string id, CategoryRequest request)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw ApiException.NotFound($"Category \"{id}\" was not found.");
        await EnsureNameFreeAsync(request.Name, id);

        category.Name = request.Name.Trim();
        category.Description = request.Description.Trim();
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(string id)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw ApiException.NotFound($"Category \"{id}\" was not found.");
        if (await db.Products.AnyAsync(p => p.CategoryId == id))
        {
            throw ApiException.Conflict("This category still has products. Move or delete them first.");
        }

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
    }

    private async Task EnsureNameFreeAsync(string name, string id)
    {
        var slug = Slugify(name);
        var lower = name.Trim().ToLower();
        if (await db.Categories.AnyAsync(c => c.Id != id && (c.Id == slug || c.Name.ToLower() == lower)))
        {
            throw ApiException.Conflict($"A category named \"{name.Trim()}\" already exists.");
        }
    }

    /// <summary>"Soft Toys" becomes "soft-toys", the readable id used in URLs.</summary>
    private static string Slugify(string name) =>
        string.Join('-', System.Text.RegularExpressions.Regex.Split(name.Trim().ToLowerInvariant(), "[^a-z0-9]+")
            .Where(part => part.Length > 0));
}
