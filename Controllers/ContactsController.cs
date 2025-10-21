using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp.Metadata.Profiles.Iptc;
using System.Text;
using System.Text.Json;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Website.Controllers;
using Woosh.Models.Requests;
using Woosh.Utilities;

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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SendBudgetRequest([FromForm] BudgetRequestModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");

            var emailBody = EmailBuilder.BuildBudgetEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Nova solicitação de orçamento", emailBody);

            return Ok(new { success = true });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SendContactForm([FromForm] ContactFormModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");
            var emailBody = EmailBuilder.BuildContactEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Nova mensagem de contacto", emailBody);
            return Ok(new { success = true });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SendPartnerForm([FromForm] PartnerFormModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");
            var emailBody = EmailBuilder.BuildPartnerEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Novo pedido de parceria", emailBody);
            return Ok(new { success = true });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SendSimulatorForm([FromForm] SimulatorFormModel model)
        {
            // 4️⃣ Prepara o email
            try
            {
                var emailBody = EmailBuilder.BuildSimulatorEmail(model); // método que gera o corpo do email
                var toEmail = _configuration["SmtpSettings:ToEmail"];
                _emailService.SendEmail(toEmail, "Novo pedido do simulador", emailBody);
            }
            catch (Exception ex)
            {
                // Log do erro e retorna mensagem amigável
                Console.WriteLine($"Erro ao enviar email: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Ocorreu um erro ao enviar o email." });
            }

            // 5️⃣ Resposta final
            return Ok(new { success = true, message = "Pedido recebido com sucesso!" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SendFormationForm([FromForm] FormationFormModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dados inválidos.");
            var emailBody = EmailBuilder.BuildFormationEmail(model);
            var toEmail = _configuration["SmtpSettings:ToEmail"];
            _emailService.SendEmail(toEmail, "Novo pedido de formação", emailBody);
            return Ok(new { success = true });
        }

    }
}
