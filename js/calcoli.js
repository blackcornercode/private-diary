import { stato } from './stato.js';
import { dataDelloShow, annoDelloShow, timestampShow, minutiDelloShow, costoMedioAlMinuto } from './utils.js';

/* ==========================================================================
   CALCOLI SUGLI SHOW (funzioni pure)
   ==========================================================================
   Ricevono gli show (già normalizzati) e restituiscono risultati: non leggono
   né modificano la pagina, lo stato globale o localStorage. Le viste usano
   questi risultati per disegnare; i test in tests/calcoli.test.js li verificano. */

export const chiaveModella = (nome) => String(nome || '').trim().toLowerCase();

// Ultima foto e ultimo profilo noti per ogni modella (in ordine di data, vince il più recente)
export function calcolaMappeModelle(shows) {
    const immagini = {};
    const url = {};
    [...shows].sort((a, b) => timestampShow(a) - timestampShow(b)).forEach(show => {
        if (!show.nome) return;
        const chiave = chiaveModella(show.nome);
        if (show.immagine) immagini[chiave] = show.immagine;
        if (show.urlProfilo) url[chiave] = show.urlProfilo;
    });
    return { immagini, url };
}

// Una voce per modella con gli ultimi dati noti (autocompletamento del form,
// piattaforma e nickname dei nuovi show importati da MCG)
export function calcolaModelleUniche(shows) {
    const mappa = new Map();
    [...shows].sort((a, b) => timestampShow(a) - timestampShow(b)).forEach(show => {
        if (!show.nome || show.nome.trim() === '') return;
        const chiave = chiaveModella(show.nome);
        const esistente = mappa.get(chiave) || {};
        mappa.set(chiave, {
            nome: show.nome.trim(),
            urlProfilo: show.urlProfilo || esistente.urlProfilo || '',
            immagine: show.immagine || esistente.immagine || '',
            piattaforma: show.piattaforma || esistente.piattaforma || 'Teams',
            nickname: show.nickname || esistente.nickname || ''
        });
    });
    return Array.from(mappa.values());
}

// Show di una modella, dal più recente
export function showsDiModella(shows, nome) {
    const chiave = chiaveModella(nome);
    return shows.filter(s => s.nome && chiaveModella(s.nome) === chiave)
        .sort((a, b) => timestampShow(b) - timestampShow(a));
}

// Totali di un gruppo di show: numero, spesa, minuti, voti e €/min medio.
// La media voti esclude regali e show da valutare (TBD).
export function riepilogoShow(shows) {
    let spesaTotale = 0, totaleDurata = 0, sommaVoti = 0, conteggioVoti = 0;
    shows.forEach(show => {
        spesaTotale += parseFloat(show.costo) || 0;
        totaleDurata += minutiDelloShow(show);
        if (!show.isRegalo && show.punteggio && show.punteggio !== 'TBD') {
            const v = parseFloat(show.punteggio);
            if (!isNaN(v)) { sommaVoti += v; conteggioVoti += 1; }
        }
    });
    const mediaTxt = conteggioVoti > 0 ? (sommaVoti / conteggioVoti).toFixed(2) : 'N/D';
    return {
        totaleShow: shows.length,
        spesaTotale,
        totaleDurata,
        sommaVoti,
        conteggioVoti,
        mediaTxt,
        mediaValore: mediaTxt === 'N/D' ? -1 : parseFloat(mediaTxt),
        costoMedioMinuto: costoMedioAlMinuto(shows)
    };
}

