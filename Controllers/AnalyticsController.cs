using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc;
using VisitorSignalsPoc.Models;

namespace VisitorSignalsPoc.Controllers;

[ApiController]
[Route("api/analytics/events")]
public sealed class AnalyticsController : ControllerBase
{
    // In-memory receiver for the existing analytics proof of concept.
    // This is not a durable store and deliberately has no external dependencies.
    private static readonly ConcurrentQueue<AnalyticsEventRequest> Events = new();

    [HttpGet]
    public IActionResult Get() => Ok(Events.ToArray());

    [HttpPost]
    public IActionResult Post([FromBody] AnalyticsEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EventName))
            return BadRequest(new { error = "eventName is required" });

        Events.Enqueue(request);
        while (Events.Count > 50)
            Events.TryDequeue(out _);

        return Accepted(new { accepted = true, eventName = request.EventName });
    }
}
