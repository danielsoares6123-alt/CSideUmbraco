using Microsoft.AspNetCore.Mvc;

public class ProductsViewComponent : ViewComponent
{
    private readonly IProductsService _productsService;

    public ProductsViewComponent(IProductsService productsService)
    {
        _productsService = productsService;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        try
        {
            var items = await _productsService.DownloadItemsAsync();
            return View("~/Views/Partials/Components/Products/Default.cshtml", items);
        }
        catch (Exception ex)
        {
            return Content($"Erro no ViewComponent: {ex.Message}");
        }
    }
}
