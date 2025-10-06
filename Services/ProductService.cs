using Woosh.Models.DTOs;

public interface IProductsService
{
    Task<List<ProductDto>> DownloadItemsAsync();
}

public class ProductsService : IProductsService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ProductsService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<List<ProductDto>> DownloadItemsAsync()
    {
        string soapEnvelope = @"<?xml version=""1.0"" encoding=""utf-8""?>
    <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" 
                   xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" 
                   xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
      <soap:Body>
        <DownloadItems_async xmlns=""http://tempuri.org/"">
          <company>TAP</company>
          <key>8067875645657884797873795046484653545454544545455253</key>
        </DownloadItems_async>
      </soap:Body>
    </soap:Envelope>";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("SOAPAction", "http://tempuri.org/DownloadItems_async");
        var content = new StringContent(soapEnvelope, System.Text.Encoding.UTF8, "text/xml");
        var response = await client.PostAsync("http://salvada.sospc.pt/WebSiteToSage100C/WebSiteToSage100C.asmx", content);

        if (!response.IsSuccessStatusCode)
            return new List<ProductDto>();

        string xmlResponse = System.Net.WebUtility.HtmlDecode(await response.Content.ReadAsStringAsync());
        var xmlDoc = new System.Xml.XmlDocument();
        xmlDoc.LoadXml(xmlResponse);

        var nodes = xmlDoc.GetElementsByTagName("DataRow");
        var items = new List<ProductDto>();

        foreach (System.Xml.XmlNode node in nodes)
        {
            items.Add(new ProductDto
            {
                Id = node["ID"]?.InnerText?.Trim(),
                CategoriaId = node["CATEGORIA_ID"]?.InnerText?.Trim(),
                CategoriaNome = node["CATEGORIA_NOME"]?.InnerText?.Trim(),
                Titulo = node["TITULO"]?.InnerText?.Trim(),
                Descricao = node["DESCRICAO"]?.InnerText?.Trim(),
                Peso = node["PESO"]?.InnerText?.Trim(),
                Preco = node["PVPCIVA"]?.InnerText?.Trim(),
                Imagem = node["FICHA_IMAGEM"]?.InnerText?.Trim(),
                FichaTecnica = node["FICHA_TECNICA"]?.InnerText?.Trim(),
                FichaSeguranca = node["FICHA_SEGURANCA"]?.InnerText?.Trim()
            });
        }

        return items;
    }

}
