class PuntInteres {
    #id;
    #esManual;
    static totalTasques = 0;

    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio) {
        this.#id = id;
        this.#esManual = esManual;
        this.pais = pais;
        this.ciutat = ciutat;
        this.nom = nom;
        this.direccio = direccio;
        this.tipus = tipus;
        this.latitud = latitud;
        this.longitud = longitud;
        this.puntuacio = puntuacio;
        PuntInteres.totalTasques++;
    }

    // Getters y setters para id
    get id() {
        return this.#id;
    }

    set id(newId) {
        this.#id = newId;
    }

    // Getters y setters para esManual
    get esManual() {
        return this.#esManual;
    }

    set esManual(value) {
        this.#esManual = value;
    }

    // Método estático
    static obtenirTotalElements() {
        return PuntInteres.totalTasques;
    }
}

export default PuntInteres;
