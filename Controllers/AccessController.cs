using Microsoft.AspNetCore.Mvc;

namespace VisitorSignalsPoc.Controllers;

public sealed class AccessController : Controller
{
    // Local destinations only; no real authentication or services.
    [HttpGet("cssportal")]
    public IActionResult Personal() => View("Portal", "Personal Login");

    [HttpGet("clportal")]
    public IActionResult Commercial() => View("Portal", "Commercial Login");
}
