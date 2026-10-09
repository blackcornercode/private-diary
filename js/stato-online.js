import { t, localeCorrente } from './i18n.js';
import { logger } from './logger.js';
import { stato } from './stato.js';
import { escapeHtml } from './utils.js';
import { SITO_MCG } from './siti.js';
import { funzioneDisponibile, urlProfiloSulSito, FUNZIONI } from './connettori.js';
import { slugProfiloMcg } from './connettore-mcg.js';

/* ==========================================================================
   MODELLE ONLINE SU MONDO CAM GIRLS
   ==========================================================================
   L'elenco delle modelle online arriva dal connettore MCG (funzione "online")
   come insieme di sottodomini dei profili (https://<slug>.mondocamgirls.com).
   Una modella risulta online se il sottodominio del suo profilo è nell'elenco. */
export const INTERVALLO_ONLINE_MS = 3 * 60 * 1000;

export let slugModelleOnline = null;      // Set dei profili online; null = stato non ancora noto
export let oraAggiornamentoOnline = null; // Date dell'ultimo aggiornamento riuscito

// true/false se lo stato è noto, null se non verificabile (stato non ancora letto
// o modella senza indirizzo del profilo MCG)
export function eModellaOnline(nome) {
    if (!slugModelleOnline) return null;
    const slug = slugProfiloMcg(urlProfiloSulSito(nome, SITO_MCG));
    return slug ? slugModelleOnline.has(slug) : null;
}

// Badge "Online" da mettere accanto al nome; stringa vuota se non è online
export function badgeOnline(nome) {
    if (eModellaOnline(nome) !== true) return '';
    const ora = oraAggiornamentoOnline ? oraAggiornamentoOnline.toLocaleTimeString(localeCorrente(), { hour: '2-digit', minute: '2-digit' }) : '';
    const titolo = t('online.tooltip').replace('{ora}', ora);
    return ` <span class="badge-online" title="${escapeHtml(titolo)}">${escapeHtml(t('online.badge'))}</span>`;
}

export async function aggiornaStatoOnline() {
    if (!window.electronAPI?.modelleOnline || !funzioneDisponibile(SITO_MCG, FUNZIONI.ONLINE)) return;
    try {
        const esito = await window.electronAPI.modelleOnline(SITO_MCG);
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
