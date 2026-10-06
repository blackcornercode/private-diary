import { t } from './i18n.js';
import { logger } from './logger.js';
import { stato } from './stato.js';
import { SITO_MCG } from './siti.js';
import { funzioneDisponibile, FUNZIONI } from './connettori.js';

/* ==========================================================================
   INDICATORE STATO MONDO CAM GIRLS
   ========================================================================== */
// Ultimo esito: 'checking' | 'online' | 'offline' | 'error'
export let statoMCG = { stato: 'checking', motivo: '' };
export let pingMCGInCorso = false;

export function aggiornaTestoStatoMCG() {
    const dot = document.getElementById('mcgStatusDot');
    const text = document.getElementById('mcgStatusText');
    const container = document.getElementById('mcgStatusContainer');
    if (!dot || !text) return;

    const colori = { checking: 'yellow', online: 'green', offline: 'red', error: 'red' };
    const chiavi = { checking: 'controls.mcg_checking', online: 'controls.mcg_online', offline: 'controls.mcg_offline', error: 'controls.mcg_error' };

    dot.className = `status-dot ${colori[statoMCG.stato]}`;
    text.textContent = t(chiavi[statoMCG.stato]);

    if (container) {
        container.title = statoMCG.stato === 'online'
            ? t('controls.mcg_tip_online')
            : t('controls.mcg_tip_offline').replace('{motivo}', statoMCG.motivo || '-');
    }
}

export async function verificaStatoMCG() {
    // Mondo Cam Girls non in uso: l'indicatore è nascosto e il sito non viene contattato
    if (!funzioneDisponibile(SITO_MCG, FUNZIONI.PING)) return;
    // Evita ping sovrapposti (clic ripetuti o timer mentre una verifica è in corso)
    if (pingMCGInCorso) return;
    pingMCGInCorso = true;

    statoMCG = { stato: 'checking', motivo: '' };
    aggiornaTestoStatoMCG();

    try {
        if (typeof window.electronAPI?.pingSito !== 'function') {
            statoMCG = { stato: 'error', motivo: 'API non disponibile' };
            return;
        }
        const risposta = await window.electronAPI.pingSito(SITO_MCG);
        statoMCG = (risposta && risposta.online)
            ? { stato: 'online', motivo: '' }
            : { stato: 'offline', motivo: String(risposta?.status || risposta?.error || '?') };
    } catch (err) {
        logger.error("Errore durante la verifica dello stato MCG", err);
        statoMCG = { stato: 'error', motivo: err.message };
    } finally {
        pingMCGInCorso = false;
        aggiornaTestoStatoMCG();
    }
}
