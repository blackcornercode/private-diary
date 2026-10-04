/* ==========================================================================
   STATO CONDIVISO DELL'APPLICAZIONE
   ==========================================================================
   Un unico oggetto mutabile: con i moduli ES una variabile importata è in sola
   lettura, quindi lo stato modificato da più moduli sta in proprietà di "stato"
   (es. stato.tuttiGliShow = ...). */
export const stato = {
    // Archivio in memoria (gestito da archivio.js) e dati derivati
    tuttiGliShow: [],
    mappaImmaginiModelle: {},
    mappaUrlModelle: {},
    elencoModelleUniche: [],
    // Catalogo dei tag [{ id, nome, colore }] (tags.json, gestito da archivio.js);
    // gli show salvano gli ID nel campo "tag"
    catalogoTag: [],
    // Costo medio al minuto di tutti gli show: riferimento per colorare i €/min
    costoMinutoRiferimento: null,
    // ID più alto già usato: generaIdUnico() parte da qui (utils.js)
    ultimoIdGenerato: 0,

    // Cronologia
    anniSelezionati: new Set(),
    paginaCorrente: 1,
    // Selezione multipla (selezione.js): ID degli show selezionati, come stringhe.
    // idPagina/idFiltrati sono aggiornati da caricaCronologia a ogni disegno.
    selezioneCronologia: new Set(),
    idPaginaCronologia: [],
    idFiltratiCronologia: [],
    // Tag scelti nel form e nella modifica multipla (tag.js): ID -> '+' aggiungi / '-' togli
    tagForm: new Set(),
    tagModificaMultipla: new Map(),

    // Classifica, statistiche, galleria, preferenze
    classificaCompletaCache: [],
    meseSelezionatoDettaglio: null,
    galleriaCorrente: [],
    indiceFotoCorrente: 0,
    currentFontSize: 18
};

export const iconePiattaformaHTML = {
    'Teams': '<i class="fa-solid fa-users-rectangle" style="color: #6264A7;"></i> Teams',
    'Telegram': '<i class="fa-brands fa-telegram" style="color: #2AABEE;"></i> Telegram',
    'Skype': '<i class="fa-brands fa-skype" style="color: #00AFF0;"></i> Skype',
    'Zoom': '<i class="fa-solid fa-video" style="color: #2D8CFF;"></i> Zoom',
    'Altro': '<i class="fa-solid fa-globe" style="color: #6c757d;"></i> Altro'
};
