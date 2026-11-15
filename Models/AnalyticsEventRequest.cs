using System.Text.Json;

namespace VisitorSignalsPoc.Models;

public sealed class AnalyticsEventRequest
{
    public string EventName { get; set; } = string.Empty;
    public JsonElement Event { get; set; }
    public string? Page { get; set; }
}
