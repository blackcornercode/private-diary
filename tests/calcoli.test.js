// Test dei calcoli puri (js/calcoli.js), del disegnatore delle righe
// (js/righe-show.js) e dell'archivio in memoria (js/archivio.js)
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { caricaModuli } = require('./carica-script');

let f;
before(async () => {
    f = await caricaModuli(['stato.js', 'i18n.js', 'utils.js', 'calcoli.js', 'righe-show.js', 'archivio.js']);
    f.impostaTraduzioni({ units: { min: 'm', hour: 'h' }, table: { name: 'Nome', date: 'Data', notes: 'Note', no_photo: 'No Foto' }, form: { gift: 'Regalo' } });
});
// Copia del contenuto (toglie i Set e i riferimenti condivisi)
const json = (x) => JSON.parse(JSON.stringify(x));
const iso = (a, m, g, h = 21) => new Date(a, m - 1, g, h, 0).toISOString();

const SHOWS = [
    { id: 1, nome: 'Anna', dataOraISO: iso(2025, 1, 10), costo: 50, durata: 25, punteggio: 5, immagine: 'a1.jpg', urlProfilo: 'https://anna.mondocamgirls.com' },
    { id: 2, nome: 'anna ', dataOraISO: iso(2025, 3, 5), costo: 30, punteggio: 'TBD', immagine: 'a2.jpg', piattaforma: 'Telegram', nickname: 'annina' },
    { id: 3, nome: 'Bea', dataOraISO: iso(2025, 3, 20), costo: 40, durata: 20, punteggio: 4 },
    { id: 4, nome: 'Bea', dataOraISO: iso(2024, 12, 1), costo: 0, isRegalo: true, punteggio: null },
    { id: 5, nome: 'Cleo', dataOraISO: iso(2025, 3, 21), costo: 60, durata: 30, punteggio: 5 },
    { id: 6, nome: 'Cleo', dataOraISO: iso(2025, 2, 2), costo: 20, punteggio: 5 }
];

test('riepilogo di un gruppo di show', () => {
    const r = f.riepilogoShow(SHOWS.filter(s => s.nome.trim().toLowerCase() === 'bea'));
    assert.equal(r.totaleShow, 2);
    assert.equal(r.spesaTotale, 40);
    assert.equal(r.totaleDurata, 20);
    assert.equal(r.mediaTxt, '4.00');      // il regalo non conta nella media voti
    assert.equal(r.costoMedioMinuto, 2);   // né nel €/min
    assert.equal(f.riepilogoShow([]).mediaTxt, 'N/D');
});

test('classifica: media voti, poi numero di show; dati prevalenti dallo show più recente', () => {
    const c = json(f.calcolaClassifica(SHOWS, f.calcolaMappeModelle(SHOWS)));
    assert.deepEqual(c.map(m => m.nome), ['Cleo', 'anna', 'Bea']);   // 5.00 (2 show), 5.00 (2 show, nome dallo show più recente), 4.00
    assert.deepEqual(c.map(m => m.posizioneOriginale), [1, 2, 3]);
    const anna = c[1];
    assert.equal(anna.totaleShow, 2);
    assert.equal(anna.mediaTxt, '5.00');   // TBD escluso
    assert.equal(anna.foto, 'a2.jpg');
    assert.equal(anna.piattaformaPrevalente, 'Telegram');
    assert.equal(anna.urlProfilo, 'https://anna.mondocamgirls.com');   // dalla mappa, lo show recente non ce l'ha
});

test('mappe e modelle uniche: vince il dato più recente', () => {
    const m = json(f.calcolaMappeModelle(SHOWS));
    assert.equal(m.immagini.anna, 'a2.jpg');
    assert.equal(m.url.anna, 'https://anna.mondocamgirls.com');
    const u = json(f.calcolaModelleUniche(SHOWS));
    assert.equal(u.length, 3);
    const anna = u.find(x => x.nome === 'anna');
    assert.equal(anna.nickname, 'annina');
    assert.equal(anna.piattaforma, 'Telegram');
    assert.equal(u.find(x => x.nome === 'Bea').piattaforma, 'Teams');   // predefinita
    assert.deepEqual(json(f.showsDiModella(SHOWS, ' ANNA')).map(s => s.id), [2, 1]);
});

