using System.ComponentModel.DataAnnotations;

namespace Woosh.Models.Requests
{
    public class FormationFormModel
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Insira um email válido.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [Phone(ErrorMessage = "Insira um telefone válido.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "A mensagem é obrigatória.")]
        [StringLength(500, ErrorMessage = "A mensagem não pode ter mais de 500 caracteres.")]
        public string Message { get; set; }

        [Required]
        public string Formation { get; set; }

        public string? CustomFormation { get; set; }
        public string Address { get; set; }

    }
}
