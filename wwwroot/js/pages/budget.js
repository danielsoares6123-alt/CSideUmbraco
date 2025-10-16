document.addEventListener('DOMContentLoaded', function () {

    const form = document.querySelector('form.contact-form-style-03');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // previne o envio padrão

        // Monta o array de produtos
        const produtos = [];
        document.querySelectorAll('#product-list .product-item').forEach(function (item) {
            const nome = item.querySelector('input[name="products[]"]').value;
            const quantidade = item.querySelector('input[name="quantities[]"]').value;
            if (nome && quantidade) {
                produtos.push({ nome, quantidade });
            }
        });

        // Validação mínima (nome e email obrigatórios)
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        if (!name || !email) {
            Swal.fire({
                toast: false,
                position: 'middle',
                icon: 'error',
                title: 'Por favor, preencha o nome e o email.',
                showConfirmButton: false,
                customClass: {
                    popup: 'my-toast-error',
                    title: 'my-toast-title'
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            return;
        }

        if (produtos.length === 0) {
            Swal.fire({
                toast: false,
                position: 'middle',
                icon: 'error',
                title: 'Adicione pelo menos um produto antes de avançar.',
                showConfirmButton: false,
                customClass: {
                    popup: 'my-toast-error',
                    title: 'my-toast-title'
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            return;
        }


        const token = form.querySelector('input[name="__RequestVerificationToken"]').value;

        // Cria o FormData
        const formData = new FormData();
        formData.append('__RequestVerificationToken', token); // <- Adiciona aqui
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', document.getElementById('phone').value.trim());
        formData.append('message', document.getElementById('message').value.trim());

        // Adiciona produtos e quantidades
        produtos.forEach((p, i) => {
            formData.append(`Products[${i}].Nome`, p.nome);       // Nome do produto
            formData.append(`Products[${i}].Quantidade`, p.quantidade); // Quantidade
        });


        // Envia via fetch
        fetch('/umbraco/surface/Contacts/SendBudgetRequest', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro na rede');
                return response.json(); // o controller deve retornar JsonResult
            })
            .then(data => {
                Swal.fire({
                    toast: false,
                    position: 'middle',
                    icon: 'success',
                    title: 'Pedido de orçamento enviado com sucesso!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'my-toast-success',
                        title: 'my-toast-title'
                    },
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                form.reset();
                document.getElementById('product-list').innerHTML = '';
            })
            .catch(error => {
                Swal.fire({
                    toast: false,
                    position: 'middle',
                    icon: 'error',
                    title: 'Ocorreu um erro ao enviar o pedido. Tente novamente.',
                    showConfirmButton: false,
                    customClass: {
                        popup: 'my-toast-error',
                        title: 'my-toast-title'
                    },
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                console.error(error);
            });


    });

});

// Função para pegar os parâmetros GET
function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Função para criar cada item de produto com + e -
function createProductItem(name, quantity = 1) {
    const container = document.getElementById('product-list');
    const item = document.createElement('div');
    item.classList.add('row', 'mb-10px', 'product-item');
    item.innerHTML = `
            <div class="col-md-10">
                <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control mb-2" type="text" name="products[]" value="${name}" readonly>
            </div>
            <div class="col-md-2 d-flex align-items-center mb-2">
                <button type="button" class="ws-button-full me-5" onclick="decrementQuantity(this)">-</button>
                <input class="ps-0 pe-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control text-center" type="number" name="quantities[]" value="${quantity}" min="1" style="width:60px;">
                <button type="button" class="ws-button-full ms-5" onclick="incrementQuantity(this)">+</button>
            </div>
        `;
    container.appendChild(item);
}

// Funções de + e -
function incrementQuantity(button) {
    const input = button.parentElement.querySelector('input[type="number"]');
    input.value = parseInt(input.value) + 1;
}

function decrementQuantity(button) {
    const input = button.parentElement.querySelector('input[type="number"]');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

// Inicializar os produtos do GET
document.addEventListener('DOMContentLoaded', function () {
    const produtoParam = getParameterByName('produto');
    if (produtoParam) {
        const produtos = produtoParam.split(';');
        produtos.forEach(p => {
            if (p.trim()) createProductItem(p.trim());
        });
    }
});