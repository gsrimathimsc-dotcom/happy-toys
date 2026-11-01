namespace HappyToys.API.Models;

public class Category
{
    /// <summary>A readable id such as "soft-toys". It is also used in URLs.</summary>
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
}
