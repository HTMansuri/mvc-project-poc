# Visitor Signals — MVC Proof of Concept

This **ASP.NET Core MVC (.NET 8)** application demonstrates how visitor interactions can be collected by an analytics service.

The analytics POC is working today. The project uses synthetic interactions and a local, in-memory analytics API; it does not connect to production services or collect real customer data.

## Run locally

Requires the .NET 8 SDK.

```powershell
dotnet restore
dotnet run --launch-profile http
```

Open **http://localhost:5088**.

Optional JavaScript checks (Node.js 18+):

```powershell
node --test
```

## Demonstrate the existing analytics POC

1. Select **Auto**, **Homeowners**, or another product on the home page.
2. Select **GET A QUOTE**, or open the local Personal / Commercial login page.
3. Use **Refresh analytics results** or open `http://localhost:5088/api/analytics/events`.
4. Inspect captured `button-tap`, `link-tap`, and `page_view` requests, including element IDs.

The application loads `wwwroot/js/analytics-api-client.js` by default. That adapter publishes to the local endpoint (`POST /api/analytics/events`). The endpoint retains the latest 50 requests in memory and resets when the app restarts.

## Project structure

```text
Controllers/          Local MVC pages and demo analytics API
Models/               Analytics request model
Views/                Quote page, local portal pages, shared layout and rule JSON
wwwroot/js/           Analytics client, click tracking, UI behavior
tests/                Unit Tests for current POC project
```