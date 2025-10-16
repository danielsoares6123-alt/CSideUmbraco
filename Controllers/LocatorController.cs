using ExcelDataReader;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Website.Controllers;
using Woosh.Models.DTOs;
using Woosh.Models.Requests;

namespace Woosh.Controllers
{
    public class LocatorController : SurfaceController
    {
        private readonly IContentService _contentService;

        public LocatorController(
            IUmbracoContextAccessor umbracoContextAccessor,
            IUmbracoDatabaseFactory databaseFactory,
            ServiceContext services,
            AppCaches appCaches,
            IProfilingLogger profilingLogger,
            IPublishedUrlProvider publishedUrlProvider,
            IContentService contentService)
            : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
        {
            _contentService = contentService;
        }

        [HttpGet]
        public IActionResult GetLaundriesLocations()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetLatAndLongData()
        {
            // Id do content pai
            Guid parentGuid = Guid.Parse("23c0a082-09c9-4e2e-8980-a2a41c597491");
            var parentContent = _contentService.GetById(parentGuid);
            if (parentContent == null)
                return BadRequest("Content pai não encontrado.");

            // Pega todos os filhos do content pai usando GetPagedChildren
            var pageSize = int.MaxValue; // traz todos
            var pageIndex = 0;
            long totalRecords = 0;

            var pagedChildren = _contentService.GetPagedChildren(parentContent.Id, pageIndex, pageSize, out totalRecords);

            int updatedCount = 0;

            foreach (var child in pagedChildren)
            {
                var lat = child.GetValue<double?>("laundryLat");
                var lon = child.GetValue<double?>("laundryLon");

                // Se já tiver coordenadas, pula
                if (lat.HasValue && lon.HasValue)
                    continue;

                // Monta o endereço completo
                var address = $"{child.GetValue<string>("laundryAddress")}";

                address = FixEncoding(address);
                // Geocodifica usando Nominatim
                try
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.UserAgent.ParseAdd("WooshApp/1.0");
                    var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(address)}";
                    var response = await client.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    var json = await response.Content.ReadAsStringAsync();
                    var results = System.Text.Json.JsonSerializer.Deserialize<List<NominatimResult>>(json);

                    if (results != null && results.Count > 0)
                    {
                        var result = results[0];
                        child.SetValue("laundryLat", double.Parse(result.lat, System.Globalization.CultureInfo.InvariantCulture));
                        child.SetValue("laundryLon", double.Parse(result.lon, System.Globalization.CultureInfo.InvariantCulture));

                        _contentService.Save(child);
                        _contentService.Publish(child, new[] { "*" });
                        updatedCount++;
                    }
                }
                catch (Exception ex)
                {
                    // Apenas loga ou ignora erros de geocodificação
                    Console.WriteLine($"Erro ao geocodificar {child.Name}: {ex.Message}");
                }
            }

            return Ok(new { message = $"Atualizadas {updatedCount} lavandarias com latitude e longitude." });
        }

        private string FixEncoding(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return input;

            // Converte de ISO-8859-1 (Latin1) para UTF-8
            var bytes = System.Text.Encoding.GetEncoding("ISO-8859-1").GetBytes(input);
            return System.Text.Encoding.UTF8.GetString(bytes);
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public IActionResult ImportLaundries()
        {
            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest("Nenhum ficheiro foi enviado.");

            try
            {
                using var stream = file.OpenReadStream();
                using var reader = ExcelReaderFactory.CreateReader(stream);
                var laundries = new List<LaundryDTO>();

                // Processa cada folha do Excel
                do
                {
                    while (reader.Read())
                    {
                        if (reader.Depth > 0) // Ignora a primeira linha (cabeçalho)
                        {
                            var laundry = new LaundryDTO
                            {
                                Numero = reader.GetValue(0)?.ToString(),
                                Nome = reader.GetValue(1)?.ToString(),
                                Endereco = reader.GetValue(2)?.ToString(),
                                Idioma = reader.GetValue(3)?.ToString(),
                                Rota = reader.GetValue(4)?.ToString(),
                                Cidade = reader.GetValue(5)?.ToString(),
                                ZipCode = reader.GetValue(6)?.ToString(),
                                Telefone = reader.GetValue(7)?.ToString()
                            };
                            laundries.Add(laundry);
                        }
                    }
                } while (reader.NextResult());

                // Id do content pai
                Guid parentGuid = Guid.Parse("23c0a082-09c9-4e2e-8980-a2a41c597491");
                var parentContent = _contentService.GetById(parentGuid);
                if (parentContent == null)
                    return BadRequest("Content pai não encontrado.");

                // Pega todos os filhos do content pai usando GetPagedChildren
                var pageSize = int.MaxValue; // para trazer todos
                var pageIndex = 0;
                long totalRecords = 0;

                var pagedChildren = _contentService.GetPagedChildren(parentContent.Id, pageIndex, pageSize, out totalRecords);

                // Converte para dicionário para lookup rápido pelo nome
                var existingChildren = pagedChildren.ToDictionary(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase);
                int createdCount = 0;

                foreach (var laundry in laundries)
                {
                    // Verifica se já existe um filho com este Nome
                    if (existingChildren.ContainsKey(laundry.Nome))
                        continue; // Pula, já existe

                    var child = _contentService.Create(laundry.Nome, parentContent.Id, "laundry");

                    child.SetValue("laundryName", laundry.Nome);
                    child.SetValue("laundryAddress", laundry.Endereco);
                    child.SetValue("laundryLanguage", laundry.Idioma);
                    child.SetValue("laundryRoute", laundry.Rota);
                    child.SetValue("laundryCity", laundry.Cidade);
                    child.SetValue("laundryZipCode", laundry.ZipCode);
                    child.SetValue("laundryPhone", laundry.Telefone);

                    _contentService.Save(child);
                    _contentService.Publish(child, new[] { "*" });

                    createdCount++;
                }

                return Ok(new { message = $"Importados {laundries.Count} registos. Criados {createdCount} novos filhos." });
            }
            catch (Exception ex)
            {
                return BadRequest("Erro ao processar o ficheiro: " + ex.Message);
            }
        }
    }
}
