// Controllers/MapboxController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class MapboxController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _mapboxToken;

    public MapboxController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _mapboxToken = config["MapboxToken"]; // colocar no appsettings.json ou secrets
    }

    // Apenas devolve o token público
    [HttpGet("token")]
    public IActionResult GetPublicToken()
    {
        // Podes ler do appsettings.json ou environment variable
        var publicToken = _mapboxToken;
        return Ok(new { token = publicToken });
    }

    [HttpGet("geocode")]
    public async Task<IActionResult> Geocode([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { error = "Query missing" });

        try
        {
            var url = $"https://api.mapbox.com/geocoding/v5/mapbox.places/{Uri.EscapeDataString(query)}.json?country=pt&limit=1&access_token={_mapboxToken}";

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);

            if (doc.RootElement.TryGetProperty("features", out var features) && features.GetArrayLength() > 0)
            {
                var center = features[0].GetProperty("center");
                double lon = center[0].GetDouble();
                double lat = center[1].GetDouble();
                return Ok(new { lat, lon });
            }

            return Ok(null);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Erro Mapbox: " + ex.Message);
            return StatusCode(500, new { error = "Erro no Mapbox" });
        }
    }
}
