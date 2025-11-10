var productIndex = -1;
localStorage.removeItem("products");

const lang = window.location.pathname.startsWith('/es') ? 'es' : 'pt';

const productPrices = {
    sofá: {
        "1_lugares": { limpeza: 47, protecao: 41, ambos: 68 },
        "2_lugares": { limpeza: 68, protecao: 62, ambos: 100 },
        "2_lugares_chaise_long": { limpeza: 126, protecao: 105, ambos: 190 },
        "3_lugares": { limpeza: 79, protecao: 68, ambos: 116 },
        "4_lugares": { limpeza: 100, protecao: 84, ambos: 147 },
        "5_lugares": { limpeza: 126, protecao: 105, ambos: 190 }
    },
    puff: {
        "1_lugares": { limpeza: 41, protecao: 35, ambos: 63 },
        "2_lugares": { limpeza: 47, protecao: 41, ambos: 68 }
    },
    cadeira: [
        { name: "Cadeirão", limpeza: 41, protecao: 35, ambos: 63 },
        { name: "Assento/costas", limpeza: 16, protecao: 14, ambos: 21 },
        { name: "Só assento", limpeza: 12, protecao: 10, ambos: 16 },
        { name: "Chaise Long", limpeza: 53, protecao: 44, ambos: 79 }
    ],
    tapete: [
        { name: "Redondo", limpeza: 13, protecao: 9, ambos: 17 },
        { name: "Quadrado", limpeza: 13, protecao: 9, ambos: 17 },
        { name: "Retângulo", limpeza: 13, protecao: 9, ambos: 17 },
        { name: "Outro", limpeza: 13, protecao: 9, ambos: 17 }
    ],
    colchão: [
        { name: "Bebé", limpeza: 37, protecao: 32, ambos: 53 },
        { name: "Individual", limpeza: 53, protecao: 44, ambos: 79 },
        { name: "Casal", limpeza: 63, protecao: 54, ambos: 95 }
    ],
    cabeceira: [
        { name: "Cabeceira cama", limpeza: 47, protecao: 40, ambos: 68 }
    ]
};



