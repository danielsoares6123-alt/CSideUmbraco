const numDots = 5; // número inicial
const maxDots = 20; // limite máximo de bolas na tela
const dots = [];
const container = document.getElementById("background-dots");
const dotSources = ["/images/dot01.svg", "/images/dot02.svg", "/images/dot03.svg"];
const minDistance = 150;

function createDot() {
    if (dots.length >= maxDots) {
        const oldest = dots.shift();
        container.removeChild(oldest.el);
    }

    let x, y, side;
    const maxAttempts = 50;
    let attempts = 0;

    do {
        side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left

        switch (side) {
            case 0: // topo
                x = Math.random() * window.innerWidth;
                y = -200; // fora da tela
                break;
            case 1: // direita
                x = window.innerWidth + 200;
                y = Math.random() * window.innerHeight;
                break;
            case 2: // fundo
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 200;
                break;
            case 3: // esquerda
                x = -200;
                y = Math.random() * window.innerHeight;
                break;
        }

        attempts++;
    } while (dots.some(d => Math.hypot(d.x - x, d.y - y) < minDistance) && attempts < maxAttempts);

    const dot = document.createElement("img");
    const randomIndex = Math.floor(Math.random() * dotSources.length);
    dot.src = dotSources[randomIndex];

    const size = Math.random() * 500 + 20;
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.position = "absolute";
    dot.style.pointerEvents = "none";

    container.appendChild(dot);

    // Velocidades: direciona para dentro da tela
    let vx = (Math.random() - 0.5) * 2;
    let vy = (Math.random() - 0.5) * 3;

    // ajusta direção inicial com base no lado
    switch (side) {
        case 0: vy = Math.abs(vy); break; // topo: desce
        case 1: vx = -Math.abs(vx); break; // direita: vai para esquerda
        case 2: vy = -Math.abs(vy); break; // fundo: sobe
        case 3: vx = Math.abs(vx); break; // esquerda: vai para direita
    }

    dots.push({
        el: dot,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: size
    });
}


// cria bolas iniciais
for (let i = 0; i < numDots; i++) createDot();

function animateDots() {
    for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
    }
    requestAnimationFrame(animateDots);
}

setInterval(createDot, 5000);
animateDots();
