// Configurar el mapa con Leaflet.js
const mapCenter = [41.3851, 2.1734]; // Coordenadas de Barcelona
const zoomLevel = 13;

// Crear el mapa y añadir el tile layer de OpenStreetMap
const map = L.map('map').setView(mapCenter, zoomLevel);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Añadir un marcador de prueba con popup
const marcadorPrueba = L.marker([41.3870, 2.1699]).addTo(map)
    .bindPopup("Este es un punto de interés en Barcelona")
    .openPopup();

// Detectar la ubicación del usuario y añadir un marcador en su posición
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Añadir un marcador en la ubicación del usuario
        L.marker([userLat, userLng]).addTo(map)
            .bindPopup("Estás aquí").openPopup();

        // Centrar el mapa en la ubicación del usuario
        map.setView([userLat, userLng], 13);
    }, function (error) {
        console.error("Error en la geolocalización:", error);
    });
} else {
    console.error("Geolocalización no disponible en este navegador.");
}
