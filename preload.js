const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Operazioni Dati & File System
    readData: () => ipcRenderer.invoke('read-data'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    openDataFolder: () => ipcRenderer.invoke('open-data-folder'),
    exportData: (impostazioni) => ipcRenderer.invoke('export-data', impostazioni),
    importData: () => ipcRenderer.invoke('import-data'),
    readTags: () => ipcRenderer.invoke('read-tags'),
    saveTags: (catalogo) => ipcRenderer.invoke('save-tags', catalogo),

    // Logging & Utility di Sistema
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    appendLog: (logData) => ipcRenderer.invoke('append-log', logData),

    // Gestione Changelog & Aggiornamenti
    getChangelog: () => ipcRenderer.invoke('get-changelog'),
    checkForUpdateChangelog: () => ipcRenderer.invoke('check-for-update-changelog'),

    // Web Scraping & Status Online
    fetchTransazioniHtml: (opzioni) => ipcRenderer.invoke('fetch-transazioni-html', opzioni),
    salvaDumpMcg: (dump) => ipcRenderer.invoke('salva-dump-mcg', dump),
    getModelleOnline: () => ipcRenderer.invoke('get-modelle-online'),
    fetchModellaFoto: (urlProfilo) => ipcRenderer.invoke('fetch-modella-foto', urlProfilo),
    getProfiloSospeso: (urlProfilo) => ipcRenderer.invoke('get-profilo-sospeso', urlProfilo),

    // Apertura Link Esterni
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Evento dal Menù di Sistema
    onOpenChangelog: (callback) => {
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on('open-changelog-trigger', subscription);

        return () => {
            ipcRenderer.removeListener('open-changelog-trigger', subscription);
        };
    },

    // Stato raggiungibilità Mondo Cam Girls
    pingMCG: () => ipcRenderer.invoke('ping-mcg')
});