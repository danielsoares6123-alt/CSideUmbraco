
initMapLaundries(laundries);

async function obterMapboxToken() {
    try {
        const response = await fetch('/api/mapbox/token');
        const data = await response.json();
        return data.token;
    } catch (err) {
        console.error('Erro ao obter token Mapbox:', err);
        return null;
    }
}

async function initMapLaundries(listLaundries) {
    const token = await obterMapboxToken();
    if (!token) return;

    mapboxgl.accessToken = token;

    const TEST_MODE = false; // ← se true, não carrega GLBs para não gerar custos
    const style = 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
        container: 'mapLaundries',
        style: style,
        center: [-8.459, 39.635],
        zoom: 6,
        pitch: 40,
        antialias: true
    });

    map.addControl(new mapboxgl.NavigationControl());

    const laundries = listLaundries;
    let missingCount = 0;
    const layers3D = [];

    map.on('load', () => {

        // === 📍 Calcular limites geográficos (bounding box) ===
        const bounds = new mapboxgl.LngLatBounds();

        laundries.forEach(laundry => {
            if (laundry.lat === 0 || laundry.lon === 0) {
                missingCount++;
                return;
            }

            // Adiciona ponto aos limites
            bounds.extend([laundry.lon, laundry.lat]);

            const modelOrigin = [laundry.lon, laundry.lat];
            const modelAltitude = 0;
            const modelRotate = [Math.PI / 2, 0, 0];
            const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
            const modelTransform = {
                translateX: modelAsMercatorCoordinate.x,
                translateY: modelAsMercatorCoordinate.y,
                translateZ: modelAsMercatorCoordinate.z,
                rotateX: modelRotate[0],
                rotateY: modelRotate[1],
                rotateZ: modelRotate[2],
                scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 250
            };

            const customLayer = {
                id: `3d-model-${laundry.name.replace(/\s/g, '-')}`,
                type: 'custom',
                renderingMode: '3d',
                onAdd: function (map, gl) {
                    this.camera = new THREE.PerspectiveCamera();
                    this.scene = new THREE.Scene();

                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
                    directionalLight.position.set(50, 50, 100);
                    const pointLight1 = new THREE.PointLight(0xffffff, 0.2);
                    pointLight1.position.set(-50, -50, 50);
                    const pointLight2 = new THREE.PointLight(0xffffff, 0.2);
                    pointLight2.position.set(50, -50, 50);

                    this.scene.add(ambientLight, directionalLight, pointLight1, pointLight2);

                    if (!TEST_MODE) {
                        const loader = new THREE.GLTFLoader();
                        loader.load('/media/t2kpdytx/woosh_bubble.glb', gltf => {
                            gltf.scene.traverse((child) => {
                                if (child.isMesh) {
                                    child.userData.laundryData = {
                                        name: laundry.name,
                                        address: laundry.address,
                                        lat: laundry.lat,
                                        lon: laundry.lon
                                    };
                                }
                            });
                            this.scene.add(gltf.scene);
                        });
                    }

                    this.map = map;
                    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
                    this.renderer.autoClear = false;

                    layers3D.push(this);
                },
                render: function (gl, matrix) {
                    const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
                    const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
                    const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

                    const m = new THREE.Matrix4().fromArray(matrix);
                    const screenScale = modelTransform.scale / Math.pow(2, this.map.getZoom() - 12);

                    const l = new THREE.Matrix4()
                        .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                        .scale(new THREE.Vector3(screenScale, -screenScale, screenScale))
                        .multiply(rotationX)
                        .multiply(rotationY)
                        .multiply(rotationZ);

                    this.camera.projectionMatrix = m.multiply(l);
                    this.renderer.resetState();
                    this.renderer.render(this.scene, this.camera);
                    this.map.triggerRepaint();
                }
            };

            map.addLayer(customLayer);
        });

        laundries.forEach(laundry => {
            if (laundry.lat !== 0 && laundry.lon !== 0) {
                const el = document.createElement('div');
                el.style.width = '100px';
                el.style.height = '100px';
                el.style.background = 'transparent';
                el.style.cursor = 'pointer';

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([laundry.lon, laundry.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML("<b>" + laundry.name + "</b><br>" + laundry.address))
                    .addTo(map);
            } else {
                missingCount++;
            }
        });

        const missingEl = document.getElementById('missingCount');
        if (missingEl) missingEl.textContent = "Lavandarias sem coordenadas: " + missingCount;

        // === 🗺️ Ajustar o mapa automaticamente para mostrar todos os pontos ===
        /*if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
                padding: 100,
                duration: 1000
            });
        }*/
    });
}

