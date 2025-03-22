// Aqui tenim la classe del mapa! He triat Leaflet perque es mes facil que Google Maps
class Mapa {
    constructor(containerId) {
        // Inicialitzem el mapa amb les coordenades a 0,0 (al mig del mar xd)
        this.map = L.map(containerId).setView([0, 0], 13);
        this.markers = [];  // aqui guardarem els punts del mapa
        
        // Posem el mapa de OpenStreetMap (es gratuit!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ' OpenStreetMap contributors'
        }).addTo(this.map);

        this.init();
    }

    async init() {
        try {
            // Primer mirem on esta l'usuari
            const position = await this.getPosicioActual();
            this.actualitzarPosInitMapa(position.lat, position.lon);
            this.mostrarPuntInicial();
        } catch (error) {
            console.error('No puc trobar on estas:', error);
        }
    }

    mostrarPuntInicial() {
        // Posem un punt on esta l'usuari amb un emoji xulo
        if (this.userMarker) {
            this.userMarker.remove();
        }
        this.userMarker = L.marker([this.map.getCenter().lat, this.map.getCenter().lng], {
            icon: L.divIcon({
                className: 'user-location',
                html: '📍',
                iconSize: [25, 25]
            })
        })
        .bindPopup('Estàs aquí')
        .addTo(this.map);
    }

    actualitzarPosInitMapa(lat, lon) {
        // Movem el mapa a on esta l'usuari
        this.map.setView([lat, lon], 13);
        if (this.userMarker) {
            this.userMarker.setLatLng([lat, lon]);
        }
    }

    mostrarPunt(lat, lon, desc = "") {
        // Afegim un punt nou al mapa
        const marker = L.marker([lat, lon])
            .bindPopup(desc)
            .addTo(this.map);
        this.markers.push(marker);
        return marker;
    }

    borrarPunt() {
        // Borrem tots els punts del mapa
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    async getPosicioActual() {
        // Intentem trobar on esta l'usuari
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('El teu navegador no sap on estas :('));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}

export default Mapa;