document.addEventListener('click', function (e) {
    const btn = e.target.closest('.counter-btn');
    if (!btn) return;

    const attribute = btn.closest('.attribute');
    if (!attribute) return;

    // ⚠️ Só executa se for o atributo com data-type="1" (sofá)
    if (attribute.dataset.type !== '1') return;

    const container = btn.closest('.simulator-counter');
    const text = container.querySelector('.counter-text');
    let value = parseInt(text.textContent, 10);

    // 🔹 Atualiza o switch consoante o número de lugares
    const switchContainer = attribute.querySelector('.chaise-switch-container');

    if (value === 2) {
        // Se ainda não existe o switch, cria
        if (!switchContainer.querySelector('.switch')) {
            switchContainer.innerHTML = `
                <label class="switch mt-3 cursor-pointer">
                    <input type="checkbox" class="hidden" data-open-details="1" data-name="Chaise Long" />
                    <span class="slider"></span>
                </label>
                <p class="small mt-1 mb-0">Chaise Long</p>
            `;
        }
    } else {
        // Remove se o contador mudar de 2
        switchContainer.innerHTML = '';
    }
});


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

        if (btn.classList.contains("counter-inner")) {
            updateProductProperty(productIndex, "lugares", value);
        }

        // adiciona animação
        counterSpan.classList.add(animationClass);

        // atualiza o valor
        counterSpan.textContent = value;

        // remove a classe após a animação
        setTimeout(() => {
            counterSpan.classList.remove(animationClass);
        }, 200);
    });

    // Seleciona todos os botões de finish
    document.querySelectorAll('.finish-button').forEach(button => {
        button.addEventListener('click', () => {
            const serviceButtons = document.querySelectorAll('.service-s-button');
            const allActive = Array.from(serviceButtons).every(b => b.classList.contains('active'));

            const products = JSON.parse(localStorage.getItem('products')) || [];
            if (!products[productIndex]) return;

            const value = button.dataset.value; // Tecido ou Pele
            const currentFinish = products[productIndex].properties?.finish;

            // Toggle: se já está selecionado, remove; se não, define
            const newFinish = currentFinish === value ? null : value;
            updateProductProperty(productIndex, "finish", newFinish);

            // Atualiza classes visualmente
            button.parentElement.querySelectorAll('.finish-button').forEach(b => b.classList.remove('active'));
            if (newFinish) button.classList.add('active');

            // Se for Pele, ativa todos os service-s-button apenas se algum não estiver ativo
            if (value === "Pele" && newFinish) {

                if (!allActive) {
                    serviceButtons.forEach(b => {
                        if (!b.classList.contains('active')) {
                            b.click();
                        }
                    });
                }
            } else if (value === "Pele") {
                serviceButtons.forEach(b => b.click());
            } else {
                if (allActive) {
                    serviceButtons.forEach(b => b.click());
                }
            }

        });
    });

    // 🔸 Delegação de evento para o switch "Chaise Long"
    document.addEventListener('change', (e) => {
        const switchEl = e.target.closest('.chaise-switch-container input[type="checkbox"]');
        if (!switchEl) return;

        const products = JSON.parse(localStorage.getItem('products')) || [];
        if (!products[productIndex]) return;

        const hasChaise = switchEl.checked;

        // Atualiza o produto
        updateProductProperty(productIndex, "hasChaise", hasChaise);

        // Opcional: valida novamente o produto
        validateProductFields(productIndex);
    });



    // Seleciona todos os botões de service
    document.querySelectorAll('.service-s-button').forEach(button => {
        button.addEventListener('click', () => {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            if (!products[productIndex]) return;

            // Atualiza o array de services
            const container = button.parentElement; // ou outro contêiner adequado
            const selectedServices = Array.from(container.querySelectorAll('.service-s-button.active'))
                .map(b => b.dataset.value);


            // Guarda no localStorage
            products[productIndex].properties.service = selectedServices;
            localStorage.setItem('products', JSON.stringify(products));
            validateProductFields(productIndex);
        });
    });

    document.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-icon');
        if (!deleteBtn) return;

        // 🔹 Pega o item pai
        const itemEl = deleteBtn.closest('.item');
        if (!itemEl) return;

        const index = parseInt(itemEl.dataset.index);

        // 🔹 Remove do localStorage
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.splice(index, 1); // remove o item correspondente
        localStorage.setItem('products', JSON.stringify(products));

        // 🔹 Remove do DOM
        itemEl.remove();

        // 🔹 Atualiza os data-index restantes
        const remainingItems = document.querySelectorAll('.item');
        remainingItems.forEach((el, i) => {
            el.dataset.index = i;
        });

        // 🔹 Seleciona outro item
        if (remainingItems.length === 0) return; // não há nenhum item

        let newIndexItem = remainingItems[index - 1] || remainingItems[index]; // tenta anterior, senão seguinte
        if (newIndexItem) {
            newIndexItem.click(); // trigger click
        }
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

    function calcular(inputX, inputY, resultEl, productIndex) {
        const x = parseFloat(inputX.value) || 0;
        const y = parseFloat(inputY.value) || 0;
        const area = Math.round(x * y); // ou fórmula específica
        resultEl.textContent = area ? `${area} m²` : '';

        // Atualiza o localStorage dentro de properties.specifications
        updateProductProperty(productIndex, "x", x);
        updateProductProperty(productIndex, "y", y);
        updateProductProperty(productIndex, "result", area);
    }


    const outroX = document.getElementById('outroX');
    const outroY = document.getElementById('outroY');
    const outrosResultados = document.getElementById('outrosResultados');
    const retanguloX = document.getElementById('retanguloX');
    const retanguloY = document.getElementById('retanguloY');
    const retanguloResultados = document.getElementById('retanguloResultados');
    const quadradoX = document.getElementById('quadradoX');
    const quadradoY = document.getElementById('quadradoY');
    const quadradoResultados = document.getElementById('quadradoResultados');
    const redondoInput = document.getElementById('redondo');
    const redondoResultados = document.getElementById('redondoResultados');

    function calcularAreaCirculo(productIndex) {
        const d = parseFloat(redondoInput.value) || 0;
        const raio = d / 2;
        const area = Math.PI * Math.pow(raio, 2);

        // Atualiza o resultado na UI
        redondoResultados.textContent = area ? `${Math.round(area)} m²` : '';

        // Atualiza o localStorage
        // Assume que o nome do specification já está definido (ex.: "Redondo")
        updateProductProperty(productIndex, "x", d);       // diâmetro
        updateProductProperty(productIndex, "y", d);       // círculo usa mesmo valor para Y
        updateProductProperty(productIndex, "result", Math.round(area));
    }

    outroX.addEventListener('input', () => calcular(outroX, outroY, outrosResultados, productIndex));
    outroY.addEventListener('input', () => calcular(outroX, outroY, outrosResultados, productIndex));

    retanguloX.addEventListener('input', () => calcular(retanguloX, retanguloY, retanguloResultados, productIndex));
    retanguloY.addEventListener('input', () => calcular(retanguloX, retanguloY, retanguloResultados, productIndex));

    quadradoX.addEventListener('input', () => calcular(quadradoX, quadradoY, quadradoResultados, productIndex));
    quadradoY.addEventListener('input', () => calcular(quadradoX, quadradoY, quadradoResultados, productIndex));

    redondoInput.addEventListener('input', () => calcularAreaCirculo(productIndex));
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
        // Desativa os outros switches
        if (sw.checked) {
            switches.forEach(other => {
                if (other !== sw) other.checked = false;
            });
        }

        // Esconde todos os .switch-details
        document.querySelectorAll('#simulator .switch-details').forEach(detail => {
            detail.style.display = 'none';
        });

        // Se o switch tiver data-open-details e estiver ativo
        const openDetails = sw.getAttribute('data-open-details');
        const openName = sw.getAttribute("data-name");

        if (sw.checked) {
            updateProductProperty(productIndex, "specifications", openName);
        } else {
            // Switch desmarcado → remove completamente specifications
            const products = JSON.parse(localStorage.getItem('products')) || [];
            if (products[productIndex]?.properties?.specifications) {
                delete products[productIndex].properties.specifications;
                localStorage.setItem('products', JSON.stringify(products));
                validateProductFields(productIndex);
            }
        }

        if (openDetails && sw.checked) {

            const target = document.querySelector(`#simulator .switch-details[data-id="${openDetails}"]`);
            if (target) {
                // Esconde todas as .attribute-box
                document.querySelectorAll('#simulator .attribute-box').forEach(box => {
                    box.style.display = 'none';
                });

                // Mostra o .switch-details correspondente
                target.style.setProperty('display', 'block', 'important');

                // Adiciona listener ao ícone de voltar (.box-slide-icon)
                const backIcon = target.querySelector('.box-slide-icon');
                if (backIcon) {
                    backIcon.addEventListener('click', () => {
                        // Esconde o detalhe atual
                        target.style.display = 'none';
                        // Mostra novamente todos os .attribute-box
                        document.querySelectorAll('#simulator .attribute-box').forEach(box => {
                            box.style.display = 'block';
                        });
                        // Desmarca todos os switches
                        switches.forEach(s => s.checked = false);
                    }, { once: true }); // evita múltiplos listeners duplicados
                }
            }
        } else {
            // Se o switch for desativado, volta a mostrar os attribute-box
            document.querySelectorAll('#simulator .attribute-box').forEach(box => {
                box.style.display = 'block';
            });
        }
    });
});



