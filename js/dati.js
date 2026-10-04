import { aggiornaInterfaccia } from './archivio.js';
import { logger } from './logger.js';

/* Esportazione, importazione dei backup e cartella dati.
   La lettura dell'archivio e l'aggiornamento delle viste sono in archivio.js. */

/* ==========================================================================
   ESPORTAZIONE E IMPORTAZIONE BACKUP
   ========================================================================== */
export async function esportaDati() {
    try {
        if (window.electronAPI && window.electronAPI.exportData) {
            // Il budget sta in localStorage: va passato perché finisca nel backup
            const impostazioni = { monthly_budget: localStorage.getItem('monthly_budget') || '' };
            const esito = await window.electronAPI.exportData(impostazioni);
            if (esito && esito.success) {
                logger.success("Dati esportati con successo.");
            } else if (esito && !esito.cancelled) {
                logger.error("Esportazione non riuscita", esito.error);
                alert(`❌ Esportazione non riuscita: ${esito.error}`);
            }
        }
    } catch (err) {
        logger.error("Errore durante l'esportazione dei dati", err);
    }
}

export async function importaDati() {
    try {
        if (window.electronAPI && window.electronAPI.importData) {
            // Prima qualsiasi risposta (anche "annullata" o un errore) veniva
            // registrata come importazione riuscita
            const esito = await window.electronAPI.importData();
            if (esito && esito.success) {
                ripristinaImpostazioniBackup(esito.impostazioni);
                logger.success("Dati importati con successo.");
                aggiornaInterfaccia();
            } else if (esito && !esito.cancelled) {
                logger.error("Importazione non riuscita", esito.error);
                alert(`❌ Importazione non riuscita: ${esito.error}`);
            }
        }
    } catch (err) {
        logger.error("Errore durante l'importazione dei dati", err);
    }
}

// I backup vecchi non hanno impostazioni: in quel caso il budget attuale resta invariato
export function ripristinaImpostazioniBackup(impostazioni) {
    if (!impostazioni || impostazioni.monthly_budget === undefined) return;
    localStorage.setItem('monthly_budget', impostazioni.monthly_budget);
    const budgetInput = document.getElementById('monthlyBudgetInput');
    if (budgetInput) budgetInput.value = impostazioni.monthly_budget;
}

export async function apriCartellaDati() {
    try {
        if (window.electronAPI && window.electronAPI.openDataFolder) {
            await window.electronAPI.openDataFolder();
        }
    } catch (err) {
        logger.error("Errore nell'apertura della cartella dati", err);
    }
}
