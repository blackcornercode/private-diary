import { stato } from './stato.js';

/* ==========================================================================
   SITI DI PROVENIENZA DEGLI SHOW (roadmap multi-sito, docs/ROADMAP.md)
   ==========================================================================
   Ogni show ha un campo "sito" con l'ID di una voce del catalogo
   stato.catalogoSiti (siti.json, main/catalogo-siti.js), e "importatoDa" con
   l'ID del sito da cui è stato importato in automatico (null se inserito a mano).
   Il sito indica dove si è acquistato lo show; la "piattaforma" (Teams,
   Telegram...) resta dove lo show si è svolto. Qui solo dati e preferenze:
   l'interfaccia dei siti è in gestione-siti.js. */

// Stesso ID di main/catalogo-siti.js: gli show salvati prima dei siti vengono da qui
export const SITO_MCG = 'mcg';

// Sito degli show nuovi inseriti a mano: si sceglie in Impostazioni › Siti
// (localStorage, incluso nel backup come le altre impostazioni)
const CHIAVE_SITO_PREDEFINITO = 'sito_predefinito';

// Stesso elenco di main/catalogo-siti.js: valute in cui un sito può far pagare
export const VALUTE = ['EUR', 'USD', 'GBP', 'token', 'crediti'];

export function sitoDaId(id) {
    return stato.catalogoSiti.find(sito => sito.id === id) || null;
}

// Siti in uso (campo "attivo" del catalogo) più quelli indicati in "sempre"
// (es. i siti che hanno già degli show, o quello dello show in modifica)
export function sitiVisibili(sempre = []) {
    const extra = new Set(sempre);
    return stato.catalogoSiti.filter(sito => sito.attivo !== false || extra.has(sito.id));
}

// Le parti dell'interfaccia dedicate a Mondo Cam Girls (classe solo-mcg) si
// mostrano solo se il sito è in uso; le funzioni del connettore si controllano
// con funzioneDisponibile() di connettori.js.
// Con il catalogo non ancora caricato si considera in uso.
export function mcgAttivo() {
    const mcg = sitoDaId(SITO_MCG);
    return stato.catalogoSiti.length === 0 || !mcg || mcg.attivo !== false;
}

// Etichetta breve per badge e tabelle (es. "MCG"); per un sito non più nel catalogo l'ID
export function siglaSito(id) {
    return sitoDaId(id)?.sigla || String(id || '').toUpperCase();
}

export function sitoPredefinito() {
    let salvato = null;
    try {
        salvato = localStorage.getItem(CHIAVE_SITO_PREDEFINITO);
    } catch { /* localStorage non disponibile: si usa Mondo Cam Girls */ }
    // Un sito eliminato dal catalogo o non più in uso non vale come predefinito:
    // si passa al primo sito in uso
    const candidato = salvato && (stato.catalogoSiti.length === 0 || sitoDaId(salvato)) ? salvato : SITO_MCG;
    if (stato.catalogoSiti.length && sitoDaId(candidato)?.attivo === false) return sitiVisibili()[0]?.id || candidato;
    return candidato;
}

export function impostaSitoPredefinito(id) {
    try {
        localStorage.setItem(CHIAVE_SITO_PREDEFINITO, id);
    } catch { /* vale solo per questa sessione */ }
}
