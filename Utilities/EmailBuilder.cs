using System.Text;
using System.Text.Json;
using Woosh.Models.Requests;

namespace Woosh.Utilities
{
    public static class EmailBuilder
    {
        public static string BuildSimulatorEmail(SimulatorFormModel model)
        {
            var sb = new StringBuilder();

            sb.AppendLine("<h2>Novo pedido do simulador</h2>");
            sb.AppendLine("<h3>Dados do cliente:</h3>");
            sb.AppendLine("<ul>");
            sb.AppendLine($"<li><b>Nome:</b> {model.Name}</li>");
            sb.AppendLine($"<li><b>Email:</b> {model.Email}</li>");
            sb.AppendLine($"<li><b>Telefone:</b> {model.Phone}</li>");
            sb.AppendLine($"<li><b>Localidade:</b> {model.Location}</li>");
            sb.AppendLine("</ul>");

            if (model.Products != null && model.Products.Any())
            {
                sb.AppendLine("<h3>Produtos selecionados:</h3>");
                sb.AppendLine("<table border='1' cellpadding='5' cellspacing='0' style='border-collapse:collapse; width:100%;'>");
                sb.AppendLine("<thead style='background:#f0f0f0;'>");
                sb.AppendLine("<tr>");
                sb.AppendLine("<th>Produto</th>");
                sb.AppendLine("<th>Detalhes</th>");
                sb.AppendLine("<th>Serviços</th>");
                sb.AppendLine("<th>Preço (€)</th>");
                sb.AppendLine("</tr>");
                sb.AppendLine("</thead>");
                sb.AppendLine("<tbody>");

                foreach (var product in model.Products)
                {
                    var details = string.Empty;

                    if (product.Properties != null)
                    {
                        if (product.Type.Equals("sofa", StringComparison.OrdinalIgnoreCase) || product.Type.Equals("sofá", StringComparison.OrdinalIgnoreCase))
                        {
                            details = $"{product.Properties.Lugares} {(product.Properties.Lugares == 1 ? "lugar" : "lugares")}";
                            if (product.Properties.HasChaise == true)
                                details += " (Chaise Long)";
                        }
                        else if (!string.IsNullOrEmpty(product.Properties.Specifications))
                        {
                            var spec = ParseSpecification(product.Properties.Specifications);

                            if (spec != null)
                            {
                                details = spec.Name ?? "-";
                                if (spec.Result.HasValue)
                                    details += $" — {spec.Result.Value} m²";
                            }
                        }

                        if (!string.IsNullOrEmpty(product.Properties.Finish))
                        {
                            details += $"<br/><b>Acabamento:</b> {product.Properties.Finish}";
                        }
                    }

                    string servicesHtml = "-";
                    if (!string.IsNullOrEmpty(product.Properties?.Service))
                    {
                        var services = System.Text.Json.JsonSerializer.Deserialize<List<string>>(product.Properties.Service);
                        if (services != null && services.Any())
                        {
                            var serviceSpans = services
                                .Select(s => $"<span style='display:inline-block; padding:2px 6px; margin:2px; background:#f0f0f0; border-radius:12px; font-size:0.85rem;'>{s}</span>");
                            servicesHtml = string.Join(" ", serviceSpans);
                        }
                    }

                    sb.AppendLine("<tr>");
                    sb.AppendLine($"<td>{product.Name}</td>");
                    sb.AppendLine($"<td>{details}</td>");
                    sb.AppendLine($"<td>{servicesHtml}</td>");
                    sb.AppendLine($"<td>{product.TotalPrice}</td>");
                    sb.AppendLine("</tr>");
                }

                sb.AppendLine("</tbody>");
                sb.AppendLine("</table>");
            }

            return sb.ToString();
        }