// Classifica delle modelle: 1° media voti, 2° numero di show (entrambi decrescenti);
// a pari merito viene prima la modella con lo show più recente (ordine dei gruppi,
// mantenuto dall'ordinamento stabile).
// mappe = { immagini, url } da calcolaMappeModelle, per foto e profilo di ripiego.
export function calcolaClassifica(shows, mappe = { immagini: {}, url: {} }) {
    const gruppi = new Map();
    [...shows].sort((a, b) => timestampShow(b) - timestampShow(a)).forEach(show => {
        if (!show.nome) return;
        const chiave = chiaveModella(show.nome);
        if (!gruppi.has(chiave)) {
            // I dati "prevalenti" vengono dallo show più recente
            gruppi.set(chiave, {
                nome: show.nome.trim(),
                foto: show.immagine || mappe.immagini[chiave] || '',
                urlProfilo: show.urlProfilo || mappe.url[chiave] || '',
                piattaformaPrevalente: '',
                nicknamePrevalente: '',
                elencoShow: []
            });
        }
        const gruppo = gruppi.get(chiave);
        // Piattaforma e nickname: dallo show più recente che li ha. I regali non
        // hanno piattaforma: se l'ultimo show è un regalo vale quello precedente
        if (!gruppo.piattaformaPrevalente && !show.isRegalo && show.piattaforma) gruppo.piattaformaPrevalente = show.piattaforma;
        if (!gruppo.nicknamePrevalente && show.nickname) gruppo.nicknamePrevalente = show.nickname;
        gruppo.elencoShow.push(show);
    });

    const classifica = [...gruppi.values()].map(({ elencoShow, ...modella }) => ({ ...modella, ...riepilogoShow(elencoShow) }));
    classifica.sort((a, b) => (b.mediaValore - a.mediaValore) || (b.totaleShow - a.totaleShow));
    classifica.forEach((m, i) => { m.posizioneOriginale = i + 1; });
    return classifica;
}

// Anni presenti negli show, dal più recente
export function anniDisponibili(shows) {
    return Array.from(new Set(shows.map(annoDelloShow).filter(Boolean))).sort((a, b) => b - a);
}

// Statistiche di un anno: spesa e numero di show per mese, e gli show di ogni
// mese ordinati dal più recente
export function calcolaStatisticheAnno(shows, anno) {
    const spesa = Array(12).fill(0);
    const conteggio = Array(12).fill(0);
    const showPerMese = Array.from({ length: 12 }, () => []);
    shows.forEach(show => {
        const d = dataDelloShow(show);
        if (!d || d.getFullYear() !== anno) return;
        const m = d.getMonth();
        spesa[m] += parseFloat(show.costo) || 0;
        conteggio[m] += 1;
        showPerMese[m].push(show);
    });
    showPerMese.forEach(elenco => elenco.sort((a, b) => timestampShow(b) - timestampShow(a)));
    return { spesa, conteggio, showPerMese };
}

// Spesa e numero di show per anno, dal più vecchio (per il grafico della spesa).
// Gli anni senza show tra il primo e l'ultimo compaiono con spesa 0.
export function spesaPerAnno(shows) {
    const perAnno = new Map();
    shows.forEach(show => {
        const anno = annoDelloShow(show);
        if (!anno) return;
        const voce = perAnno.get(anno) || { anno, spesa: 0, conteggio: 0 };
        voce.spesa += parseFloat(show.costo) || 0;
        voce.conteggio += 1;
        perAnno.set(anno, voce);
    });
    if (perAnno.size === 0) return [];
    const anni = [...perAnno.keys()];
    const risultato = [];
    for (let anno = Math.min(...anni); anno <= Math.max(...anni); anno++) {
        risultato.push(perAnno.get(anno) || { anno, spesa: 0, conteggio: 0 });
    }
    return risultato;
}

// Spesa del mese di calendario di "oggi"
export function spesaMeseCorrente(shows, oggi = new Date()) {
    return shows.reduce((totale, show) => {
        const d = dataDelloShow(show);
        const delMese = d && d.getFullYear() === oggi.getFullYear() && d.getMonth() === oggi.getMonth();
        return delMese ? totale + (parseFloat(show.costo) || 0) : totale;
    }, 0);
}

// Stato del budget mensile: percentuale usata (0-100), differenza (positiva se
// avanza, negativa se sforato) e classe CSS del colore
export function statoBudget(spesa, budget) {
    if (!(budget > 0)) return { impostato: false, percentuale: 0, differenza: 0, stato: 'stato-neutro' };
    const differenza = budget - spesa;
    return {
        impostato: true,
        percentuale: Math.min(100, Math.max(0, (spesa / budget) * 100)),
        differenza,
        stato: differenza >= 0 ? 'stato-ok' : 'stato-ko'
    };
}

// Filtri e ordinamento della cronologia: nome (contiene, senza maiuscole),
// anni selezionati (nessuno = tutti), tag (ID; vuoto = tutti) e ordine per data ('asc' o 'desc')
export function filtraOrdinaShows(shows, { nome = '', anni = [], ordine = 'desc', tag = '' } = {}) {
    const filtroNome = nome.trim().toLowerCase();
    const anniScelti = new Set(anni);
    const risultato = shows.filter(s =>
        (!filtroNome || (s.nome && s.nome.toLowerCase().includes(filtroNome))) &&
        (anniScelti.size === 0 || anniScelti.has(annoDelloShow(s))) &&
        (!tag || (s.tag || []).includes(tag)));
    risultato.sort((a, b) => {
        const diff = timestampShow(a) - timestampShow(b);
        return ordine === 'asc' ? diff : -diff;
    });
    return risultato;
}

