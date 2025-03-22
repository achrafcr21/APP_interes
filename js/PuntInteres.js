// Aquesta es la clase base que fem servir per tots els punts d'interes
// Es com el pare de totes les altres clases que farem despres

class PuntInteres {
    #id;  // aixo es privat, nomes ho podem fer servir aqui dins
    #esManual;  // tambe es privat

    static totalTasques = 0;  // contador de quants punts tenim

    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio) {
        // Guardem tota la info del punt
        this.#id = id;
        this.#esManual = esManual;
        this.pais = pais;
        this.ciutat = ciutat;
        this.nom = nom;
        this.direccio = direccio;
        this.tipus = tipus;
        this.latitud = latitud;  // on esta el punt al mapa
        this.longitud = longitud;
        this.puntuacio = puntuacio;  // quant mola aquest lloc
        PuntInteres.totalTasques++;  // sumem 1 al contador
    }

    // Per poder llegir el id desde fora
    get id() {
        return this.#id;
    }

    // Per poder canviar el id desde fora
    set id(newId) {
        this.#id = newId;
    }

    // Per saber si el punt es manual o no
    get esManual() {
        return this.#esManual;
    }

    // Per canviar si el punt es manual o no
    set esManual(value) {
        this.#esManual = value;
    }

    // Per saber quants punts tenim en total
    static obtenirTotalElements() {
        return PuntInteres.totalTasques;
    }
}

// Per poder fer servir aquesta clase en altres arxius
export default PuntInteres;