test('statistiche di un anno e budget', () => {
    const s = json(f.calcolaStatisticheAnno(SHOWS, 2025));
    assert.deepEqual(s.conteggio, [1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert.deepEqual(s.spesa.slice(0, 3), [50, 20, 130]);
    assert.deepEqual(s.showPerMese[2].map(x => x.id), [5, 3, 2]);   // dal più recente
    assert.deepEqual(json(f.anniDisponibili(SHOWS)), [2025, 2024]);
    assert.equal(f.spesaMeseCorrente(SHOWS, new Date(2025, 2, 25)), 130);
    assert.deepEqual(json(f.statoBudget(130, 0)), { impostato: false, percentuale: 0, differenza: 0, stato: 'stato-neutro' });
    assert.deepEqual(json(f.statoBudget(50, 200)), { impostato: true, percentuale: 25, differenza: 150, stato: 'stato-ok' });
    const sforato = json(f.statoBudget(250, 200));
    assert.equal(sforato.percentuale, 100);
    assert.equal(sforato.stato, 'stato-ko');
});

test('cronologia: filtri, ordine e pagine', () => {
    assert.deepEqual(json(f.filtraOrdinaShows(SHOWS, {})).map(s => s.id), [5, 3, 2, 6, 1, 4]);
    assert.deepEqual(json(f.filtraOrdinaShows(SHOWS, { nome: 'CLE', ordine: 'asc' })).map(s => s.id), [6, 5]);
    assert.deepEqual(json(f.filtraOrdinaShows(SHOWS, { anni: [2024] })).map(s => s.id), [4]);
    const p = json(f.paginaDi([1, 2, 3, 4, 5], '2', 9));
    assert.deepEqual(p, { elementi: [5], pagina: 3, totalePagine: 3 });
    assert.deepEqual(json(f.paginaDi([1, 2], 'all', 4)), { elementi: [1, 2], pagina: 1, totalePagine: 1 });
    assert.deepEqual(json(f.paginaDi([], '5', 1)), { elementi: [], pagina: 1, totalePagine: 1 });
});

test('righe degli show: una cella per colonna, intestazioni allineate, testo con escape', () => {
    const conta = (html, tag) => (html.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length;
    for (const colonne of [f.COLONNE_CRONOLOGIA, f.COLONNE_DETTAGLIO_MESE, f.COLONNE_SCHEDA]) {
        assert.equal(conta(f.rigaShow(SHOWS[0], colonne), 'td'), colonne.length);
        assert.equal(conta(f.intestazioneShow(colonne), 'th'), colonne.length);
    }
    const riga = f.rigaShow({ id: 9, nome: '<b>X</b>', note: 'ok', costo: 1 }, ['nome']);
    assert.ok(riga.includes('&lt;b&gt;X&lt;/b&gt;') && !riga.includes('<b>X'));
});

test('archivio: aggiornare uno show mantiene i campi che il form non gestisce', async () => {
    const salvati = [];
    globalThis.window.electronAPI = { saveData: async (dati) => { salvati.push(dati); return { success: true }; } };
    // Nessuna vista registrata con alCambioArchivio: niente da ridisegnare nel test
    f.stato.tuttiGliShow = [{ id: 7, nome: 'R', costo: 0, costoOriginale: 35, rimborsato: true, dataRimborso: '2025-07-02T17:44:00.000Z', note: 'Rimborsato' }];
    await f.aggiornaShow(7, { id: 7, nome: 'R', costo: 0, note: 'Rimborsato · nota nuova', punteggio: 4 });
    const show = f.stato.tuttiGliShow[0];
    assert.equal(show.rimborsato, true);
    assert.equal(show.costoOriginale, 35);
    assert.equal(show.punteggio, 4);
    assert.equal(salvati.length, 1);
    await assert.rejects(f.aggiornaShow(999, {}), /non trovato/);
});

test('archivio: se il salvataggio su disco fallisce la memoria resta invariata', async () => {
    globalThis.alert = () => {};
    globalThis.window.electronAPI = { saveData: async () => ({ success: false, error: 'disco pieno' }) };
    f.stato.tuttiGliShow = [{ id: 1, nome: 'A' }];
    await assert.rejects(f.aggiungiShow({ id: 2, nome: 'B' }), /disco pieno/);
    await assert.rejects(f.rimuoviShow(1), /disco pieno/);
    assert.deepEqual(f.stato.tuttiGliShow.map(s => s.id), [1]);
});
