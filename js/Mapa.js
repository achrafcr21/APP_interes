class Mapa {
    constructor(containerId) {
        this.map = L.map(containerId).setView([0, 0], 13);
        this.markers = [];
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.init();
    }

    async init() {
        try {
            const position = await this.getPosicioActual();
            this.actualitzarPosInitMapa(position.lat, position.lon);
            this.mostrarPuntInicial();
        } catch (error) {
            console.error('Error getting initial position:', error);
        }
    }

    mostrarPuntInicial() {
        if (this.userMarker) {
            this.userMarker.remove();
        }
        this.userMarker = L.marker([this.map.getCenter().lat, this.map.getCenter().lng], {
            icon: L.divIcon({
                className: 'user-location',
                html: '📍',
                iconSize: [25, 25]
            })
        }).addTo(this.map);
    }

    actualitzarPosInitMapa(lat, lon) {
        this.map.setView([lat, lon], 13);
        if (this.userMarker) {
            this.userMarker.setLatLng([lat, lon]);
        }
    }

    mostrarPunt(lat, lon, desc = "") {
        const marker = L.marker([lat, lon])
            .bindPopup(desc)
            .addTo(this.map);
        this.markers.push(marker);
        return marker;
    }

    borrarPunt() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    async getPosicioActual() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
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
