using System.ComponentModel.DataAnnotations;
using static Umbraco.Cms.Core.Constants.Validation;

namespace Woosh.Models.Requests
{
    public class BudgetRequestModel
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "O email não é válido.")]
        public string Email { get; set; }

        public string Phone { get; set; }

        public string Message { get; set; }

        // Lista de produtos e quantidades
        public List<ProductItem> Products { get; set; } = new List<ProductItem>();
    }

    public class ProductItem
    {
        [Required(ErrorMessage = "O nome do produto é obrigatório.")]
        public string Nome { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que 0.")]
        public int Quantidade { get; set; }
    }
}