// Modifica di più show insieme: applica a ogni show con ID in "ids" i campi
// presenti in "campi" (piattaforma, punteggio, recensione, durata, nickname;
// un campo assente resta invariato) e aggiunge/toglie i tag di tagAggiungi/tagTogli. Piattaforma e voto non si applicano ai
// regali, come nel form. Restituisce un nuovo elenco (gli show non toccati
// restano gli stessi oggetti), quanti show sono cambiati e quanti regali sono
// stati esclusi da piattaforma/voto.
export function applicaModificheMultiple(shows, ids, campi) {
    const scelti = new Set(ids.map(String));
    const tocchiPiattaformaVoto = campi.piattaforma !== undefined || campi.punteggio !== undefined;
    let modificati = 0;
    let regaliSaltati = 0;

    const risultato = shows.map(show => {
        if (!scelti.has(String(show.id))) return show;
        const nuovo = { ...show };
        let cambiato = false;
        const imposta = (campo, valore) => {
            if (nuovo[campo] !== valore) { nuovo[campo] = valore; cambiato = true; }
        };

        if (show.isRegalo) {
            if (tocchiPiattaformaVoto) regaliSaltati++;
        } else {
            if (campi.piattaforma !== undefined) imposta('piattaforma', campi.piattaforma);
            if (campi.punteggio !== undefined) imposta('punteggio', campi.punteggio);
        }
        if (campi.recensione !== undefined) imposta('recensione', campi.recensione);
        if (campi.durata !== undefined) imposta('durata', campi.durata);
        if (campi.nickname !== undefined) imposta('nickname', campi.nickname);
        if (campi.tagAggiungi || campi.tagTogli) {
            const attuali = show.tag || [];
            const nuovi = aggiornaElencoTag(attuali, campi.tagAggiungi, campi.tagTogli);
            if (nuovi.length !== attuali.length || nuovi.some((id, i) => id !== attuali[i])) {
                nuovo.tag = nuovi;
                cambiato = true;
            }
        }

        if (!cambiato) return show;
        modificati++;
        return nuovo;
    });
    return { shows: risultato, modificati, regaliSaltati };
}

// Tag di uno show dopo aver tolto "togli" e aggiunto "aggiungi" (senza doppioni,
// l'ordine dei tag già presenti resta)
export function aggiornaElencoTag(attuali = [], aggiungi = [], togli = []) {
    const daTogliere = new Set(togli);
    const risultato = attuali.filter(id => !daTogliere.has(id));
    aggiungi.forEach(id => { if (!daTogliere.has(id) && !risultato.includes(id)) risultato.push(id); });
    return risultato;
}

// Quante volte compare ogni tag negli show, dal più usato; a parità vale
// l'ordine in cui i tag compaiono (gli show arrivano di solito dal più recente)
export function conteggioTag(shows) {
    const conteggi = new Map();
    shows.forEach(s => (s.tag || []).forEach(id => conteggi.set(id, (conteggi.get(id) || 0) + 1)));
    return [...conteggi].map(([id, conteggio]) => ({ id, conteggio })).sort((a, b) => b.conteggio - a.conteggio);
}

// Toglie un tag (eliminato dal catalogo) da tutti gli show che lo usano
export function togliTagDaShows(shows, id) {
    let modificati = 0;
    const risultato = shows.map(s => {
        if (!(s.tag || []).includes(id)) return s;
        modificati++;
        return { ...s, tag: s.tag.filter(altro => altro !== id) };
    });
    return { shows: risultato, modificati };
}

// Una pagina di un elenco. limite 'all' = tutto in una pagina; la pagina
// richiesta viene riportata nell'intervallo valido.
export function paginaDi(elenco, limite, pagina) {
    if (limite === 'all') return { elementi: elenco, pagina: 1, totalePagine: 1 };
    const perPagina = parseInt(limite, 10) || elenco.length || 1;
    const totalePagine = Math.ceil(elenco.length / perPagina) || 1;
    const p = Math.min(Math.max(1, pagina), totalePagine);
    return { elementi: elenco.slice((p - 1) * perPagina, p * perPagina), pagina: p, totalePagine };
}
