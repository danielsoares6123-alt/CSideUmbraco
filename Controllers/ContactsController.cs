using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Website.Controllers;
using Woosh.Models.Requests;

namespace Woosh.Controllers
{
    public class ContactsController : SurfaceController, IContacts
    {
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;

        public ContactsController(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoDatabaseFactory databaseFactory,
        ServiceContext services,
        AppCaches appCaches,
        IProfilingLogger profilingLogger,
        IPublishedUrlProvider publishedUrlProvider,
        EmailService emailService,
        IConfiguration configuration)
        : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
        {
            _emailService = emailService;
            _configuration = configuration;
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult SendBudgetRequest([FromForm] BudgetRequestModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");

            var emailBody = BuildBudgetEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Nova solicitação de orçamento", emailBody);

            return Ok(new { success = true });
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult SendContactForm([FromForm] ContactFormModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");
            var emailBody = BuildContactEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Nova mensagem de contacto", emailBody);
            return Ok(new { success = true });
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult SendPartnerForm([FromForm] PartnerFormModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");
            var emailBody = BuildPartnerEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Novo pedido de parceria", emailBody);
            return Ok(new { success = true });
        }

        private string BuildBudgetEmail(BudgetRequestModel model)
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

        private string BuildPartnerEmail(PartnerFormModel model)
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

        private string BuildContactEmail(ContactFormModel model)
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

    }
}
