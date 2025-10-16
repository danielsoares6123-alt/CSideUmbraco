using Microsoft.AspNetCore.Mvc;

public interface IMapInterface
{
    IActionResult GetLaundryLocations();
    IActionResult GetLaundryByZipCode();
    string GetLaundryDescripion();
}