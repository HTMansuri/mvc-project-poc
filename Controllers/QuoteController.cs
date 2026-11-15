using Microsoft.AspNetCore.Mvc;
using VisitorSignalsPoc.Models;

namespace VisitorSignalsPoc.Controllers;

public sealed class QuoteController : Controller
{
    private static readonly IReadOnlyDictionary<string, string> Products =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["auto"] = "Auto",
            ["home"] = "Homeowners",
            ["condo"] = "Condo",
            ["renters"] = "Renters",
            ["umbrella"] = "Umbrella"
        };

    // Provides the next step of the quote widget via AJAX, with no production quote service.
    [HttpGet("quote/widget")]
    public IActionResult Widget([FromQuery] string? product)
    {
        if (string.IsNullOrWhiteSpace(product) ||
            !Products.TryGetValue(product, out var productName))
        {
            return BadRequest("Unsupported quote product.");
        }

        return PartialView("_ZipCodeForm", new QuoteSelectionViewModel
        {
            ProductCode = product.ToLowerInvariant(),
            ProductName = productName
        });
    }
}
