var productIndex = -1;
localStorage.removeItem("products");

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
            const value = button.dataset.value; // Tecido ou Pele
            // Atualiza a propriedade do produto correspondente
            updateProductProperty(productIndex, "finish", value);

            // Marca o botão como ativo visualmente
            button.parentElement.querySelectorAll('.finish-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
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
                        alert("teste");
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

    // Mapeamento de key para data-type e ícone
    const productMap = {
        'sofá': { type: 1, icon: '/images/icons/sofa.svg', alt: 'Sofá' },
        'tapete': { type: 2, icon: '/images/icons/tapete.svg', alt: 'Tapete' },
        'puff': { type: 3, icon: '/images/icons/puff.svg', alt: 'Puff' },
        'cadeira': { type: 4, icon: '/images/icons/cadeira.svg', alt: 'Cadeira' },
        'cabeceira': { type: 5, icon: '/images/icons/cabeceira.svg', alt: 'Cabeceira' },
        'colchão': { type: 6, icon: '/images/icons/colchao.svg', alt: 'Colchão' }
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

    // 🔹 Atualização normal das propriedades
    if (key === "specifications") {
        if (typeof products[productIndex].properties[key] !== "object") {
            products[productIndex].properties[key] = { name: value };
        } else {
            products[productIndex].properties[key].name = value;
        }
    } else if (["x", "y", "result"].includes(key)) {
        if (!products[productIndex].properties.specifications) {
            products[productIndex].properties.specifications = {};
        }
        products[productIndex].properties.specifications[key] = value;
    } else {
        products[productIndex].properties[key] = value;
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

document.querySelector('.simulator-button-next')?.addEventListener('click', () => {
    const visible = [...document.querySelectorAll('.simulator-phase')]
        .find(el => getComputedStyle(el).display !== 'none' && !el.classList.contains('d-none'));
    if (!visible) return;

    const currentPhase = parseInt(visible.dataset.phase);
    const next = document.querySelector(`.simulator-phase[data-phase="${currentPhase + 1}"]`);

    // 🔸 Fase 1: guardamos cada unidade individualmente
    if (currentPhase === 1) {
        const container = visible.querySelectorAll('.col');
        let products = JSON.parse(localStorage.getItem('products')) || [];

        const newProductsArray = [];

        container.forEach(col => {
            const name = col.querySelector('span')?.textContent?.trim();
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
    }


    // 🔹 Atualiza visual das fases no topo
    updatePhasesProgress(currentPhase);

    // muda de fase com transição suave
    if (next) changePhase(visible, next);
});

// ---- Função auxiliar para marcar fases concluídas ----
function updatePhasesProgress(currentPhase) {
    const phases = document.querySelectorAll('.simulator-phaser .phase');
    const titleEl = document.querySelector('.simulator-title');

    // Textos correspondentes a cada fase
    const phaseTitles = {
        0: "PRODUTOS E QUANTIDADE",
        1: "CARACTERÍSTICAS DO PRODUTO",
        2: "",
        3: "Serviços e Acabamentos",
        4: "Resumo e Confirmação"
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
    if (titleEl && phaseTitles[currentPhase]) {
        titleEl.textContent = phaseTitles[currentPhase];
    }
}
