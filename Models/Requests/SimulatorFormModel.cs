using System.Collections.Generic;

public class SimulatorFormModel
{
    // Dados do cliente
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Location { get; set; }

    // Lista de produtos selecionados
    public List<ProductModel> Products { get; set; } = new List<ProductModel>();

    // Opcional: valor total do pedido
    public decimal TotalPrice { get; set; }
}

// Modelo para cada produto
public class ProductModel
{
    public string Type { get; set; }
    public string Name { get; set; }
    public string TotalPrice { get; set; }
    public ProductProperties Properties { get; set; }
}

public class ProductProperties
{
    public int? Lugares { get; set; }           // para sofás
    public bool? HasChaise { get; set; }       // chaise long
    public string Finish { get; set; }         // Pele, Tecido

    public string Service { get; set; }        // JSON vindo do form
    public string Specifications { get; set; } // JSON vindo do form

    // Métodos auxiliares para desserializar
    public List<string> GetServiceList()
    {
        return !string.IsNullOrEmpty(Service)
            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(Service)
            : new List<string>();
    }

    public Specification? GetSpecifications()
    {
        return !string.IsNullOrEmpty(Specifications)
            ? System.Text.Json.JsonSerializer.Deserialize<Specification>(Specifications)
            : null;
    }
}



// Detalhes específicos (tapetes, colchões, etc.)
public class Specification
{
    public string Name { get; set; }
    public decimal? X { get; set; }
    public decimal? Y { get; set; }
    public decimal? Result { get; set; }       // área m², etc.
}
