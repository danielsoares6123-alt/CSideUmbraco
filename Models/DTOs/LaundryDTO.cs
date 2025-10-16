namespace Woosh.Models.DTOs
{
    // DTO para representar cada linha do Excel
    public class LaundryDTO
    {
        public string Numero { get; set; }
        public string Nome { get; set; }
        public string Endereco { get; set; }
        public string Idioma { get; set; }
        public string Rota { get; set; }
        public string Cidade { get; set; }
        public string ZipCode { get; set; }
        public string Telefone { get; set; }
    }
}
