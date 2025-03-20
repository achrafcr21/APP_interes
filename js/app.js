import PuntInteres from './PuntInteres.js';
import Atraccio from './Atraccio.js';
import Museu from './Museu.js';
import Mapa from './Mapa.js';

class App {
    constructor() {
        this.puntsInteres = [];
        this.mapa = new Mapa('map');
        this.inicialitzarElements();
        this.configurarEscoltadors();
    }

    inicialitzarElements() {
        this.tipusSelect = document.getElementById('tipus');
        this.ordenacioSelect = document.getElementById('ordenacio');
        this.filtreNomInput = document.getElementById('filtreNom');
        this.llistaLlocs = document.getElementById('llistaLlocs');
        this.totalElements = document.getElementById('totalElements');
        this.netejarButton = document.getElementById('netejarLlista');
        this.dropZone = document.getElementById('dropZone');
    }

    configurarEscoltadors() {
        // Filter event listeners
        this.tipusSelect.addEventListener('change', () => this.actualitzarLlista());
        this.ordenacioSelect.addEventListener('change', () => this.actualitzarLlista());
        this.filtreNomInput.addEventListener('input', () => this.actualitzarLlista());
        
        // Clear list button
        this.netejarButton.addEventListener('click', () => this.esborrarLlista());

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
                this.processarFitxerCSV(file);
            }
        });
    }

    async processarFitxerCSV(file) {
        try {
            const text = await file.text();
            const linies = this.obtenirLinies(text);
            const encapçalaments = this.obtenirEncapçalaments(linies);
            const liniesDades = this.eliminarEncapçalament(linies);
            
            // Clear existing data
            this.esborrarLlista();

            liniesDades.forEach(linia => {
                const dades = this.analitzarLinia(linia, encapçalaments);
                const punt = this.crearPunt(dades);

                if (punt) {
                    this.puntsInteres.push(punt);
                    this.afegirTipusAlSelect(dades.tipus);
                }
            });

            this.actualitzarLlista();
        } catch (error) {
            console.error('Error processing CSV:', error);
        }
    }

    obtenirLinies(text) {
        return text.split('\n').map(linia => linia.trim()).filter(linia => linia);
    }

    obtenirEncapçalaments(linies) {
        return linies[0].split(';');
    }

    eliminarEncapçalament(linies) {
        return linies.slice(1);
    }

    analitzarLinia(linia, encapçalaments) {
        const valors = linia.split(';');
        const dades = {};
        encapçalaments.forEach((encapçalament, index) => {
            dades[encapçalament.trim()] = valors[index].trim();
        });
        return dades;
    }

    crearPunt(dades) {
        let punt;
        const tipus = dades.tipus.toLowerCase();
        
        switch(tipus) {
            case 'museu':
                punt = new Museu(
                    dades.codi,
                    false,
                    dades.pais,
                    dades.ciutat,
                    dades.nom,
                    dades['direcció'],
                    dades.tipus,
                    parseFloat(dades.latitud),
                    parseFloat(dades.longitud),
                    parseFloat(dades.puntuacio),
                    dades.horaris,
                    parseFloat(dades.preu),
                    dades.moneda,
                    dades.descripcio
                );
                break;
            case 'atraccio':
                punt = new Atraccio(
                    dades.codi,
                    false,
                    dades.pais,
                    dades.ciutat,
                    dades.nom,
                    dades['direcció'],
                    dades.tipus,
                    parseFloat(dades.latitud),
                    parseFloat(dades.longitud),
                    parseFloat(dades.puntuacio),
                    dades.horaris,
                    parseFloat(dades.preu),
                    dades.moneda
                );
                break;
            case 'espai':
                punt = new PuntInteres(
                    dades.codi,
                    false,
                    dades.pais,
                    dades.ciutat,
                    dades.nom,
                    dades['direcció'],
                    dades.tipus,
                    parseFloat(dades.latitud),
                    parseFloat(dades.longitud),
                    parseFloat(dades.puntuacio)
                );
                break;
        }
        return punt;
    }

    afegirTipusAlSelect(tipus) {
        if (!Array.from(this.tipusSelect.options).some(opt => opt.value === tipus)) {
            const option = document.createElement('option');
            option.value = tipus;
            option.textContent = tipus;
            this.tipusSelect.appendChild(option);
        }
    }

    actualitzarLlista() {
        // Apply filters
        let puntsFiltrats = [...this.puntsInteres];

        // Filter by tipus
        const tipusSeleccionat = this.tipusSelect.value;
        if (tipusSeleccionat) {
            puntsFiltrats = puntsFiltrats.filter(punt => punt.tipus === tipusSeleccionat);
        }

        // Filter by name
        const termeDeCerca = this.filtreNomInput.value.toLowerCase();
        if (termeDeCerca) {
            puntsFiltrats = puntsFiltrats.filter(punt => 
                punt.nom.toLowerCase().includes(termeDeCerca)
            );
        }

        // Sort
        const asc = this.ordenacioSelect.value === 'asc';
        puntsFiltrats.sort((a, b) => {
            const comparacio = a.nom.localeCompare(b.nom);
            return asc ? comparacio : -comparacio;
        });

        // Update total elements text
        this.totalElements.textContent = `Total elements: ${puntsFiltrats.length}`;

        // Clear map markers
        this.mapa.borrarPunt();

        // Clear the list before updating
        this.llistaLlocs.innerHTML = '';

        // Ensure points are added to the list and map
        puntsFiltrats.forEach(punt => {
            const item = document.createElement('div');
            item.className = `lloc-item tipus-${punt.tipus.toLowerCase()}`;

            // Crear el botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'delete';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = () => {
                const index = this.puntsInteres.indexOf(punt);
                if (index > -1) {
                    this.puntsInteres.splice(index, 1);
                    this.actualitzarLlista();
                }
            };

            // Crear el contenido según el tipo
            let contingut = '';
            if (punt.tipus === 'Espai') {
                contingut = `${punt.nom} | ${punt.ciutat} | Tipus: ${punt.tipus}`;
            } else {
                contingut = `${punt.nom} | ${punt.ciutat} | Tipus: ${punt.tipus} | Horaris: ${punt.horaris} | Preu: ${punt.preu}€`;
                if (punt.tipus === 'Museu' && punt.descripcio) {
                    contingut += `<br>Descripció: ${punt.descripcio}`;
                }
            }

            item.innerHTML = contingut;
            item.appendChild(deleteButton);
            this.llistaLlocs.appendChild(item);

            // Add marker to map
            const marker = this.mapa.mostrarPunt(
                punt.latitud,
                punt.longitud,
                `<strong>${punt.nom}</strong><br>${punt.direccio}`
            );

            // Link list item with marker
            item.addEventListener('click', (e) => {
                // Solo abrir el popup si no se hizo clic en el botón de eliminar
                if (!e.target.classList.contains('delete-button')) {
                    marker.openPopup();
                    this.mapa.actualitzarPosInitMapa(punt.latitud, punt.longitud);
                }
            });
        });
    }

    esborrarLlista() {
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