// Seleciona todos os botões
const buttons = document.querySelectorAll('.private-button');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
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

    // Mapeamento de produtos com traduções
    const productMap = {
        'sofá': {
            type: 1,
            icon: '/images/icons/sofa.svg',
            alt: lang === 'es' ? 'Sofá' : 'Sofá',
            name: lang === 'es' ? 'Sofá' : 'Sofá'
        },
        'tapete': {
            type: 2,
            icon: '/images/icons/tapete.svg',
            alt: lang === 'es' ? 'Alfombra' : 'Tapete',
            name: lang === 'es' ? 'Alfombra' : 'Tapete'
        },
        'puff': {
            type: 3,
            icon: '/images/icons/puff.svg',
            alt: lang === 'es' ? 'Puf' : 'Puff',
            name: lang === 'es' ? 'Puf' : 'Puff'
        },
        'cadeira': {
            type: 4,
            icon: '/images/icons/cadeira.svg',
            alt: lang === 'es' ? 'Silla' : 'Cadeira',
            name: lang === 'es' ? 'Silla' : 'Cadeira'
        },
        'cabeceira': {
            type: 5,
            icon: '/images/icons/cabeceira.svg',
            alt: lang === 'es' ? 'Cabecero' : 'Cabeceira',
            name: lang === 'es' ? 'Cabecero' : 'Cabeceira'
        },
        'colchão': {
            type: 6,
            icon: '/images/icons/colchao.svg',
            alt: lang === 'es' ? 'Colchón' : 'Colchão',
            name: lang === 'es' ? 'Colchón' : 'Colchão'
        }
    };


    // Seleciona todos os atributos e elementos .finish
    const attributes = document.querySelectorAll('.attribute');
    const finishes = document.querySelectorAll('.finish');

    stored.forEach((productItem, index) => {  // <- pegamos o index
        const product = productMap[productItem.name.toLowerCase()];
        if (!product) return;

        const item = document.createElement('div');
        item.classList.add('item', 'text-center', 'position-relative');
        item.dataset.type = product.type;
        item.dataset.index = index; // <-- armazenamos o índice

        item.innerHTML = `
    <img class="delete-icon" src="/images/icons/lixo.svg" alt="Descartar" />
    <img src="${product.icon}" alt="${product.alt}" />
    <p>${product.alt}</p>
    <img class="done-icon" src="/images/icons/visto.svg" alt="Visto" />
`;

        // Evento de clique
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

            // Esconde finishes se for tipo tapete
            if (product.type === 2) {
                finishes.forEach(f => f.classList.add('d-none'));
            } else {
                finishes.forEach(f => f.classList.remove('d-none'));
            }

            // 🔹 Esconde qualquer switch-details aberto
            document.querySelectorAll('#simulator .switch-details').forEach(detail => {
                detail.style.display = 'none';
            });

            // 🔹 Mostra todos os attribute-box novamente
            document.querySelectorAll('#simulator .attribute-box').forEach(box => {
                box.style.display = 'block';
            });

            // 🔹 Guarda o índice do produto clicado
            productIndex = parseInt(item.dataset.index);

            // ---- Atualiza estado visual conforme o localStorage ----
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const currentProduct = products[productIndex];
            if (!currentProduct) return;

            // ---- Acabamento (Finish) ----
            const finishButtons = document.querySelectorAll('.finish-button');
            const currentFinish = currentProduct.properties?.finish || null;
            finishButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === currentFinish);
            });

            // ---- Serviço (Service) ----
            const serviceButtons = document.querySelectorAll('.service-s-button');
            let selectedServices = currentProduct.properties?.service || [];
            if (!Array.isArray(selectedServices)) selectedServices = [selectedServices];

            serviceButtons.forEach(btn => {
                btn.classList.toggle('active', selectedServices.includes(btn.dataset.value));
            });

            // ---- Counter-text ----
            const counterSpan = document.querySelector('.counter-inner-text');
            console.log(currentProduct.properties.lugares);

            if (counterSpan) {
                counterSpan.textContent =
                    currentProduct.properties.lugares !== undefined
                        ? currentProduct.properties.lugares
                        : "0";
            }

            // ---- Switches ----
            const switchesDisplay = document.querySelectorAll('.switch');
            const currentSpec = currentProduct.properties?.specifications?.name || null;

            switchesDisplay.forEach(sw => {

                const input = sw.querySelector('input[type="checkbox"]');
                if (input) {
                    const openDetails = input.getAttribute('data-open-details');
                    const target = document.querySelector(`#simulator .switch-details[data-id="${openDetails}"]`);

                    // 🔹 Preenche inputs com valores anteriores (x, y ou redondo)
                    const specs = currentProduct?.properties?.specifications || {};
                    const { x, y } = specs;

                    let hasXY = false;

                    const id = input.id.toLowerCase();
                    if (id.includes('x') && x !== undefined) {
                        input.value = x;
                        hasXY = true;
                    } else if (id.includes('y') && y !== undefined) {
                        input.value = y;
                        hasXY = true;
                    }

                    // Se não houver x/y, tenta colocar no input com id "redondo"
                    if (!hasXY && x !== undefined) {
                        const redondoInput = target.querySelector('#redondo');
                        if (redondoInput) {
                            redondoInput.value = x;
                        }
                    }

                    if (currentSpec != null) {
                        if (currentSpec == input.dataset.name) {
                            input.checked = true;
                            target.style.setProperty('display', 'block', 'important');
                            document.querySelectorAll('#simulator .attribute-box').forEach(box => {
                                box.style.display = 'none';
                            });
                        } else {
                            input.checked = false;
                        }
                    } else {
                        input.checked = false;
                    }
                }
            });



        });



        container.appendChild(item);
    });


    // 🔹 Trigger click no primeiro item, se existir
    const firstItem = container.querySelector('.item');
    if (firstItem) firstItem.click();
}

