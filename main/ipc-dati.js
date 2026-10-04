// Gestori IPC dell'archivio degli show e del catalogo dei tag: lettura,
// salvataggio, esportazione e importazione dei backup.
const { app, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const canali = require('./canali');
const percorsi = require('./percorsi');
const { scriviFileAtomico } = require('./file');
const { logToFile } = require('./log');
const { TAG_PREDEFINITI, validaCatalogoTag } = require('./catalogo-tag');

// Impostazioni del renderer (in localStorage) incluse nel backup: solo chiavi note
const IMPOSTAZIONI_IN_BACKUP = ['monthly_budget'];

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

// Catalogo dei tag; null se il file non esiste ancora
async function leggiCatalogoTag() {
    let contenuto;
    try {
        contenuto = await fs.readFile(percorsi.catalogoTag, 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
    try {
        return validaCatalogoTag(JSON.parse(contenuto));
    } catch (err) {
        // Come per l'archivio: il file danneggiato non va sovrascritto in silenzio
        const copia = path.join(percorsi.cartellaDati, `tags.corrotto-${Date.now()}.json`);
        await fs.copyFile(percorsi.catalogoTag, copia).catch(() => {});
        await logToFile('ERROR', 'Catalogo tag illeggibile', `${err.message} - copia salvata in ${copia}`);
        throw new Error(`Catalogo dei tag illeggibile (${err.message}). Copia salvata in: ${copia}`);
    }
}

async function salvaCatalogoTag(catalogo) {
    await scriviFileAtomico(percorsi.catalogoTag, JSON.stringify(validaCatalogoTag(catalogo), null, 2));
}

function registra({ finestraPrincipale }) {
    ipcMain.handle(canali.LEGGI_TAG, async () => {
        const catalogo = await leggiCatalogoTag();
        if (catalogo) return catalogo;
        // Primo avvio: catalogo iniziale con alcuni tag di esempio
        await salvaCatalogoTag(TAG_PREDEFINITI);
        return TAG_PREDEFINITI;
    });

    ipcMain.handle(canali.SALVA_TAG, async (event, catalogo) => {
        try {
            await salvaCatalogoTag(catalogo);
            return { success: true };
        } catch (error) {
            await logToFile('ERROR', 'Salvataggio tag fallito', error.message);
            return { success: false, error: error.message };
        }
    });

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

        try {
            const dati = JSON.parse(contenuto);
            if (!Array.isArray(dati)) throw new Error('il file non contiene un array');
            return dati;
        } catch (err) {
            // Archivio danneggiato: NON va sovrascritto. Se ne conserva una copia
            // e si segnala l'errore, invece di ripartire silenziosamente da zero.
            const copia = path.join(percorsi.cartellaDati, `shows_data.corrotto-${Date.now()}.json`);
            await fs.copyFile(percorsi.archivio, copia).catch(() => {});
            await logToFile('ERROR', 'Archivio show illeggibile', `${err.message} - copia salvata in ${copia}`);
            throw new Error(`Archivio dati illeggibile (${err.message}). Copia salvata in: ${copia}. Puoi ripristinare da shows_data.bak.json o da un backup.`);
        }
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
                    versione: 1,
                    versioneApp: app.getVersion(),
                    shows,
                    tag: (await leggiCatalogoTag()) || [],
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
                    if (Array.isArray(parsedData?.tag)) await salvaCatalogoTag(parsedData.tag);
                    return { success: true, impostazioni: filtraImpostazioni(parsedData?.impostazioni) };
                }
                return { success: false, error: 'Formato del file non valido (atteso un backup di Gestione Show).' };
            }
            return { success: false, cancelled: true, error: 'Importazione annullata' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registra, filtraImpostazioni };
