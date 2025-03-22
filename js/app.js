// Aixo es el arxiu mes important! Aqui es on passa tota la magia xd
import PuntInteres from './PuntInteres.js';
import Atraccio from './Atraccio.js';
import Museu from './Museu.js';
import Mapa from './Mapa.js';

class App {
    constructor() {
        // Aqui inicialitzem tot lo important per que funcioni la app
        this.puntsInteres = [];  // array buit per guardar els punts
        this.mapa = new Mapa('map');  // el mapa on veurem els punts
        this.inicialitzarElements();
        this.configurarEscoltadors();
    }

    inicialitzarElements() {
        // Agafem tots els elements que necesitem del HTML
        this.tipusSelect = document.getElementById('tipus');  // per filtrar per tipus
        this.ordenacioSelect = document.getElementById('ordenacio');  // per ordenar la llista
        this.filtreNomInput = document.getElementById('filtreNom');  // per buscar per nom
        this.llistaLlocs = document.getElementById('llistaLlocs');  // on es veuen els llocs
        this.totalElements = document.getElementById('totalElements');  // contador de elements
        this.dropZone = document.getElementById('dropZone');  // zona per arrosegar el fitxer
        this.netejarButton = document.getElementById('netejarLlista');  // boto per borrar tot
        this.paisInfoDiv = document.getElementById('paisInfo');  // info del pais
    }

    configurarEscoltadors() {
        // Aqui configurem que passa quan fem clic als botons i tal
        this.tipusSelect.addEventListener('change', () => this.actualitzarLlista());
        this.ordenacioSelect.addEventListener('change', () => this.actualitzarLlista());
        this.filtreNomInput.addEventListener('input', () => this.actualitzarLlista());
        
        // Per borrar la llista
        this.netejarButton.addEventListener('click', () => this.esborrarLlista());

        // Aixo es per quan arroseguem el fitxer CSV
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
            // Primer llegim el fitxer
            const text = await file.text();
            console.log('Contenido del CSV:', text);
            
            // Separem les linies del fitxer
            const linies = this.obtenirLinies(text);
            console.log('Linies:', linies);
            
            const encapçalaments = this.obtenirEncapçalaments(linies);
            console.log('Titols:', encapçalaments);
            
            const liniesDades = this.eliminarEncapçalament(linies);
            
            // Netejem tot abans de començar
            this.esborrarLlista();
            this.paisInfoDiv.innerHTML = '';

            // Ara procesem cada linia del fitxer
            for (const linia of liniesDades) {
                const dades = this.analitzarLinia(linia, encapçalaments);
                console.log('Dades:', dades);
                
                // Mirem si tenim info del pais
                if (!this.paisInfoDiv.innerHTML) {
                    console.log('Codi pais:', dades.codi);
                    const infoPais = await this.obtenirInfoPais(dades.codi);
                    console.log('Info pais:', infoPais);
                    
                    if (infoPais) {
                        // Posem la bandera i el nom del pais
                        this.paisInfoDiv.innerHTML = `
                            <div>País (<img src="${infoPais.bandera}" alt="${dades.pais}" style="width: 20px; vertical-align: middle;">)</div>
                            <div>Barcelona</div>
                        `;
                    }
                }

                const punt = this.crearPunt(dades);
                console.log('Punt nou:', punt);

                if (punt) {
                    this.puntsInteres.push(punt);
                    this.afegirTipusAlSelect(dades.tipus);
                }
            }

            console.log('Total punts:', this.puntsInteres.length);
            this.actualitzarLlista();
        } catch (error) {
            console.error('Error al processar el CSV:', error);
        }
    }

    async obtenirInfoPais(codiPais) {
        if (!codiPais) return null;
        
        try {
            // Fem una crida a la API de paisos
            console.log('Buscant info del pais:', codiPais);
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${codiPais}`);
            if (!response.ok) {
                throw new Error(`Error de la API! status: ${response.status}`);
            }
            const [data] = await response.json();
            console.log('Resposta de la API:', data);
            
            // Mirem si tenim tota la info que necesitem
            if (!data || !data.flags) {
                console.error('Falten dades del pais:', data);
                return null;
            }

            return {
                bandera: data.flags.png || data.flags.svg,  // URL de la bandera
                latitud: data.latlng ? data.latlng[0] : null,
                longitud: data.latlng ? data.latlng[1] : null
            };
        } catch (error) {
            console.error('Error al buscar info del pais:', error);
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
