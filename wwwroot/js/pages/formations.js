document.addEventListener("DOMContentLoaded", function () {
    // --- 1️⃣ Formações normais ---
    document.querySelectorAll('.ws-button-outline').forEach(function (button) {
        button.addEventListener('click', function () {
            const formationTitle = this.closest('.interactive-banner-style-08')
                .querySelector('.formation-title').textContent.trim();

            abrirFormularioInscricao({
                titulo: formationTitle,
                tipo: 'normal'
            });
        });
    });

    // --- 2️⃣ Formação à medida ---
    const customFormationBtn = document.getElementById('customFormationBtn');
    if (customFormationBtn) {
        customFormationBtn.addEventListener('click', function () {
            abrirFormularioInscricao({
                titulo: 'Formação à medida',
                tipo: 'custom'
            });
        });
    }

    // --- 3️⃣ Swiper init ---
    document.querySelectorAll('.swiper-formations').forEach(function (el) {
        var options = JSON.parse(el.getAttribute('data-slider-options') || '{}');
        options.freeMode = true;
        new Swiper(el, options);
    });
});

// ===============================================
// 🔧 Função genérica para abrir o formulário modal
// ===============================================
function abrirFormularioInscricao({ titulo, tipo }) {
    const isCustom = tipo === 'custom';
    const extraHTML = isCustom
        ? `
            <p style="text-align:left;font-size:16px;margin-bottom:20px;">
                Estruturamos e realizamos ações de formação certificada ajustadas às necessidades da sua empresa.
                Identificamos objetivos, elaboramos conteúdos e disponibilizamos recursos técnicos e humanos adequados.
            </p>
            <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required mb-2"
                   id="company" type="text" name="company" placeholder="Empresa">`
        : '';

    Swal.fire({
        html: `
            <h5 class="mt-1 mb-1">Inscrição na ${isCustom ? 'Formação à medida' : 'Formação'}</h5>
            <div style="color: #43C2FF; font-size: 15px; font-weight: bold;" class="mb-3 fw-bold">${titulo}</div>
            ${extraHTML}
            <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required mb-2"
                   id="name" type="text" name="name" placeholder="Nome">
            <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required mb-2"
                   id="email" type="email" name="email" placeholder="Email">
            <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required mb-2"
                   id="phone" type="text" name="phone" placeholder="Telefone">
            <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required mb-2"
                   id="address" type="text" name="address" placeholder="Morada">
            <textarea class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required"
                      id="message" name="message" placeholder="Descreva o seu pedido" rows="4"></textarea>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'ws-button-full',
            cancelButton: 'ws-button-full'
        },
        focusConfirm: false,
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#name').value.trim();
            const email = Swal.getPopup().querySelector('#email').value.trim();
            const phone = Swal.getPopup().querySelector('#phone').value.trim();
            const address = Swal.getPopup().querySelector('#address').value.trim();
            const message = Swal.getPopup().querySelector('#message').value.trim();
            const company = isCustom ? Swal.getPopup().querySelector('#company').value.trim() : '';

            if (isCustom && !company)
                return Swal.showValidationMessage('Por favor insira o nome da empresa.');
            if (!name)
                return Swal.showValidationMessage('Por favor insira o seu nome.');
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return Swal.showValidationMessage('Por favor insira um email válido.');
            if (!phone || phone.replace(/\D/g, '').length < 9)
                return Swal.showValidationMessage('Por favor insira um telefone válido (pelo menos 9 dígitos).');
            if (!address)
                return Swal.showValidationMessage('Por favor insira a sua morada.');
            if (!message)
                return Swal.showValidationMessage('Por favor insira uma mensagem.');
            if (message.length > 500)
                return Swal.showValidationMessage('A mensagem não pode ter mais de 500 caracteres.');

            return { name, email, phone, address, message, company, formation: titulo, tipo };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            enviarFormulario(result.value);
        }
    });
}

// ===============================================
// 📤 Função para envio do formulário (atualizada)
// ===============================================
function enviarFormulario(data) {
    const formData = new FormData();

    // Campos base
    formData.append('Name', data.name);
    formData.append('Email', data.email);
    formData.append('Phone', data.phone);
    formData.append('Address', data.address); // 🏠 novo campo Morada
    formData.append('Message', data.message);
    formData.append('Formation', data.formation);

    // Campo adicional se for formação à medida
    if (data.tipo === 'custom' && data.company) {
        formData.append('Company', data.company);
    }

    // Token anti-forgery, se existir
    const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    if (tokenInput) formData.append('__RequestVerificationToken', tokenInput.value);

    // Endpoint de envio
    const endpoint = '/umbraco/surface/Contacts/SendFormationForm';

    fetch(endpoint, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao enviar o formulário.');
            return response.text();
        })
        .then(() => {
            Swal.fire({
                title: '✅ Sucesso!',
                text: 'O seu pedido foi enviado com sucesso. Entraremos em contacto em breve.',
                icon: 'success',
                confirmButtonText: 'Fechar',
                customClass: { confirmButton: 'ws-button-full' }
            });
        })
        .catch(() => {
            Swal.fire({
                title: '❌ Erro',
                text: 'Ocorreu um erro ao enviar o pedido. Por favor, tente novamente mais tarde.',
                icon: 'error',
                confirmButtonText: 'Fechar',
                customClass: { confirmButton: 'ws-button-full' }
            });
        });
}