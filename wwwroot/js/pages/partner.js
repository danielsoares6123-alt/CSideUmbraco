document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form-style-03");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const requiredFields = form.querySelectorAll(".required");
        let invalidFields = [];

        // Validação geral dos campos obrigatórios
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                invalidFields.push(field);
                field.classList.add("is-invalid");
            } else {
                field.classList.remove("is-invalid");
            }
        });

        // Validação específica do Código Postal (formato português 0000-000)
        const postalField = form.querySelector('input[name="postalCode"]');
        if (postalField && postalField.value.trim()) {
            const postalRegex = /^\d{4}-\d{3}$/;
            if (!postalRegex.test(postalField.value.trim())) {
                invalidFields.push(postalField);
                postalField.classList.add("is-invalid");
            } else {
                postalField.classList.remove("is-invalid");
            }
        }

        if (invalidFields.length > 0) {
            const fieldNames = invalidFields.map(f => {
                const label = form.querySelector(`label[for="${f.id}"]`);
                return label ? label.textContent.replace("*", "").trim() : f.name;
            }).join(", ");

            Swal.fire({
                icon: "warning",
                title: "Campos inválidos ou em falta",
                html: `Por favor, corrija os seguintes campos: <b>${fieldNames}</b>`,
                showConfirmButton: true
            });
            return;
        }

        // Cria FormData do formulário
        const formData = new FormData(form);

        try {
            const response = await fetch("/umbraco/surface/Contacts/SendPartnerForm", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Formulário enviado!",
                        text: data.message || "O seu pedido foi enviado com sucesso. Entraremos em contacto em breve.",
                        showConfirmButton: true
                    });
                    form.reset();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Erro no envio",
                        text: data.message || "Ocorreu um erro ao enviar o formulário. Verifique os campos e tente novamente.",
                        showConfirmButton: true
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: "Ocorreu um erro no servidor ao enviar o formulário. Tente novamente mais tarde.",
                    showConfirmButton: true
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Erro de rede",
                text: "Não foi possível enviar o formulário. Verifique a sua ligação e tente novamente.",
                showConfirmButton: true
            });
        }
    });
});
