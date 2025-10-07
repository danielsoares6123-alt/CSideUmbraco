document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('simulator').addEventListener('click', (e) => {
        const btn = e.target.closest('.counter-btn');
        if (!btn) return;

        const counterSpan = btn.parentElement.querySelector('.counter-text');
        let value = parseInt(counterSpan.textContent);

        let animationClass;
        if (btn.classList.contains('increment')) {
            value++;
            animationClass = 'counter-up';
        } else if (btn.classList.contains('decrement')) {
            value--;
            animationClass = 'counter-down';
        }

        if (value < 0) value = 0;

        // adiciona animação
        counterSpan.classList.add(animationClass);

        // atualiza o valor
        counterSpan.textContent = value;

        // remove a classe após a animação
        setTimeout(() => {
            counterSpan.classList.remove(animationClass);
        }, 200);
    });

    const container = document.querySelector('#simulator .items');

    container.addEventListener('click', (e) => {
        const item = e.target.closest('.item');
        if (!item) return;

        // remove active de todos e adiciona ao clicado
        container.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // scroll automático se o item estiver fora da viewport do container
        item.scrollIntoView({
            behavior: 'smooth',      // animação suave
            inline: 'center',        // centra horizontalmente no container
            block: 'nearest'         // não mexe verticalmente
        });
    });
});


// seleciona todos os itens
const items = document.querySelectorAll('.item');

items.forEach(item => {
    item.addEventListener('click', () => {
        // remove a classe active de todos
        items.forEach(i => i.classList.remove('active'));

        // adiciona active apenas ao clicado
        item.classList.add('active');
    });
});

const switches = document.querySelectorAll('#simulator .attribute-box .switch input');

switches.forEach(sw => {
    sw.addEventListener('change', () => {
        if (sw.checked) {
            // desativa todos os outros
            switches.forEach(other => {
                if (other !== sw) {
                    other.checked = false;
                }
            });
        }
    });
});

// Seleciona todos os botões
const buttons = document.querySelectorAll('.private-button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const group = button.closest('.row'); // grupo pai

        // verifica se é o grupo "Acabamento"
        const isAcabamento = group.querySelector('span')?.textContent.includes('Acabamento');

        if (isAcabamento) {
            // Se o botão já está ativo, desativa-o
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                return;
            }

            // Nesse grupo, apenas um ativo
            group.querySelectorAll('.private-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        } else {
            // Nos outros grupos, alterna livremente (toggle)
            button.classList.toggle('active');
        }
    });
});


// Seleciona todos os itens clicáveis
const attributes = document.querySelectorAll('.attribute');



function changePhase(from, to) {
    from.style.transition = 'opacity 0.4s ease';
    to.style.transition = 'opacity 0.4s ease';

    from.style.opacity = '0';
    setTimeout(() => {
        from.classList.add('d-none');
        from.style.display = 'none';
        to.classList.remove('d-none');
        to.style.display = 'flex';
        to.style.opacity = '0';
        setTimeout(() => (to.style.opacity = '1'), 50);
    }, 400);
}

function renderItemsFromStorage() {
    const container = document.querySelector('.simulator-phase-two .items');
    if (!container) return;

    container.innerHTML = ''; // limpa antes de recriar

    const stored = JSON.parse(localStorage.getItem('products')) || [];

    // Mapeamento de key para data-type e ícone
    const productMap = {
        'sofá': { type: 1, icon: '/images/icons/sofa.svg', alt: 'Sofá' },
        'tapete': { type: 2, icon: '/images/icons/tapete.svg', alt: 'Tapete' },
        'puff': { type: 3, icon: '/images/icons/puff.svg', alt: 'Puff' },
        'cadeira': { type: 4, icon: '/images/icons/cadeira.svg', alt: 'Cadeira' },
        'cabeceira': { type: 5, icon: '/images/icons/cabeceira.svg', alt: 'Cabeceira' },
        'colchão': { type: 6, icon: '/images/icons/colchao.svg', alt: 'Colchão' }
    };

    // Seleciona todos os atributos
    const attributes = document.querySelectorAll('.attribute');

    // Percorre cada unidade armazenada
    stored.forEach(productItem => {
        const product = productMap[productItem.name.toLowerCase()];
        if (!product) return;

        const item = document.createElement('div');
        item.classList.add('item', 'text-center');
        item.dataset.type = product.type;

        item.innerHTML = `
            <img src="${product.icon}" alt="${product.alt}" />
            <p>${product.alt}</p>
        `;

        // Adiciona evento de clique para mostrar atributos
        item.addEventListener('click', () => {
            // Esconde todos os atributos
            attributes.forEach(attr => attr.classList.add('d-none'));

            // Mostra apenas o atributo correspondente
            const target = document.querySelector(`.attribute[data-type="${product.type}"]`);
            if (target) target.classList.remove('d-none');

            // Marca o item como ativo
            const allItems = container.querySelectorAll('.item');
            allItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });

        container.appendChild(item);
    });

    // 🔹 Trigger click no primeiro item, se existir
    const firstItem = container.querySelector('.item');
    if (firstItem) firstItem.click();
}

document.querySelector('.add-more-products')?.addEventListener('click', () => {
    const from = document.querySelector('.simulator-phase-two');
    const to = document.querySelector('.simulator-phase-one');
    if (from && to) changePhase(from, to);
});

document.querySelector('.simulator-button-next')?.addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.simulator-phase')]
        .find(el => getComputedStyle(el).display !== 'none' && !el.classList.contains('d-none'));
    if (!visible) return;

    const currentPhase = parseInt(visible.dataset.phase);
    const next = document.querySelector(`.simulator-phase[data-phase="${currentPhase + 1}"]`);

    // 🔸 Fase 1: guardamos cada unidade individualmente
    if (currentPhase === 1) {
        const container = visible.querySelectorAll('.col');
        const productsArray = [];

        container.forEach(col => {
            const name = col.querySelector('span')?.textContent?.trim();
            const count = parseInt(col.querySelector('.counter-text')?.textContent || '0');

            for (let i = 0; i < count; i++) {
                productsArray.push({
                    type: name.toLowerCase(), // ou usa map de data-type
                    name: name,
                    properties: {} // aqui pode guardar propriedades default ou vazias
                });
            }
        });

        localStorage.setItem('products', JSON.stringify(productsArray));
        renderItemsFromStorage();
    }

    // muda de fase com transição suave
    if (next) changePhase(visible, next);
});

