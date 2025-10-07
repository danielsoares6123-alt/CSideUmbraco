let mapLocator, markerLocator;

function initMap() {
    mapLocator = L.map('mapLocator').setView([39.5, -8], 7); // centro de Portugal
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
    }).addTo(mapLocator);
}

// usa localização atual
function usarLocalizacao(btn) {
    if (!navigator.geolocation) return alert("Geolocalização não suportada.");
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "⌛";

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            atualizarMapa(latitude, longitude);
            btn.textContent = original;
            btn.disabled = false;
        },
        () => {
            alert("Não foi possível obter a localização.");
            btn.textContent = original;
            btn.disabled = false;
        }
    );
}

function procurarLavandaria() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return alert("Insere uma localização ou usa o botão 📍");

    $.ajax({
        url: "/umbraco/surface/Locator/GetLaundriesLocations",
        method: "GET",
        data: { query: query }, // se a tua API aceitar parâmetros
        dataType: "json"
    })
        .done(function (data) {
            if (!data || data.length === 0) {
                alert("Nenhuma lavandaria encontrada.");
                return;
            }

            // Exemplo: usar a primeira coordenada do resultado
            const first = data[0];
            atualizarMapa(first.lat, first.lng);

            // Opcional: adicionar todos os pontos ao mapa
            data.forEach(loc => {
                L.marker([loc.lat, loc.lng])
                    .addTo(mapLocator)
                    .bindPopup(loc.nome || "Lavandaria Woosh");
            });
        })
        .fail(function () {
            alert("Ocorreu um erro ao obter as lavandarias.");
        });
}

// centra e adiciona marcador
function atualizarMapa(lat, lng) {
    mapLocator.setView([lat, lng], 13);
    if (markerLocator) map.removeLayer(markerLocator);
    markerLocator = L.marker([lat, lng]).addTo(mapLocator).bindPopup("Lavandaria Woosh mais próxima").openPopup();
}

// inicializa ao carregar a página
window.addEventListener('load', initMap);