function updateProductProperty(productIndex, key, value) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    if (!products[productIndex]) return;

    const product = products[productIndex];
    const currentValue = product.properties?.[key];

    // 🔹 Se já existir o mesmo valor, remove (toggle)
    if (currentValue === value) {
        delete product.properties[key];
    } else {
        // 🔹 Atualização normal das propriedades
        if (key === "specifications") {
            if (typeof product.properties[key] !== "object") {
                product.properties[key] = { name: value };
            } else {
                product.properties[key].name = value;
            }
        } else if (["x", "y", "result"].includes(key)) {
            if (!product.properties.specifications) {
                product.properties.specifications = {};
            }
            product.properties.specifications[key] = value;
        } else {
            product.properties[key] = value;
        }
    }

    localStorage.setItem('products', JSON.stringify(products));

    // 🔹 Validação após atualização
    validateProductFields(productIndex);
}


function validateProductFields(productIndex) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[productIndex];
    if (!product) return;

    // Campos obrigatórios por tipo
    const requiredFieldsByType = {
        'sofá': ['finish', 'service', 'lugares'],
        'puff': ['finish', 'service', 'lugares'],
        'cadeira': ['finish', 'service', 'specifications'],
        'tapete': ['service', 'specifications'],
        'colchão': ['finish', 'service', 'specifications'],
        'cabeceira': ['finish', 'service', 'specifications']
    };

    const required = requiredFieldsByType[product.type] || [];
    const missing = [];

    required.forEach(field => {
        if (field === "specifications") {
            const specs = product.properties.specifications;
            if (!specs || Object.keys(specs).length === 0) {
                missing.push(field);
            }
        } else if (field === "lugares") {
            const value = product.properties.lugares;
            if (value === undefined || value === null || value <= 0) {
                missing.push(field);
            }
        } else {
            const value = product.properties[field];
            if (value === undefined || value === null || value === '' ||
                (Array.isArray(value) && value.length === 0)) {
                missing.push(field);
            }
        }
    });


    product.isValid = missing.length === 0;
    product.missingFields = missing;

    localStorage.setItem('products', JSON.stringify(products));

    const itemEl = document.querySelector(`.item[data-index="${productIndex}"]`);
    if (!itemEl) return;

    if (missing.length === 0) {
        // ✔ Done icon
        let doneIcon = itemEl.querySelector('.done-icon');
        if (!doneIcon) {
            doneIcon = document.createElement('div');
            doneIcon.classList.add('done-icon');
            doneIcon.style.position = 'absolute';
            doneIcon.style.top = '-10px';
            doneIcon.style.right = '-10px';
            doneIcon.innerHTML = '✔'; // ou SVG
            itemEl.appendChild(doneIcon);
        }
        doneIcon.style.display = 'block';

        // Background do item
        itemEl.style.backgroundColor = '#bb9469';

        // Aplica o filtro complexo nas imagens
        itemEl.querySelectorAll('img').forEach(img => {
            img.style.filter = 'brightness(0) saturate(100%) invert(99%) sepia(8%) saturate(2%) hue-rotate(258deg) brightness(110%) contrast(100%)';
        });

        // Texto branco
        itemEl.querySelectorAll('p').forEach(p => {
            p.style.color = '#fff';
        });
    }
    else {
        // Produto incompleto: remove done-icon e volta ao normal
        const doneIcon = itemEl.querySelector('.done-icon');
        if (doneIcon) doneIcon.style.display = 'none';
        itemEl.style.backgroundColor = '';
        itemEl.querySelectorAll('img').forEach(img => img.style.filter = '');
        itemEl.querySelectorAll('p').forEach(p => p.style.color = '');
    }
}




