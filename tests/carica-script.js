// Carica gli script classici dell'interfaccia (js/*.js) in un contesto isolato,
// come fa il browser: condividono lo stesso scope globale, quindi le funzioni
// definite in un file sono visibili negli altri. Restituisce il contesto e una
// funzione per eseguire espressioni al suo interno (necessaria per leggere o
// impostare le variabili dichiarate con let/const, che non sono proprietà del contesto).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CARTELLA_JS = path.join(__dirname, '..', 'js');

function caricaScript(nomiFile, { traduzioni = {} } = {}) {
    const contesto = vm.createContext({
        console,
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        window: {},
        document: { getElementById: () => null, querySelectorAll: () => [] }
    });
    for (const nome of nomiFile) {
        const sorgente = fs.readFileSync(path.join(CARTELLA_JS, nome), 'utf8');
        vm.runInContext(sorgente, contesto, { filename: nome });
    }
    const esegui = (codice) => vm.runInContext(codice, contesto);
    // Le traduzioni vengono da locales/*.json nell'app: nei test si impostano a mano
    esegui(`traduzioniCorrenti = ${JSON.stringify(traduzioni)}`);
    return { contesto, esegui };
}

module.exports = { caricaScript };
