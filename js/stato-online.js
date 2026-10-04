import { t } from './i18n.js';
import { logger } from './logger.js';
import { stato } from './stato.js';
import { escapeHtml } from './utils.js';

/* ==========================================================================
   MODELLE ONLINE SU MONDO CAM GIRLS
   ==========================================================================
   L'elenco delle modelle online arriva dal processo principale (get-modelle-online)
   come insieme di sottodomini dei profili (https://<slug>.mondocamgirls.com).
   Una modella risulta online se il sottodominio del suo profilo è nell'elenco. */
export const INTERVALLO_ONLINE_MS = 3 * 60 * 1000;

export let slugModelleOnline = null;      // Set dei profili online; null = stato non ancora noto
export let oraAggiornamentoOnline = null; // Date dell'ultimo aggiornamento riuscito

// Sottodominio del profilo MCG ("https://anna.mondocamgirls.com/it" -> "anna")
export function slugProfiloMcg(url) {
    const m = /^https?:\/\/([a-z0-9_-]+)\.mondocamgirls\.com/i.exec(String(url || ''));
    return m && m[1].toLowerCase() !== 'www' ? m[1].toLowerCase() : null;
}

// true/false se lo stato è noto, null se non verificabile (stato non ancora letto
// o modella senza indirizzo del profilo MCG)
export function eModellaOnline(nome) {
    if (!slugModelleOnline) return null;
    const slug = slugProfiloMcg(stato.mappaUrlModelle[String(nome || '').trim().toLowerCase()]);
    return slug ? slugModelleOnline.has(slug) : null;
}

// Badge "Online" da mettere accanto al nome; stringa vuota se non è online
export function badgeOnline(nome) {
    if (eModellaOnline(nome) !== true) return '';
    const ora = oraAggiornamentoOnline ? oraAggiornamentoOnline.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
    const titolo = t('online.tooltip').replace('{ora}', ora);
    return ` <span class="badge-online" title="${escapeHtml(titolo)}">${escapeHtml(t('online.badge'))}</span>`;
}

export async function aggiornaStatoOnline() {
    if (!window.electronAPI || !window.electronAPI.getModelleOnline) return;
    try {
        const esito = await window.electronAPI.getModelleOnline();
        if (!esito || !esito.success) {
            logger.warn('Stato online delle modelle non disponibile', esito && esito.error);
            return;
        }
        slugModelleOnline = new Set(esito.slug);
        oraAggiornamentoOnline = new Date(esito.aggiornato);
        // Classifica e scheda modella si aggiornano ascoltando questo evento (app.js)
        document.dispatchEvent(new CustomEvent('modelle-online-aggiornate'));
    } catch (err) {
        logger.warn('Errore nel controllo delle modelle online', err.message);
    }
}

export function inizializzaStatoOnline() {
    aggiornaStatoOnline();
    setInterval(aggiornaStatoOnline, INTERVALLO_ONLINE_MS);
}