document.querySelector('.add-more-products')?.addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.simulator-phase')]
        .find(el => getComputedStyle(el).display !== 'none' && !el.classList.contains('d-none'));
    if (!visible) return;

    const from = document.querySelector('.simulator-phase-two');
    const to = document.querySelector('.simulator-phase-one');
    if (from && to) changePhase(from, to);

    updatePhasesProgress(0);
});

document.querySelector('.simulator-back').addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.simulator-phase')]
        .find(el => !el.classList.contains('d-none'));
    if (!visible) return;

    const currentPhase = parseInt(visible.dataset.phase);
    const prevPhase = Math.max(currentPhase - 1, 1);
    const prev = document.querySelector(`.simulator-phase[data-phase="${prevPhase}"]`);

    if (prev) {
        // Esconde a fase atual
        visible.classList.add('d-none');
        visible.style.display = 'none';
        visible.style.opacity = "0";

        // Mostra a fase anterior
        prev.classList.remove('d-none');
        prev.style.display = 'flex';
        prev.style.opacity = "1";
    }

    // 🔹 Atualiza visual das fases no topo
    updatePhasesProgress(currentPhase - 2);

    // 🔹 Se voltar à fase 1, esconde o botão "voltar"
    if (prevPhase === 1) {
        const backBtn = document.querySelector('.simulator-back');
        backBtn.classList.add('d-none');
        backBtn.style.display = 'none';
    } else {
        const backBtn = document.querySelector('.simulator-back');
        backBtn.classList.remove('d-none');
        backBtn.style.display = 'inline-block';
    }

    // 🔹 Ajusta visibilidade dos botões de navegação
    const nextBtn = document.querySelector('.simulator-button-next');
    const submitBtn = document.querySelector('.submit-button');

    nextBtn.classList.remove('d-none');
    nextBtn.style.display = 'inline-block';

    submitBtn.classList.add('d-none');
    submitBtn.style.display = 'none';
});




document.querySelector('.simulator-button-next')?.addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.simulator-phase')]
        .find(el => getComputedStyle(el).display !== 'none' && !el.classList.contains('d-none'));
    if (!visible) return;

    const currentPhase = parseInt(visible.dataset.phase);
    const next = document.querySelector(`.simulator-phase[data-phase="${currentPhase + 1}"]`);
    const backBtn = document.querySelector('.simulator-back');

    // 🔸 Fase 1: guardamos cada unidade individualmente
    if (currentPhase === 1) {
        backBtn.classList.remove('d-none');
        backBtn.style.display = 'inline-block';
        const counters = visible.querySelectorAll('.counter-text');
        const hasCount = [...counters].some(c => parseInt(c.textContent || '0') > 0);

        if (!hasCount) {
            Swal.fire({
                toast: false,
                position: 'middle',
                icon: 'error',
                title: 'Deve adicionar pelo menos uma unidade antes de avançar!',
                showConfirmButton: false,
                customClass: {
                    popup: 'my-toast-error',
                    title: 'my-toast-title'
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });

            return; // não avança
        }

        const container = visible.querySelectorAll('.col');
        let products = JSON.parse(localStorage.getItem('products')) || [];

        const newProductsArray = [];

        container.forEach(col => {
            const name = col.querySelector('span')?.dataset.name?.trim();
            const count = parseInt(col.querySelector('.counter-text')?.textContent || '0');

            // Pega produtos existentes do mesmo tipo
            const existingProducts = products.filter(p => p.name === name);

            for (let i = 0; i < count; i++) {
                if (existingProducts[i]) {
                    // Mantém as propriedades já existentes
                    newProductsArray.push(existingProducts[i]);
                } else {
                    // Adiciona novo produto vazio
                    newProductsArray.push({
                        type: name.toLowerCase(),
                        name: name,
                        properties: {}
                    });
                }
            }
        });

        localStorage.setItem('products', JSON.stringify(newProductsArray));
        renderItemsFromStorage();

        // 🔸 Esconde botão de seguinte e mostra botão de finalizar
        document.querySelector('.simulator-button-next').style.display = 'inline-block';
        document.querySelector('.submit-button').style.display = 'none';
    }

    if (currentPhase === 2) {
        backBtn.classList.remove('d-none');
        backBtn.style.display = 'inline-block';

        document.querySelector('.simulator-back').style.display = 'block';
        // Ao clicar "next", quando fores mudar para a fase 3:
        renderSelectedProductsPricing();

        // 🔸 Esconde botão de seguinte e mostra botão de finalizar
        document.querySelector('.simulator-button-next').style.display = 'none';
        document.querySelector('.submit-button').style.display = 'inline-block';
        document.querySelector('.submit-button').classList.remove("d-none");
    }


    // 🔹 Atualiza visual das fases no topo
    updatePhasesProgress(currentPhase);

    // muda de fase com transição suave
    if (next) changePhase(visible, next);
});