const toggleBtn = document.querySelector('.map-toggle');
const mapMenu = document.querySelector('.map-menu');
const tooltip = document.querySelector('.leftArrow');

toggleBtn.addEventListener('click', () => {
    tooltip.classList.toggle('show');
    tooltip.remove();
    mapMenu.classList.toggle('active');
});

// JS
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 6000); // 2 segundos

    const filterButton = document.querySelector('.map-menu button');
    const searchInput = document.getElementById('laundrySearch');

    let filteredLaundries = [];

    // Quando clicar no botão, faz o filtro
    filterButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filtrarLaundries(query);
    });

    async function filtrarLaundries(query) {
        if (!query) {
            Swal.fire({
                position: 'middle',
                icon: 'error',
                title: 'Por favor insira um código postal ou uma rua!',
                showConfirmButton: false,
                customClass: {
                    popup: 'my-toast-error',
                    title: 'my-toast-title'
                }
            });
            return;
        }

        const postalCodeRegex = /^\d{4}-\d{3}$/;
        const onlyNumbers = /^\d+$/;
        const raioKm = 30;

        if (postalCodeRegex.test(query)) {

            // Código postal → coordenadas
            const coords = await obterCoordenadasMapbox(query);
            if (!coords) {
                Swal.fire({
                    position: 'middle',
                    icon: 'error',
                    title: 'Código postal não encontrado!',
                    showConfirmButton: false,
                    customClass: { popup: 'my-toast-error', title: 'my-toast-title' }
                });
                return;
            }

            filteredLaundries = laundries.filter(l => {
                const dist = calcularDistanciaEmKm(coords.lat, coords.lon, l.lat, l.lon);
                return dist <= raioKm;
            });

        } else if (onlyNumbers.test(query)) {
            Swal.fire({
                position: 'middle',
                icon: 'error',
                title: 'Insira um código postal válido!',
                showConfirmButton: false,
                customClass: {
                    popup: 'my-toast-error',
                    title: 'my-toast-title'
                }
            });
            return;

        } else {

            // Rua → coordenadas via Mapbox
            const coords = await obterCoordenadasMapbox(query);
            if (!coords) {
                Swal.fire({
                    position: 'middle',
                    icon: 'error',
                    title: 'Endereço não encontrado!',
                    showConfirmButton: false,
                    customClass: { popup: 'my-toast-error', title: 'my-toast-title' }
                });
                return;
            }


            filteredLaundries = laundries.filter(l => {
                const dist = calcularDistanciaEmKm(coords.lat, coords.lon, l.lat, l.lon);
                return dist <= raioKm;
            });
        }

        initMapLaundries(filteredLaundries);
    }

    async function obterCoordenadasMapbox(texto) {
        try {
            const token = await obterMapboxToken();
            if (!token) return;

            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(texto)}.json?country=pt&limit=1&access_token=${token}`;

            const response = await fetch(url);
            if (!response.ok) {
                console.error("Erro Mapbox:", response.status, response.statusText);
                return null;
            }

            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const center = data.features[0].center;
                return { lon: center[0], lat: center[1] };
            }

            return null;
        } catch (err) {
            console.error("Erro ao obter coordenadas Mapbox:", err);
            return null;
        }
    }



    // ===== Calcular distância entre 2 coordenadas =====
    function calcularDistanciaEmKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }



});
