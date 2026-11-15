using Microsoft.AspNetCore.Mvc;

namespace VisitorSignalsPoc.Controllers;

public sealed class HomeController : Controller
{
    public IActionResult Index() => View();

    public IActionResult Error() => Content("A demo error occurred.");
}