function renderSelectedProductsPricing() {
    const container = document.querySelector('.selected-products-pricing');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    container.innerHTML = '';

    // 🔹 Detecta idioma pela URL
    const lang = window.location.pathname.startsWith('/es') ? 'es' : 'pt';

    let totalGlobal = 0;

    products.forEach((product, index) => {
        const { type, properties } = product;
        const priceInfo = productPrices[type];
        let totalPrice = 0;
        let details = '';

        if (!priceInfo || !properties) {
            const msg = lang === 'es'
                ? `Faltan datos para ${product.name}`
                : `Dados em falta para ${product.name}`;
            container.innerHTML += `<div class="product-item">${msg}</div>`;
            return;
        }


        // 🔸 Sofás e Puff
        if ((type === 'sofa' || type === 'sofá') || type === "puff") {
            const lugaresKey = `${properties.lugares}_lugares${properties.hasChaise ? '_chaise_long' : ''}`;
            const serviceType = normalizeService(properties.service);
            totalPrice = priceInfo[lugaresKey]?.[serviceType] || 0;

            const labelLugar = properties.lugares == 1
                ? (lang === 'es' ? 'asiento' : 'lugar')
                : (lang === 'es' ? 'asientos' : 'lugares');

            const chaiseText = properties.hasChaise
                ? (lang === 'es' ? ' (chaise longue)' : ' (chaise long)')
                : '';

            details = `${properties.lugares} ${labelLugar}${chaiseText}`;
        }

        // 🔸 Tapetes
        else if (type === 'tapete') {
            const serviceType = normalizeService(properties.service);
            const spec = properties.specifications;
            const match = Array.isArray(priceInfo)
                ? priceInfo.find(item => item.name.toLowerCase() === spec.name.toLowerCase())
                : Object.values(priceInfo).find(item => item.name.toLowerCase() === spec.name.toLowerCase());

            if (match) {
                const pricePerM2 = match[serviceType] || 0;
                const area = spec.result || 0;

                if (area > 50) {
                    totalPrice = null;
                    details = `${spec.name} — ${area} m² <br/>
                    <small class="text-danger">
                    ${lang === 'es'
                            ? 'Esta alfombra supera los 50 m², contáctenos para una cotización.'
                            : 'Este tapete tem mais de 50 m², contacte-nos para orçamento.'}
                    </small>`;

                } else {
                    totalPrice = pricePerM2 * area;
                    details = `${spec.name} — ${area} m²`;
                }
            }
        }

        // 🔸 Cadeiras
        else if (type === 'cadeira') {
            const serviceType = normalizeService(properties.service);
            const spec = properties.specifications;
            const match = Array.isArray(priceInfo)
                ? priceInfo.find(item => item.name.toLowerCase() === spec.name.toLowerCase())
                : Object.values(priceInfo).find(item => item.name.toLowerCase() === spec.name.toLowerCase());

            if (match) {
                totalPrice = match[serviceType] || 0;
                details = `${spec.name}`;
            } else {
                totalPrice = null;
                details = `${spec.name} — ${lang === 'es' ? 'precio no disponible' : 'preço não disponível'}`;
            }
        }

        // 🔸 Outros produtos
        else if (Array.isArray(priceInfo)) {
            const serviceType = normalizeService(properties.service);
            const match = priceInfo.find(item =>
                item.name.toLowerCase().includes(properties.specification?.toLowerCase() || '') ||
                (type === 'puff' && item.name.toLowerCase() === 'puff')
            );
            if (match) totalPrice = match[serviceType];
            details = match ? match.name : '';
        }

        // 🔸 Traduções
        const translations = {
            pt: {
                finishLabel: "Acabamento",
                serviceLabel: "Serviço",
                finishValues: {
                    "pele": "pele",
                    "tecido": "tecido"
                },
                serviceValues: {
                    "Limpeza": "Limpeza",
                    "Impermeabilização": "Impermeabilização",
                    "Limpeza + Impermeabilização": "Limpeza + Impermeabilização"
                }
            },
            es: {
                finishLabel: "Acabado",
                serviceLabel: "Servicio",
                finishValues: {
                    "pele": "cuero",
                    "tecido": "tela"
                },
                serviceValues: {
                    "Limpeza": "Limpieza",
                    "Impermeabilização": "Impermeabilización",
                    "Limpeza + Impermeabilização": "Limpieza + Impermeabilización"
                }
            }
        };

        // Define a língua ativa (por exemplo, a partir da URL)
        const t = translations[lang];

        // 🔸 Acabamento
        if (properties.finish) {
            const finishTranslated = t.finishValues[properties.finish.toLowerCase()] || properties.finish;
            details += `<br/> <b>${t.finishLabel}: <b class="text-black">${finishTranslated}</b>`;
        }

        // 🔸 Serviço (um ou vários)
        const serviceTranslated = properties.service
            .map(s => t.serviceValues[s] || s)
            .join(' + ');

        // Atualiza total no produto
        product.totalPrice = totalPrice || 0;
        totalGlobal += totalPrice || 0;

        // 🔸 Render HTML
        const html = `
<div class="product-item d-flex justify-content-between align-items-center py-2 border-bottom pt-1 pb-1 ps-2 pe-2">
    <div>
        <strong>${product.name}</strong><br>
        <small>${details}</small><br/>
        <small>${t.serviceLabel}: <b class="text-black">${serviceTranslated}</b></small>
    </div>
    <div class="text-end">
        <span class="price fw-bold">${totalPrice ? totalPrice.toFixed(2) + ' €' : '—'}</span>
    </div>
</div>
`;


        container.insertAdjacentHTML('beforeend', html);
    });

    // Atualiza localStorage com preços
    localStorage.setItem('products', JSON.stringify(products));

    // 🔹 Rodapé (texto de aviso e total)
    const notice = lang === 'es'
        ? '*cargo mínimo de servicio de 70 € para Lisboa y Oporto <br/>*cargo mínimo a determinar fuera de estas zonas'
        : '*valor de serviço mínimo de 70€ para Lisboa e Porto <br/>*valor de serviço mínimo a determinar fora destas zonas';

    const totalLabel = lang === 'es' ? 'Total' : 'Total';

    const totalHtml = `
    <div class="row mt-1 p-2 align-items-center">
        <div class="col text-start small">
            <span>${notice}</span>
        </div>
        <div class="col text-end pt-1">
            <h5 class="fw-bold mb-0">${totalLabel}: ${totalGlobal.toFixed(2)} €</h5>
        </div>
    </div>
    `;

    container.insertAdjacentHTML('beforeend', totalHtml);
}




