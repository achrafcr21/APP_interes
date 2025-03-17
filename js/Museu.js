import PuntInteres from './PuntInteres.js';

const IVA_PER_PAIS = {
    'España': 0.21,
    'Francia': 0.20,
    'Italia': 0.22,
    'Alemania': 0.19,
    'Portugal': 0.23
};

class Museu extends PuntInteres {
    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda, descripcio) {
        super(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
        this.horaris = horaris;
        this.preu = preu;
        this.moneda = moneda;
        this.descripcio = descripcio;
    }

    getPreuIva() {
        if (this.preu === 0) {
            return "Entrada gratuïta";
        }

        const iva = IVA_PER_PAIS[this.pais];
        if (iva) {
            const preuAmbIva = this.preu * (1 + iva);
            return `${preuAmbIva.toFixed(2)}${this.moneda} (IVA)`;
        } else {
            return `${this.preu.toFixed(2)}${this.moneda} (no IVA)`;
        }
    }
}

export default Museu;
