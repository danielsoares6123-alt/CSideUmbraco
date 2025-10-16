using Microsoft.AspNetCore.Mvc;
using Woosh.Models.Requests;

public interface IContacts
{
    IActionResult SendBudgetRequest(BudgetRequestModel model);
    IActionResult SendContactForm(ContactFormModel model);
    IActionResult SendPartnerForm(PartnerFormModel model);
}