// Função auxiliar para converter "Limpeza" + "Impermeabilização" em "ambos"
function normalizeService(serviceArray) {
    if (!serviceArray || !serviceArray.length) return 'limpeza';
    const hasLimpeza = serviceArray.includes('Limpeza');
    const hasProtecao = serviceArray.includes('Impermeabilização');
    if (hasLimpeza && hasProtecao) return 'ambos';
    if (hasProtecao) return 'protecao';
    return 'limpeza';
}


// ---- Função auxiliar para marcar fases concluídas ----
function updatePhasesProgress(currentPhase) {
    const phases = document.querySelectorAll('.simulator-phaser .phase');
    const titleEl = document.querySelector('.simulator-title');

    // Textos correspondentes a cada fase por idioma
    const phaseTitles = {
        pt: {
            0: "PRODUTOS E QUANTIDADE",
            1: "CARACTERÍSTICAS DO PRODUTO",
            2: "",
            3: "Serviços e Acabamentos",
            4: "Resumo e Confirmação"
        },
        es: {
            0: "PRODUCTOS Y CANTIDAD",
            1: "CARACTERÍSTICAS DEL PRODUCTO",
            2: "",
            3: "Servicios y Acabados",
            4: "Resumen y Confirmación"
        }
    };

    // Atualiza visuais das fases
    phases.forEach(phase => {
        const number = parseInt(phase.dataset.number);
        if (number <= currentPhase) {
            phase.classList.add('done');
        } else {
            phase.classList.remove('done');
        }
    });

    // Atualiza o título se existir
    const titleText = phaseTitles[lang]?.[currentPhase];
    if (titleEl && titleText) {
        titleEl.textContent = titleText;
    }
}


