/* ==========================================================================
   TRADUZIONI (i18n)
   ========================================================================== */
export let traduzioniCorrenti = {};
export let linguaCorrente = localStorage.getItem('appLang') || 'it';

// Carica il file JSON della lingua
export async function caricaLingua(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        traduzioniCorrenti = await response.json();
        linguaCorrente = lang;
        localStorage.setItem('appLang', lang);

        aggiornaTestiDOM();

        // Allinea il selettore nell'header se presente
        const select = document.getElementById('selectLingua');
        if (select) select.value = lang;
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
