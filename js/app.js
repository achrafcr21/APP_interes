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
        this.paisInfoDiv = document.getElementById('paisInfo');
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
            console.log('Contenido del CSV:', text);
            
            const linies = this.obtenirLinies(text);
            console.log('Líneas de datos:', linies);
            
            const encapçalaments = this.obtenirEncapçalaments(linies);
            console.log('Encabezados:', encapçalaments);
            
            const liniesDades = this.eliminarEncapçalament(linies);
            
            // Clear existing data
            this.esborrarLlista();
            this.paisInfoDiv.innerHTML = '';

            // Procesar cada línea
            for (const linia of liniesDades) {
                const dades = this.analitzarLinia(linia, encapçalaments);
                console.log('Datos analizados:', dades);
                
                // Obtener información del país solo si no la tenemos ya
                if (!this.paisInfoDiv.innerHTML) {
                    console.log('Código país:', dades.codi);
                    const infoPais = await this.obtenirInfoPais(dades.codi);
                    console.log('Info país:', infoPais);
                    
                    if (infoPais) {
                        // Mostrar información del país en la parte superior
                        this.paisInfoDiv.innerHTML = `
                            <div>País (<img src="${infoPais.bandera}" alt="${dades.pais}" style="width: 20px; vertical-align: middle;">)</div>
                            <div>Barcelona</div>
                        `;
                    }
                }

                const punt = this.crearPunt(dades);
                console.log('Punto creado:', punt);

                if (punt) {
                    this.puntsInteres.push(punt);
                    this.afegirTipusAlSelect(dades.tipus);
                }
            }

            console.log('Total puntos:', this.puntsInteres.length);
            this.actualitzarLlista();
        } catch (error) {
            console.error('Error procesando CSV:', error);
        }
    }

    async obtenirInfoPais(codiPais) {
        if (!codiPais) return null;
        
        try {
            console.log('Obteniendo info para país:', codiPais);
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${codiPais}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const [data] = await response.json();
            console.log('Respuesta API:', data);
            
            // Verificar que tenemos los datos necesarios
            if (!data || !data.flags) {
                console.error('Datos del país incompletos:', data);
                return null;
            }

            return {
                bandera: data.flags.png || data.flags.svg, // Usamos la URL de la imagen de la bandera
                latitud: data.latlng ? data.latlng[0] : null,
                longitud: data.latlng ? data.latlng[1] : null
            };
        } catch (error) {
            console.error('Error obteniendo información del país:', error);
            return null;
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
            const paisInfo = punt.banderaPais ? `${punt.pais} ${punt.banderaPais}` : punt.pais;
            
            if (punt.tipus === 'Espai') {
                contingut = `${punt.nom} | ${punt.ciutat}<br>${paisInfo} | Tipus: ${punt.tipus}`;
            } else {
                contingut = `${punt.nom} | ${punt.ciutat}<br>${paisInfo} | Tipus: ${punt.tipus} | Horaris: ${punt.horaris} | Preu: ${punt.preu}€`;
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
                `<strong>${punt.nom}</strong><br>${punt.direccio}<br>Puntuació: ${punt.puntuacio}`
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
