// Percorsi dei file usati dal processo principale. I dati utente stanno nella
// cartella userData dell'app (%APPDATA%\gestioneshow su Windows).
const path = require('path');
const { app } = require('electron');

const cartellaDati = app.getPath('userData');

module.exports = {
    cartellaDati,
    archivio: path.join(cartellaDati, 'shows_data.json'),
    archivioBackup: path.join(cartellaDati, 'shows_data.bak.json'),
    // Copia dell'archivio fatta una sola volta prima della conversione al formato 2.0
    archivioPrima2: path.join(cartellaDati, 'shows_data.prima-2.0.json'),
    // Catalogo dei tag degli show (main/catalogo-tag.js)
    catalogoTag: path.join(cartellaDati, 'tags.json'),
    // Catalogo dei siti di provenienza degli show (main/catalogo-siti.js)
    catalogoSiti: path.join(cartellaDati, 'siti.json'),
    statoFinestra: path.join(cartellaDati, 'window_state.json'),
    // Preferenze di privacy: aspetto neutro, PIN, blocco automatico (main/privacy.js)
    preferenze: path.join(cartellaDati, 'preferenze.json'),
    log: path.join(cartellaDati, 'app.log'),
    logPrecedente: path.join(cartellaDati, 'app.log.1'),
    // Copia dell'ultima pagina transazioni letta da MCG, per analizzarne la struttura
    copiaSincronizzazioneMcg: path.join(cartellaDati, 'mcg_ultima_sincronizzazione.json'),
    changelog: path.join(__dirname, '..', 'changelog.json')
};
