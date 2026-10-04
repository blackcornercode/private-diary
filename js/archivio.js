/* ==========================================================================
   ARCHIVIO DEGLI SHOW IN MEMORIA
   ==========================================================================
   L'archivio vive in memoria (tuttiGliShow, in stato.js) ed è l'unica fonte
   di verità per l'interfaccia. Si legge dal disco solo all'avvio e dopo
   un'importazione (caricaArchivio). Ogni modifica passa da salvaArchivio:
   prima scrive su disco, poi aggiorna la memoria e ridisegna le viste
   (aggiornaViste), senza rileggere il file. */

// Lettura dal disco: ogni record viene portato al formato attuale (normalizzaShow),
// così il resto del codice non deve gestire i campi delle versioni precedenti.
async function leggiArchivio() {
    const shows = await window.electronAPI.readData();
    return Array.isArray(shows) ? shows.map(normalizzaShow) : [];
}

// Copia indipendente dell'archivio, per elaborazioni che modificano i record
// (es. la sincronizzazione MCG) prima di decidere se salvarli
function copiaArchivio() {
    return structuredClone(tuttiGliShow);
}

// Salva un nuovo elenco completo di show. Se il salvataggio su disco fallisce
// (salvaOAvvisa mostra l'errore e lancia un'eccezione) la memoria resta invariata.
async function salvaArchivio(nuoviShows) {
    await salvaOAvvisa(nuoviShows);
    tuttiGliShow = nuoviShows;
    aggiornaViste();
}

function aggiungiShow(show) {
    return salvaArchivio([...tuttiGliShow, show]);
}

// Aggiorna i campi di uno show esistente mantenendo quelli che il form non
// gestisce (es. rimborsato, costoOriginale, dataRimborso): prima il record
// veniva sostituito per intero e queste informazioni andavano perse.
async function aggiornaShow(id, campi) {
    if (!tuttiGliShow.some(s => String(s.id) === String(id))) {
        throw new Error(`Show con ID ${id} non trovato`);
    }
    return salvaArchivio(tuttiGliShow.map(s => String(s.id) === String(id) ? { ...s, ...campi } : s));
}

function rimuoviShow(id) {
    return salvaArchivio(tuttiGliShow.filter(s => String(s.id) !== String(id)));
}

function trovaShow(id) {
    return tuttiGliShow.find(s => String(s.id) === String(id)) || null;
}

// Ricalcola i dati derivati dall'archivio e ridisegna tutte le viste
function aggiornaViste() {
    costoMinutoRiferimento = costoMedioAlMinuto(tuttiGliShow);
    tuttiGliShow.forEach(s => {
        const idNum = Number(s.id);
        if (Number.isFinite(idNum) && idNum > ultimoIdGenerato) ultimoIdGenerato = idNum;
    });
    const mappe = calcolaMappeModelle(tuttiGliShow);
    mappaImmaginiModelle = mappe.immagini;
    mappaUrlModelle = mappe.url;
    elencoModelleUniche = calcolaModelleUniche(tuttiGliShow);

    aggiornaDatalistModelle();
    inizializzaFiltroAnni(tuttiGliShow);
    popolaSelettoreAnni(tuttiGliShow);
    caricaCronologia(tuttiGliShow);
    caricaStatisticheMensili(tuttiGliShow);
    caricaMedieEStoricizzazione(tuttiGliShow);
    // Mantiene l'eventuale ricerca e il filtro "Solo online" della classifica
    filtraClassificaModelle();
    aggiornaIndicatoreBudgetHomepage(tuttiGliShow);
}

// Rilegge l'archivio dal disco e ridisegna tutto: all'avvio e dopo un'importazione
async function aggiornaInterfaccia() {
    try {
        tuttiGliShow = await leggiArchivio();
        logger.info(`Dati letti. Totale show caricati: ${tuttiGliShow.length}`);
        aggiornaViste();
    } catch (err) {
        logger.error("Errore durante l'aggiornamento dell'interfaccia", err);
        alert(`❌ Impossibile caricare i dati: ${err.message}`);
    }
}
