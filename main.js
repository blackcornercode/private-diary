// Processo principale: ciclo di vita dell'app, finestre e menu.
// I gestori IPC stanno in main/, divisi per area:
//   main/ipc-dati.js     archivio degli show, esportazione e importazione backup
//   main/ipc-sistema.js  versione, log, link esterni, changelog
//   main/ipc-mcg.js      Mondo Cam Girls (transazioni, modelle online, foto, ping)
const { app, BrowserWindow, dialog, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const canali = require('./main/canali');
const percorsi = require('./main/percorsi');
const { logToFile, convertiLogVecchioFormato } = require('./main/log');
const ipcDati = require('./main/ipc-dati');
const ipcSistema = require('./main/ipc-sistema');
const ipcMcg = require('./main/ipc-mcg');

let mainWindow = null;
let splashWindow = null;
let saveStateTimeout = null;

/* ==========================================================================
   STATO DELLA FINESTRA (dimensione e posizione)
   ========================================================================== */

function boundsVisibiliSuSchermo(bounds) {
    if (bounds.x === undefined || bounds.y === undefined) return true;
    return screen.getAllDisplays().some(({ workArea: a }) =>
        bounds.x < a.x + a.width && bounds.x + bounds.width > a.x &&
        bounds.y < a.y + a.height && bounds.y + bounds.height > a.y
    );
}

async function loadWindowState() {
    const predefinito = { width: 1350, height: 850, x: undefined, y: undefined };
    try {
        const data = await fs.readFile(percorsi.statoFinestra, 'utf-8');
        const stato = { ...predefinito, ...JSON.parse(data) };
        // Se il monitor su cui era la finestra non c'è più, la si ricentra
        return boundsVisibiliSuSchermo(stato) ? stato : { ...stato, x: undefined, y: undefined };
    } catch {
        return predefinito;
    }
}

async function saveWindowState() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    try {
        if (!mainWindow.isMaximized() && !mainWindow.isMinimized()) {
            await fs.writeFile(percorsi.statoFinestra, JSON.stringify(mainWindow.getBounds(), null, 2));
        }
    } catch (error) {
        console.error("Errore salvataggio stato finestra:", error);
    }
}

function debouncedSaveWindowState() {
    clearTimeout(saveStateTimeout);
    saveStateTimeout = setTimeout(saveWindowState, 500);
}

/* ==========================================================================
   INIZIALIZZAZIONE FINESTRE
   ========================================================================== */

function creaMenu() {
    const menuTemplate = [
        { label: 'File', submenu: [{ role: 'quit', label: 'Esci' }] },
        {
            label: 'Finestra',
            submenu: [
                { role: 'minimize', label: 'Riduci a icona' },
                { role: 'zoom', label: 'Ingrandisci' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Schermo intero' }
            ]
        },
        {
            label: '?',
            submenu: [
                {
                    label: '📋 Novità e Changelog',
                    click: () => {
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send(canali.EVENTO_APRI_CHANGELOG);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Informazioni',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Informazioni',
                            message: `Gestione Show v${app.getVersion()}`,
                            detail: 'Applicazione di gestione performance e classifica.'
                        });
                    }
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

async function createWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 250,
        frame: false,
        alwaysOnTop: true,
        transparent: false,
        center: true,
        resizable: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
    });
    splashWindow.loadFile('splash.html');

    const savedState = await loadWindowState();

    mainWindow = new BrowserWindow({
        width: savedState.width,
        height: savedState.height,
        x: savedState.x,
        y: savedState.y,
        minWidth: 1100,
        minHeight: 650,
        title: "Gestione Show MCG",
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            zoomFactor: 1.0,
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    mainWindow.loadFile('index.html');

    // La finestra principale non deve mai navigare via da index.html né aprire
    // nuove finestre: eventuali link vengono passati al browser di sistema
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        ipcSistema.apriUrlEsternoSicuro(url);
        return { action: 'deny' };
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
            ipcSistema.apriUrlEsternoSicuro(url);
        }
    });

    creaMenu();

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        mainWindow.show();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        logToFile('INFO', `Applicazione avviata (v${app.getVersion()})`);
    });

    mainWindow.on('resize', debouncedSaveWindowState);
    mainWindow.on('move', debouncedSaveWindowState);
}

/* ==========================================================================
   AVVIO
   ========================================================================== */

// I gestori IPC vanno registrati una sola volta, prima di aprire le finestre
const finestraPrincipale = () => mainWindow;
ipcDati.registra({ finestraPrincipale });
ipcSistema.registra();
ipcMcg.registra();

app.whenReady().then(async () => {
    await convertiLogVecchioFormato();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
