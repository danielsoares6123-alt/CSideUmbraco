using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

public class EmailService
{
    private readonly SmtpSettings _smtp;

    public EmailService(IOptions<SmtpSettings> smtpOptions)
    {
        _smtp = smtpOptions.Value;
    }

    public void SendEmail(string toEmail, string subject, string body, bool isHtml = true)
    {
        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            Credentials = new NetworkCredential(_smtp.UserName, _smtp.Password),
            EnableSsl = _smtp.EnableSsl
        };

        var mail = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };

        mail.To.Add(toEmail);
        client.Send(mail);
    }
}