// 🔸 Evento do botão FINALIZAR
document.querySelector('.submit-button').addEventListener('click', async (e) => {
    e.preventDefault();

    // 🔹 Pega o token do anti-forgery na página
    const antiForgeryToken = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

    // Traduções
    const translations = {
        pt: {
            title: "Finalize o seu pedido",
            name: "Qual o seu nome?",
            email: "Qual o seu email?",
            phone: "Contacto telefónico",
            location: "Localidade",
            send: "Submeter Pedido",
            cancel: "Cancelar"
        },
        es: {
            title: "Finaliza tu solicitud",
            name: "¿Cuál es tu nombre?",
            email: "¿Cuál es tu correo electrónico?",
            phone: "Número de teléfono",
            location: "Ubicación",
            send: "Enviar solicitud",
            cancel: "Cancelar"
        }
    };

    const t = translations[lang];

    // SweetAlert com placeholders traduzidos
    const { value: formValues } = await Swal.fire({
        title: `<span class="text-center text-black mt-3 simulator-title text-uppercase">${t.title}</span>`,
        html: `
    <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required"
        id="swal-name" type="text" name="name" placeholder="${t.name}">
    <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required"
        id="swal-email" type="email" name="email" placeholder="${t.email}">
    <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required"
        id="swal-phone" type="tel" name="phone" placeholder="${t.phone}">
    <input class="ps-0 border-radius-0px border-color-extra-medium-gray bg-transparent form-control required"
        id="swal-location" type="text" name="location" placeholder="${t.location}">
    <input type="hidden" name="__RequestVerificationToken" value="${antiForgeryToken}">
`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: t.send,
        cancelButtonText: t.cancel,
        customClass: {
            confirmButton: 'ws-button text-uppercase',
            cancelButton: 'ws-button text-uppercase ws-button-cancel'
        },
        preConfirm: () => {
            const name = document.getElementById('swal-name').value.trim();
            const email = document.getElementById('swal-email').value.trim();
            const phone = document.getElementById('swal-phone').value.trim();
            const location = document.getElementById('swal-location').value.trim();

            if (!name || name.length < 2) {
                Swal.showValidationMessage(`Por favor, insira um nome válido.`);
                return false;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailPattern.test(email)) {
                Swal.showValidationMessage(`Por favor, insira um email válido.`);
                return false;
            }

            const phonePattern = /^\d{9,}$/;
            if (!phone || !phonePattern.test(phone)) {
                Swal.showValidationMessage(`Por favor, insira um número de telefone válido (mínimo 9 dígitos).`);
                return false;
            }

            if (!location || location.length < 2) {
                Swal.showValidationMessage(`Por favor, insira uma localidade válida.`);
                return false;
            }

            return {
                name,
                email,
                phone,
                location,
                __RequestVerificationToken: antiForgeryToken // ✅ token incluído
            };
        }
    });




    if (formValues) {
        // Cria o FormData utilizando a função prepareFormDataProducts
        const formData = prepareFormDataProducts({
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            location: formValues.location,
            __RequestVerificationToken: formValues.__RequestVerificationToken 
        });

        // Log de todos os pares do FormData
        console.log('--- FormData ---');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // 🔹 Envia para o endpoint do Umbraco Surface Controller
        fetch('/umbraco/surface/Contacts/SendSimulatorForm', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Pedido enviado com sucesso!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'ws-button'
                        }
                    }).then(() => {
                        // 🔹 Faz refresh da página ou volta ao topo
                        window.location.reload(); // recarrega a página
                        // ou, se só queres ir ao topo:
                        // window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                } else {
                    Swal.fire({
                        title: 'Erro',
                        text: data.message || 'Ocorreu um erro ao enviar o pedido.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'ws-button'
                        }
                    });
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    title: 'Erro',
                    text: 'Ocorreu um erro na comunicação com o servidor.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'ws-button'
                    }
                });
            });
    }

    function prepareFormDataProducts(formFields = {}) {
        // Obtem os produtos do localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];

        // Cria o FormData
        const formData = new FormData();

        // Adiciona campos do formulário (nome, email, etc.)
        for (const key in formFields) {
            formData.append(key, formFields[key]);
        }

        // Adiciona os produtos organizados
        products.forEach((product, index) => {
            const baseKey = `products[${index}]`;

            formData.append(`${baseKey}[name]`, product.name);
            formData.append(`${baseKey}[type]`, product.type);
            formData.append(`${baseKey}[totalPrice]`, product.totalPrice);

            const props = product.properties || {};
            for (const propKey in props) {
                const value = props[propKey];

                // Se for array (ex: service), transformamos em JSON
                if (Array.isArray(value)) {
                    formData.append(`${baseKey}[properties][${propKey}]`, JSON.stringify(value));
                }
                // Se for objeto (ex: specifications), transformamos em JSON
                else if (typeof value === 'object' && value !== null) {
                    formData.append(`${baseKey}[properties][${propKey}]`, JSON.stringify(value));
                }
                else {
                    formData.append(`${baseKey}[properties][${propKey}]`, value);
                }
            }
        });

        // Apenas para debug, logamos todos os pares do FormData
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        return formData;
    }


});
