import PuntInteres from './PuntInteres.js';
import Atraccio from './Atraccio.js';
import Museu from './Museu.js';
import Mapa from './Mapa.js';

class App {
    constructor() {
        this.puntsInteres = [];
        this.mapa = new Mapa('map');
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.tipusSelect = document.getElementById('tipus');
        this.ordenacioSelect = document.getElementById('ordenacio');
        this.filtreNomInput = document.getElementById('filtreNom');
        this.llistaLlocs = document.getElementById('llistaLlocs');
        this.totalElements = document.getElementById('totalElements');
        this.netejarButton = document.getElementById('netejarLlista');
        this.dropZone = document.getElementById('dropZone');
    }

    setupEventListeners() {
        // Filter event listeners
        this.tipusSelect.addEventListener('change', () => this.updateList());
        this.ordenacioSelect.addEventListener('change', () => this.updateList());
        this.filtreNomInput.addEventListener('input', () => this.updateList());
        
        // Clear list button
        this.netejarButton.addEventListener('click', () => this.clearList());

        // Drop zone events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                this.processCSVFile(file);
            }
        });
    }

    async processCSVFile(file) {
        try {
            const text = await file.text();
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            const headers = lines[0].split(';');

            // Clear existing data
            this.clearList();

            // Process each line
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(';');
                if (values.length === headers.length) {
                    const data = {};
                    headers.forEach((header, index) => {
                        data[header.trim()] = values[index].trim();
                    });
                    
                    // Create appropriate object based on tipus
                    let punt;
                    if (data.tipus === 'Museu') {
                        punt = new Museu(
                            data.codi,
                            false,
                            data.pais,
                            data.ciutat,
                            data.nom,
                            data['direcció'],
                            data.tipus,
                            parseFloat(data.latitud),
                            parseFloat(data.longitud),
                            parseFloat(data.puntuacio),
                            data.horaris,
                            parseFloat(data.preu),
                            data.moneda,
                            data.descripcio
                        );
                    } else if (data.tipus === 'Atraccio') {
                        punt = new Atraccio(
                            data.codi,
                            false,
                            data.pais,
                            data.ciutat,
                            data.nom,
                            data['direcció'],
                            data.tipus,
                            parseFloat(data.latitud),
                            parseFloat(data.longitud),
                            parseFloat(data.puntuacio),
                            data.horaris,
                            parseFloat(data.preu),
                            data.moneda
                        );
                    }

                    if (punt) {
                        this.puntsInteres.push(punt);
                        
                        // Add tipus to select if not exists
                        if (!Array.from(this.tipusSelect.options).some(opt => opt.value === data.tipus)) {
                            const option = document.createElement('option');
                            option.value = data.tipus;
                            option.textContent = data.tipus;
                            this.tipusSelect.appendChild(option);
                        }
                    }
                }
            }

            this.updateList();
        } catch (error) {
            console.error('Error processing CSV:', error);
        }
    }

    updateList() {
        // Apply filters
        let filteredPunts = [...this.puntsInteres];

        // Filter by tipus
        const selectedTipus = this.tipusSelect.value;
        if (selectedTipus) {
            filteredPunts = filteredPunts.filter(punt => punt.tipus === selectedTipus);
        }

        // Filter by name
        const searchTerm = this.filtreNomInput.value.toLowerCase();
        if (searchTerm) {
            filteredPunts = filteredPunts.filter(punt => 
                punt.nom.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        const isAscending = this.ordenacioSelect.value === 'asc';
        filteredPunts.sort((a, b) => {
            const comparison = a.nom.localeCompare(b.nom);
            return isAscending ? comparison : -comparison;
        });

        // Update total elements text
        this.totalElements.textContent = `Total elements: ${filteredPunts.length}`;

        // Clear map markers
        this.mapa.borrarPunt();

        // Clear the list before updating
        this.llistaLlocs.innerHTML = '';

        // Ensure points are added to the list and map
        filteredPunts.forEach(punt => {
            const item = document.createElement('div');
            item.className = 'lloc-item';
            item.innerHTML = `
                <h3>${punt.nom}</h3>
                <p>${punt.direccio}, ${punt.ciutat}, ${punt.pais}</p>
                <p>Tipus: ${punt.tipus}</p>
                <p>Preu: ${punt instanceof Atraccio || punt instanceof Museu ? punt.getPreuIva() : 'N/A'}</p>
            `;

            this.llistaLlocs.appendChild(item);

            // Add marker to map
            const marker = this.mapa.mostrarPunt(
                punt.latitud,
                punt.longitud,
                `<strong>${punt.nom}</strong><br>${punt.direccio}`
            );

            // Link list item with marker
            item.addEventListener('click', () => {
                marker.openPopup();
                this.mapa.actualitzarPosInitMapa(punt.latitud, punt.longitud);
            });
        });
    }

    clearList() {
        this.puntsInteres = [];
        this.llistaLlocs.innerHTML = '';
        this.totalElements.textContent = 'No hi ha informació a mostrar';
        this.mapa.borrarPunt();
        this.tipusSelect.innerHTML = '<option value="">Selecciona un tipus</option>';
        this.filtreNomInput.value = '';
        this.ordenacioSelect.value = 'asc';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
