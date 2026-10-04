// Importa i moduli ES dell'interfaccia (js/*.js) in Node per i test.
// Alcuni moduli usano document, window o localStorage al caricamento o quando
// vengono chiamati: qui ne vengono creati sostituti minimi. Restituisce un
// unico oggetto con tutti i nomi esportati dai moduli richiesti.
const path = require('path');
const { pathToFileURL } = require('url');

const CARTELLA_JS = path.join(__dirname, '..', 'js');

function preparaAmbiente() {
    globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    globalThis.window ??= {};
    globalThis.alert ??= () => {};
    globalThis.document ??= {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        dispatchEvent: () => {}
    };
}

async function caricaModuli(nomiFile) {
    preparaAmbiente();
    const moduli = [];
    for (const nome of nomiFile) {
        moduli.push(await import(pathToFileURL(path.join(CARTELLA_JS, nome)).href));
    }
    return Object.assign({}, ...moduli);
}

module.exports = { caricaModuli };
