document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Obtém os campos pelo atributo name
        const nome = form.querySelector('[name="Name"]');
        const email = form.querySelector('[name="Email"]');
        const assunto = form.querySelector('[name="Subject"]');
        const mensagem = form.querySelector('[name="Message"]');

        // Validação básica
        let invalidFields = [];

        if (!nome.value.trim()) invalidFields.push("Nome");
        if (!email.value.trim() || !validateEmail(email.value)) invalidFields.push("Email");
        if (!assunto.value.trim()) invalidFields.push("Assunto");
        if (!mensagem.value.trim()) invalidFields.push("Mensagem");

        if (invalidFields.length > 0) {
            const fieldNames = invalidFields.join(", ");
            Swal.fire({
                icon: "warning",
                title: "Campos inválidos ou em falta",
                html: `Por favor, corrija os seguintes campos: <b>${fieldNames}</b>`,
                showConfirmButton: true
            });
            return;
        }

        // Cria o FormData com base no formulário
        const formData = new FormData(form);

        try {
            const response = await fetch("/umbraco/surface/Contacts/SendContactForm", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Erro no envio do formulário.");

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: "success",
                    title: "Mensagem enviada!",
                    text: "Agradecemos o seu contacto. Responderemos brevemente.",
                    timer: 4000,
                    showConfirmButton: false
                });
                form.reset();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Erro ao enviar",
                    text: result.message || "Não foi possível enviar a mensagem. Tente novamente mais tarde."
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Erro inesperado",
                text: "Ocorreu um problema ao enviar o formulário. Verifique a ligação à internet e tente novamente."
            });
            console.error("Erro no envio:", error);
        }
    });

    // Função simples de validação de e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});