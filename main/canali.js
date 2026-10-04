// Nomi dei canali IPC tra interfaccia e processo principale. preload.js gira in
// sandbox e non può importare questo file: la corrispondenza tra i canali usati
// in preload.js e quelli registrati qui è verificata da tests/canali-ipc.test.js.
module.exports = Object.freeze({
    // Dati e backup (ipc-dati.js)
    LEGGI_ARCHIVIO: 'read-data',
    SALVA_ARCHIVIO: 'save-data',
    ESPORTA_BACKUP: 'export-data',
    IMPORTA_BACKUP: 'import-data',

    // Sistema, log e changelog (ipc-sistema.js)
    VERSIONE_APP: 'get-app-version',
    SCRIVI_LOG: 'append-log',
    APRI_CARTELLA_DATI: 'open-data-folder',
    APRI_LINK_ESTERNO: 'open-external',
    CHANGELOG: 'get-changelog',
    NOVITA_DA_MOSTRARE: 'check-for-update-changelog',

    // Mondo Cam Girls (ipc-mcg.js)
    LEGGI_TRANSAZIONI_MCG: 'fetch-transazioni-html',
    SALVA_COPIA_SINCRONIZZAZIONE: 'salva-dump-mcg',
    MODELLE_ONLINE: 'get-modelle-online',
    FOTO_MODELLA: 'fetch-modella-foto',
    PING_MCG: 'ping-mcg',

    // Evento dal menu dell'applicazione verso l'interfaccia (main.js)
    EVENTO_APRI_CHANGELOG: 'open-changelog-trigger'
});
