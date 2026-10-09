/* ==========================================================================
   TRADUZIONI (i18n)
   ========================================================================== */
export let traduzioniCorrenti = {};
// Senza una scelta salvata (primissimo avvio) si parte dalla lingua del sistema:
// italiano se è l'italiano, altrimenti inglese
export const linguaDiSistema = () => (String(globalThis.navigator?.language || '').toLowerCase().startsWith('it') ? 'it' : 'en');
export let linguaCorrente = localStorage.getItem('appLang') || linguaDiSistema();

// Formato di date e giorni della settimana mostrati nell'interfaccia (es. "lun" / "Mon")
export const localeCorrente = () => (linguaCorrente === 'it' ? 'it-IT' : 'en-GB');

// Carica il file JSON della lingua
export async function caricaLingua(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        traduzioniCorrenti = await response.json();
        linguaCorrente = lang;
        localStorage.setItem('appLang', lang);

        aggiornaTestiDOM();

        // Allinea i selettori della lingua (Impostazioni e benvenuto al primo avvio)
        for (const id of ['selectLingua', 'linguaBenvenuto']) {
            const select = document.getElementById(id);
            if (select) select.value = lang;
        }
    } catch (err) {
        console.error(`Errore nel caricamento della lingua ${lang}:`, err);
    }
}

// Funzione helper per recuperare chiavi annidate (es. t('form.title'))
export function t(key) {
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), traduzioniCorrenti) || key;
}

// Aggiorna tutti gli elementi con data-i18n, data-i18n-ph e data-i18n-title
export function aggiornaTestiDOM() {
    // Testi generici
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        elem.textContent = t(key);
    });

    // Placeholder degli input
    document.querySelectorAll('[data-i18n-ph]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-ph');
        elem.placeholder = t(key);
    });

    // Tooltip (attributo title)
    document.querySelectorAll('[data-i18n-title]').forEach(elem => {
        elem.title = t(elem.getAttribute('data-i18n-title'));
    });
}

// Imposta direttamente le traduzioni (usata dai test, senza leggere i file JSON)
export function impostaTraduzioni(traduzioni) {
    traduzioniCorrenti = traduzioni;
}
