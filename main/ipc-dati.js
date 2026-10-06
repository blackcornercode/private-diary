// Gestori IPC dell'archivio degli show e dei cataloghi (tag e siti): lettura,
// salvataggio, esportazione e importazione dei backup.
const { app, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const canali = require('./canali');
const percorsi = require('./percorsi');
const { scriviFileAtomico, decodificaTesto } = require('./file');
const { richiedeConversione } = require('./conversione');
const { logToFile } = require('./log');
const { TAG_PREDEFINITI, validaCatalogoTag } = require('./catalogo-tag');
const { SITI_PREDEFINITI, validaCatalogoSiti } = require('./catalogo-siti');

// Impostazioni del renderer (in localStorage) incluse nel backup: solo chiavi note
const IMPOSTAZIONI_IN_BACKUP = ['monthly_budget', 'sito_predefinito'];

function filtraImpostazioni(impostazioni) {
    const pulite = {};
    if (impostazioni && typeof impostazioni === 'object') {
        for (const chiave of IMPOSTAZIONI_IN_BACKUP) {
            if (impostazioni[chiave] !== undefined && impostazioni[chiave] !== null) {
                pulite[chiave] = String(impostazioni[chiave]);
            }
        }
    }
    return pulite;
}

async function salvaDatiShow(data) {
    if (!Array.isArray(data)) {
        throw new Error('Dati non validi: era atteso un array di show.');
    }
    // Copia di sicurezza della versione precedente
    try {
        await fs.copyFile(percorsi.archivio, percorsi.archivioBackup);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
    await scriviFileAtomico(percorsi.archivio, JSON.stringify(data, null, 2));
}

// Cataloghi salvati in file JSON a parte: stessa lettura, validazione e salvataggio
const CATALOGHI = {
    tag: { percorso: () => percorsi.catalogoTag, file: 'tags', descrizione: 'dei tag', valida: validaCatalogoTag, predefinito: TAG_PREDEFINITI },
    siti: { percorso: () => percorsi.catalogoSiti, file: 'siti', descrizione: 'dei siti', valida: validaCatalogoSiti, predefinito: SITI_PREDEFINITI }
};

// Catalogo validato; null se il file non esiste ancora
async function leggiCatalogo({ percorso, file, descrizione, valida }) {
    let contenuto;
    try {
        contenuto = await fs.readFile(percorso(), 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
    try {
        return valida(JSON.parse(contenuto));
    } catch (err) {
        // Come per l'archivio: il file danneggiato non va sovrascritto in silenzio
        const copia = path.join(percorsi.cartellaDati, `${file}.corrotto-${Date.now()}.json`);
        await fs.copyFile(percorso(), copia).catch(() => {});
        await logToFile('ERROR', `Catalogo ${descrizione} illeggibile`, `${err.message} - copia salvata in ${copia}`);
        throw new Error(`Catalogo ${descrizione} illeggibile (${err.message}). Copia salvata in: ${copia}`);
    }
}

async function salvaCatalogo({ percorso, valida }, catalogo) {
    await scriviFileAtomico(percorso(), JSON.stringify(valida(catalogo), null, 2));
}

const leggiCatalogoTag = () => leggiCatalogo(CATALOGHI.tag);
const leggiCatalogoSiti = () => leggiCatalogo(CATALOGHI.siti);

// Lettura per l'interfaccia: al primo avvio scrive e restituisce il catalogo iniziale
async function leggiOCreaCatalogo(catalogo) {
    const salvato = await leggiCatalogo(catalogo);
    if (salvato) return salvato;
    await salvaCatalogo(catalogo, catalogo.predefinito);
    return catalogo.valida(catalogo.predefinito);
}

// Salvataggio dall'interfaccia: { success } invece di un'eccezione
async function salvaCatalogoConEsito(catalogo, nuovo) {
    try {
        await salvaCatalogo(catalogo, nuovo);
        return { success: true };
    } catch (error) {
        await logToFile('ERROR', `Salvataggio del catalogo ${catalogo.descrizione} fallito`, error.message);
        return { success: false, error: error.message };
    }
}

function registra({ finestraPrincipale }) {
    ipcMain.handle(canali.LEGGI_TAG, () => leggiOCreaCatalogo(CATALOGHI.tag));
    ipcMain.handle(canali.SALVA_TAG, (event, nuovo) => salvaCatalogoConEsito(CATALOGHI.tag, nuovo));
    ipcMain.handle(canali.LEGGI_SITI, () => leggiOCreaCatalogo(CATALOGHI.siti));
    ipcMain.handle(canali.SALVA_SITI, (event, nuovo) => salvaCatalogoConEsito(CATALOGHI.siti, nuovo));

    ipcMain.handle(canali.LEGGI_ARCHIVIO, async () => {
        let contenuto;
        try {
            contenuto = await fs.readFile(percorsi.archivio, 'utf-8');
        } catch (err) {
            if (err.code === 'ENOENT') {
                // Primo avvio: nessun archivio, si parte vuoti
                await scriviFileAtomico(percorsi.archivio, JSON.stringify([]));
                return [];
            }
            throw err;
        }

        let dati;
        try {
            dati = JSON.parse(contenuto);
            if (!Array.isArray(dati)) throw new Error('il file non contiene un array');
        } catch (err) {
            // Archivio danneggiato: NON va sovrascritto. Se ne conserva una copia
            // e si segnala l'errore, invece di ripartire silenziosamente da zero.
            const copia = path.join(percorsi.cartellaDati, `shows_data.corrotto-${Date.now()}.json`);
            await fs.copyFile(percorsi.archivio, copia).catch(() => {});
            await logToFile('ERROR', 'Archivio show illeggibile', `${err.message} - copia salvata in ${copia}`);
            throw new Error(`Archivio dati illeggibile (${err.message}). Copia salvata in: ${copia}. Puoi ripristinare da shows_data.bak.json o da un backup.`);
        }
        // Archivio di una versione precedente alla 2.0: l'interfaccia lo convertirà
        // (sito, importatoDa) al primo salvataggio, quindi prima se ne conserva una copia
        if (richiedeConversione(dati)) {
            try {
                await fs.access(percorsi.archivioPrima2);
            } catch {
                await fs.copyFile(percorsi.archivio, percorsi.archivioPrima2);
                await logToFile('INFO', 'Archivio di una versione precedente alla 2.0: copia di sicurezza prima della conversione', percorsi.archivioPrima2);
            }
        }
        return dati;
    });

    ipcMain.handle(canali.SALVA_ARCHIVIO, async (event, data) => {
        try {
            await salvaDatiShow(data);
            return { success: true };
        } catch (error) {
            await logToFile('ERROR', 'Salvataggio dati fallito', error.message);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle(canali.ESPORTA_BACKUP, async (event, impostazioni) => {
        try {
            const { filePath } = await dialog.showSaveDialog(finestraPrincipale(), {
                title: 'Esporta Backup Dati',
                defaultPath: path.join(app.getPath('downloads'), `backup_shows_${Date.now()}.json`),
                filters: [{ name: 'File JSON', extensions: ['json'] }]
            });

            if (filePath) {
                const shows = JSON.parse(await fs.readFile(percorsi.archivio, 'utf-8'));
                const backup = {
                    formato: 'gestioneshow-backup',
                    // Versione 2: show con il campo "sito" e catalogo dei siti
                    versione: 2,
                    versioneApp: app.getVersion(),
                    shows,
                    tag: (await leggiCatalogoTag()) || [],
                    siti: (await leggiCatalogoSiti()) || [],
                    impostazioni: filtraImpostazioni(impostazioni)
                };
                await fs.writeFile(filePath, JSON.stringify(backup, null, 2), 'utf-8');
                return { success: true };
            }
            return { success: false, cancelled: true, error: 'Esportazione annullata' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // CSV dello storico di un sito (importa-csv.js): solo lettura, il testo va all'interfaccia
    ipcMain.handle(canali.APRI_CSV, async () => {
        try {
            const { filePaths } = await dialog.showOpenDialog(finestraPrincipale(), {
                title: 'Importa CSV',
                filters: [{ name: 'File CSV', extensions: ['csv', 'txt'] }],
                properties: ['openFile']
            });
            if (!filePaths?.length) return { success: false, cancelled: true };
            const { size } = await fs.stat(filePaths[0]);
            if (size > 20 * 1024 * 1024) return { success: false, error: 'File troppo grande (oltre 20 MB).' };
            return { success: true, nome: path.basename(filePaths[0]), testo: decodificaTesto(await fs.readFile(filePaths[0])) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Cronologia esportata in CSV (testo già pronto, csv.js)
    ipcMain.handle(canali.SALVA_CSV, async (event, testo) => {
        try {
            if (typeof testo !== 'string') return { success: false, error: 'Contenuto non valido' };
            const oggi = new Date().toISOString().slice(0, 10);
            const { filePath } = await dialog.showSaveDialog(finestraPrincipale(), {
                title: 'Esporta CSV',
                defaultPath: path.join(app.getPath('downloads'), `private-diary-${oggi}.csv`),
                filters: [{ name: 'File CSV', extensions: ['csv'] }]
            });
            if (!filePath) return { success: false, cancelled: true };
            await fs.writeFile(filePath, testo, 'utf-8');
            return { success: true, percorso: filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle(canali.IMPORTA_BACKUP, async () => {
        try {
            const { filePaths } = await dialog.showOpenDialog(finestraPrincipale(), {
                title: 'Importa Backup Dati',
                filters: [{ name: 'File JSON', extensions: ['json'] }],
                properties: ['openFile']
            });

            if (filePaths?.length > 0) {
                const content = await fs.readFile(filePaths[0], 'utf-8');
                const parsedData = JSON.parse(content);
                // Accetta sia il formato attuale { shows, impostazioni } sia i backup
                // precedenti, che contenevano solo l'array degli show
                const shows = Array.isArray(parsedData) ? parsedData : parsedData?.shows;
                if (Array.isArray(shows)) {
                    // salvaDatiShow conserva l'archivio attuale in shows_data.bak.json prima di sostituirlo
                    await salvaDatiShow(shows);
                    // I backup precedenti ai tag non hanno il catalogo: quello attuale resta
                    if (Array.isArray(parsedData?.tag)) await salvaCatalogo(CATALOGHI.tag, parsedData.tag);
                    // I backup precedenti ai siti non hanno il catalogo: quello attuale resta
                    if (Array.isArray(parsedData?.siti)) await salvaCatalogo(CATALOGHI.siti, parsedData.siti);
                    return { success: true, impostazioni: filtraImpostazioni(parsedData?.impostazioni) };
                }
                return { success: false, error: 'Formato del file non valido (atteso un backup di Private Diary / Gestione Show).' };
            }
            return { success: false, cancelled: true, error: 'Importazione annullata' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registra, filtraImpostazioni };
