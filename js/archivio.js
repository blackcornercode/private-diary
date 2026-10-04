import { calcolaMappeModelle, calcolaModelleUniche } from './calcoli.js';
import { logger } from './logger.js';
import { stato } from './stato.js';
import { normalizzaShow, salvaOAvvisa, costoMedioAlMinuto } from './utils.js';

/* ==========================================================================
   ARCHIVIO DEGLI SHOW IN MEMORIA
   ==========================================================================
   L'archivio vive in memoria (stato.tuttiGliShow, in stato.js) ed è l'unica fonte
   di verità per l'interfaccia. Si legge dal disco solo all'avvio e dopo
   un'importazione (caricaArchivio). Ogni modifica passa da salvaArchivio:
   prima scrive su disco, poi aggiorna la memoria e ridisegna le viste
   (aggiornaViste), senza rileggere il file. */

// Lettura dal disco: ogni record viene portato al formato attuale (normalizzaShow),
// così il resto del codice non deve gestire i campi delle versioni precedenti.
export async function leggiArchivio() {
    const shows = await window.electronAPI.readData();
    return Array.isArray(shows) ? shows.map(normalizzaShow) : [];
}

// Copia indipendente dell'archivio, per elaborazioni che modificano i record
// (es. la sincronizzazione MCG) prima di decidere se salvarli
export function copiaArchivio() {
    return structuredClone(stato.tuttiGliShow);
}

// Salva un nuovo elenco completo di show. Se il salvataggio su disco fallisce
// (salvaOAvvisa mostra l'errore e lancia un'eccezione) la memoria resta invariata.
export async function salvaArchivio(nuoviShows) {
    await salvaOAvvisa(nuoviShows);
    stato.tuttiGliShow = nuoviShows;
    aggiornaViste();
}

export function aggiungiShow(show) {
    return salvaArchivio([...stato.tuttiGliShow, show]);
}

// Aggiorna i campi di uno show esistente mantenendo quelli che il form non
// gestisce (es. rimborsato, costoOriginale, dataRimborso): prima il record
// veniva sostituito per intero e queste informazioni andavano perse.
export async function aggiornaShow(id, campi) {
    if (!stato.tuttiGliShow.some(s => String(s.id) === String(id))) {
        throw new Error(`Show con ID ${id} non trovato`);
    }
    return salvaArchivio(stato.tuttiGliShow.map(s => String(s.id) === String(id) ? { ...s, ...campi } : s));
}

export function rimuoviShow(id) {
    return salvaArchivio(stato.tuttiGliShow.filter(s => String(s.id) !== String(id)));
}

export function trovaShow(id) {
    return stato.tuttiGliShow.find(s => String(s.id) === String(id)) || null;
}

// Funzioni da chiamare dopo ogni cambiamento dell'archivio (le viste, registrate
// da app.js): così l'archivio non dipende dai moduli che disegnano la pagina
export const ascoltatori = [];

export function alCambioArchivio(funzione) {
    ascoltatori.push(funzione);
}

// Ricalcola i dati derivati dall'archivio e avvisa le viste
export function aggiornaViste() {
    stato.costoMinutoRiferimento = costoMedioAlMinuto(stato.tuttiGliShow);
    stato.tuttiGliShow.forEach(s => {
        const idNum = Number(s.id);
        if (Number.isFinite(idNum) && idNum > stato.ultimoIdGenerato) stato.ultimoIdGenerato = idNum;
    });
    const mappe = calcolaMappeModelle(stato.tuttiGliShow);
    stato.mappaImmaginiModelle = mappe.immagini;
    stato.mappaUrlModelle = mappe.url;
    stato.elencoModelleUniche = calcolaModelleUniche(stato.tuttiGliShow);

    ascoltatori.forEach(funzione => funzione());
}

// Rilegge l'archivio dal disco e ridisegna tutto: all'avvio e dopo un'importazione
export async function aggiornaInterfaccia() {
    try {
        stato.tuttiGliShow = await leggiArchivio();
        logger.info(`Dati letti. Totale show caricati: ${stato.tuttiGliShow.length}`);
        aggiornaViste();
    } catch (err) {
        logger.error("Errore durante l'aggiornamento dell'interfaccia", err);
        alert(`❌ Impossibile caricare i dati: ${err.message}`);
    }
}
