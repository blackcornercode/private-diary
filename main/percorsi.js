// Percorsi dei file usati dal processo principale. I dati utente stanno nella
// cartella userData dell'app (%APPDATA%\gestioneshow su Windows).
const path = require('path');
const { app } = require('electron');

const cartellaDati = app.getPath('userData');

module.exports = {
    cartellaDati,
    archivio: path.join(cartellaDati, 'shows_data.json'),
    archivioBackup: path.join(cartellaDati, 'shows_data.bak.json'),
    statoFinestra: path.join(cartellaDati, 'window_state.json'),
    log: path.join(cartellaDati, 'app.log'),
    logPrecedente: path.join(cartellaDati, 'app.log.1'),
    // Copia dell'ultima pagina transazioni letta da MCG, per analizzarne la struttura
    copiaSincronizzazioneMcg: path.join(cartellaDati, 'mcg_ultima_sincronizzazione.json'),
    changelog: path.join(__dirname, '..', 'changelog.json')
};