        public static string BuildPartnerEmail(PartnerFormModel model)
        {
            var body = $@"
        <!DOCTYPE html>
        <html lang='pt'>
        <head>
            <meta charset='UTF-8'>
            <title>Formulário de Parceiro</title>
            <style>
                body {{ font-family: Arial, sans-serif; color: #333; }}
                .header {{ background-color: #F4F4F4; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .info p {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class='header'>
                <h2>Novo Formulário de Parceiro</h2>
            </div>
            <div class='content'>
                <div class='info'>
                    <p><strong>Nome:</strong> {model.Name}</p>
                    <p><strong>Telefone:</strong> {model.Phone}</p>
                    <p><strong>Código Postal:</strong> {model.PostalCode}</p>
                    <p><strong>Email:</strong> {model.Email}</p>
                    <p><strong>Morada:</strong> {model.Address}</p>
                    <p><strong>Localidade:</strong> {model.City}</p>
                    <p><strong>Mensagem:</strong> {model.Message}</p>
                </div>
            </div>
        </body>
        </html>";

            return body;
        }

        public static string BuildContactEmail(ContactFormModel model)
        {
            var body = $@"
<!DOCTYPE html>
<html lang='pt'>
<head>
    <meta charset='UTF-8'>
    <title>Formulário de Contacto</title>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background-color: #F4F4F4; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .info p {{ margin: 5px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Nova Mensagem de Contacto</h2>
    </div>
    <div class='content'>
        <div class='info'>
            <p><strong>Nome:</strong> {model.Name}</p>
            <p><strong>Email:</strong> {model.Email}</p>
            <p><strong>Assunto:</strong> {model.Subject}</p>
            <p><strong>Mensagem:</strong><br>{model.Message}</p>
        </div>
    </div>
</body>
</html>";

            return body;
        }

        public static string BuildBudgetEmail(BudgetRequestModel model)
        {
            var body = $@"
<!DOCTYPE html>
<html lang='pt'>
<head>
    <meta charset='UTF-8'>
    <title>Pedido de Orçamento</title>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background-color: #f4f4f4; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .products {{ margin-top: 10px; border-collapse: collapse; width: 100%; }}
        .products th, .products td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .products th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Novo Pedido de Orçamento</h2>
    </div>
    <div class='content'>
        <p><strong>Nome:</strong> {model.Name}</p>
        <p><strong>Email:</strong> {model.Email}</p>
        <p><strong>Telefone:</strong> {model.Phone}</p>
        <p><strong>Mensagem:</strong> {model.Message}</p>

        <h3>Produtos solicitados:</h3>
        <table class='products'>
            <thead>
                <tr><th>Produto</th><th>Quantidade</th></tr>
            </thead>
            <tbody>";

            foreach (var p in model.Products)
                body += $"<tr><td>{p.Nome}</td><td>{p.Quantidade}</td></tr>";

            body += "</tbody></table></div></body></html>";

            return body;
        }

        public static string BuildFormationEmail(FormationFormModel model)
        {
            var customSection = string.IsNullOrWhiteSpace(model.CustomFormation)
                ? ""
                : $"" +
                $@"<tr><th>Morada</th><td>{{model.Address}}</td></tr>\r\n
                <tr><th>Formação Personalizada</th><td>{model.CustomFormation}</td></tr>";

            var body = $@"
<!DOCTYPE html>
<html lang='pt'>
<head>
    <meta charset='UTF-8'>
    <title>Inscrição na Formação</title>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background-color: #f4f4f4; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .info-table {{ border-collapse: collapse; width: 100%; margin-top: 10px; }}
        .info-table th, .info-table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .info-table th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Nova Inscrição na Formação</h2>
    </div>
    <div class='content'>
        <p><strong>Formação:</strong> {model.Formation}</p>
        <table class='info-table'>
            <tr><th>Nome</th><td>{model.Name}</td></tr>
            <tr><th>Email</th><td>{model.Email}</td></tr>
            <tr><th>Telefone</th><td>{model.Phone}</td></tr>
            <tr><th>Mensagem</th><td>{model.Message}</td></tr>
            {customSection}
        </table>
    </div>
</body>
</html>";

            return body;
        }

        // helper para desserializar Specification robustamente
        private static Specification? ParseSpecification(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return null;

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            try
            {
                var trimmed = raw.Trim();

                // Caso 1: já é um objeto JSON -> desserializa direto
                if (trimmed.StartsWith("{"))
                    return JsonSerializer.Deserialize<Specification>(trimmed, options);

                // Caso 2: é uma string JSON (duplamente codificada) -> desserializa primeiro para string
                if ((trimmed.StartsWith("\"") && trimmed.EndsWith("\"")) || trimmed.StartsWith("\\\""))
                {
                    var innerJson = JsonSerializer.Deserialize<string>(trimmed);
                    if (!string.IsNullOrEmpty(innerJson))
                        return JsonSerializer.Deserialize<Specification>(innerJson, options);
                }

                // Caso 3: tenta unescape e desserializar
                var unescaped = System.Text.RegularExpressions.Regex.Unescape(trimmed);
                if (unescaped.StartsWith("{"))
                    return JsonSerializer.Deserialize<Specification>(unescaped, options);
            }
            catch (Exception ex)
            {
                // Log minimal para debugging (substituir por ILogger em produção)
                Console.WriteLine($"ParseSpecification: erro ao desserializar -> {ex.Message}");
            }

            return null;
        }
    }
}
