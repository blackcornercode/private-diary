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

test('modifica multipla: applica solo i campi scelti e salta piattaforma/voto sui regali', () => {
    const shows = json(SHOWS);
    const { shows: nuovi, modificati, regaliSaltati } = f.applicaModificheMultiple(shows, ['3', 4, 5], { piattaforma: 'Zoom', punteggio: 'TBD', recensione: true });
    assert.equal(modificati, 3);
    assert.equal(regaliSaltati, 1);
    const per = (id) => nuovi.find(s => s.id === id);
    assert.equal(per(3).piattaforma, 'Zoom');
    assert.equal(per(3).punteggio, 'TBD');
    assert.equal(per(3).costo, 40, 'gli altri campi restano');
    assert.equal(per(4).piattaforma, undefined, 'il regalo non riceve la piattaforma');
    assert.equal(per(4).punteggio, null);
    assert.equal(per(4).recensione, true, 'la recensione vale anche per i regali');
    assert.strictEqual(nuovi[0], shows[0], 'gli show non selezionati restano gli stessi oggetti');
    assert.equal(shows[2].piattaforma, undefined, "l'elenco originale non viene modificato");
});

test('modifica multipla: show che hanno già i valori non contano come modificati', () => {
    // Lo show 1 ha già voto 5 e 25 minuti: cambia solo il 3
    const { shows: nuovi, modificati } = f.applicaModificheMultiple(SHOWS, [1, 3], { punteggio: 5, durata: 25 });
    assert.equal(modificati, 1);
    const r = f.applicaModificheMultiple(nuovi, [1, 3], { punteggio: 5, durata: 25 });
    assert.equal(r.modificati, 0);
    assert.strictEqual(r.shows[0], nuovi[0]);
    assert.equal(f.applicaModificheMultiple(SHOWS, [], { durata: 1 }).modificati, 0);
});

test('archivio: eliminazione e modifica multipla con un solo salvataggio', async () => {
    const salvati = [];
    globalThis.window.electronAPI = { saveData: async (dati) => { salvati.push(dati); return { success: true }; } };
    f.stato.tuttiGliShow = json(SHOWS);
    await f.rimuoviShows(['1', 2, 99]);
    assert.deepEqual(f.stato.tuttiGliShow.map(s => s.id), [3, 4, 5, 6]);
    assert.equal(salvati.length, 1);

    const esito = await f.aggiornaShows(['5', '6'], { nickname: 'cleo_chat' });
    assert.deepEqual(esito, { modificati: 2, regaliSaltati: 0 });
    assert.deepEqual(f.stato.tuttiGliShow.filter(s => s.nickname === 'cleo_chat').map(s => s.id), [5, 6]);
    assert.equal(salvati.length, 2);

    // Nessun cambiamento: niente salvataggio
    await f.aggiornaShows(['5'], { nickname: 'cleo_chat' });
    assert.equal(salvati.length, 2);
});

test('righe: la colonna selezione segna ed evidenzia gli show selezionati', () => {
    f.stato.selezioneCronologia = new Set(['3']);
    const scelta = f.rigaShow(SHOWS[2], ['selezione', 'nome']);
    assert.match(scelta, /^<tr class="riga-selezionata">/);
    assert.match(scelta, /data-al-cambio="seleziona-show" data-id="3" checked/);
    assert.doesNotMatch(f.rigaShow(SHOWS[0], ['selezione', 'nome']), /checked|riga-selezionata/);
    // Senza la colonna selezione (dettaglio mese, scheda) la riga non viene evidenziata
    assert.doesNotMatch(f.rigaShow(SHOWS[2], ['nome']), /riga-selezionata/);
    assert.match(f.intestazioneShow(['selezione']), /data-al-cambio="seleziona-pagina"/);
    f.stato.selezioneCronologia = new Set();
});

test('tag: aggiunta/rimozione, conteggio e rimozione da tutti gli show', () => {
    assert.deepEqual(f.aggiornaElencoTag(['a', 'b'], ['c', 'a'], ['b']), ['a', 'c']);
    assert.deepEqual(f.aggiornaElencoTag(undefined, ['x'], ['x']), [], 'togliere vince su aggiungere');
    const shows = [{ id: 1, tag: ['lush', 'anal'] }, { id: 2, tag: ['lush'] }, { id: 3 }];
    assert.deepEqual(f.conteggioTag(shows), [{ id: 'lush', conteggio: 2 }, { id: 'anal', conteggio: 1 }]);
    const { shows: senza, modificati } = f.togliTagDaShows(shows, 'lush');
    assert.equal(modificati, 2);
    assert.deepEqual(senza.map(s => s.tag), [['anal'], [], undefined]);
    assert.strictEqual(senza[2], shows[2]);
    assert.deepEqual(shows[0].tag, ['lush', 'anal'], "l'originale non cambia");
});

test('tag: modifica multipla e filtro della cronologia', () => {
    const shows = [{ id: 1, tag: ['lush'] }, { id: 2, tag: ['anal', 'lush'] }, { id: 3 }];
    const r = f.applicaModificheMultiple(shows, [1, 2, 3], { tagAggiungi: ['squirt'], tagTogli: ['lush'] });
    assert.equal(r.modificati, 3);
    assert.deepEqual(r.shows.map(s => s.tag), [['squirt'], ['anal', 'squirt'], ['squirt']]);
    assert.equal(f.applicaModificheMultiple(r.shows, [1], { tagAggiungi: ['squirt'], tagTogli: [] }).modificati, 0);
    const conDate = shows.map((s, i) => ({ ...s, dataOraISO: iso(2025, 1, i + 1) }));
    assert.deepEqual(f.filtraOrdinaShows(conDate, { tag: 'lush' }).map(s => s.id), [2, 1]);
    assert.equal(f.filtraOrdinaShows(conDate, { tag: '' }).length, 3);
});

test('righe: tag e note nella stessa cella, al massimo tre tag visibili', () => {
    f.stato.catalogoTag = ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ id, nome: id.toUpperCase(), colore: i ? 'blu' : 'colore-ignoto' }));
    const cella = f.cellaTagNote({ id: 1, tag: ['e', 'a', 'b', 'c', 'd', 'eliminato'], note: 'ciao' });
    assert.equal((cella.match(/class="etichetta-tag/g) || []).length, 6, '5 tag + "+2"');
    assert.equal((cella.match(/tag-extra/g) || []).length, 2);
    assert.match(cella, />\+2</);
    assert.match(cella, /tag-colore-grigio/, 'colore sconosciuto -> grigio');
    assert.match(cella, /data-azione="espandi-nota"/);
    assert.match(cella, /title="A, B, C, D, E — ciao"/);
    // Senza tag: la cella delle note di prima
    assert.equal(f.cellaTagNote({ note: 'x' }), f.cellaNote('x'));
    // Pochi tag e nessuna nota: niente da espandere
    assert.doesNotMatch(f.cellaTagNote({ tag: ['a'] }), /espandi-nota/);
    f.stato.catalogoTag = [];
});

test('profili sospesi: verificati una volta per profilo, saltando quelli recenti', async () => {
    const { profiliDaVerificare } = await import('../js/profili-sospesi.js');
    const ora = Date.UTC(2026, 9, 4, 12);
    const mappa = { anna: 'https://anna.mondocamgirls.com/it', 'anna ': 'https://Anna.mondocamgirls.com', bea: 'https://bea.mondocamgirls.com',
                    cleo: 'https://cleo.mondocamgirls.com', sito: 'https://www.esempio.it' };
    const cache = { bea: { sospeso: true, verificato: ora - 60 * 60 * 1000 }, cleo: { sospeso: false, verificato: ora - 13 * 60 * 60 * 1000 } };
    assert.deepEqual([...profiliDaVerificare(mappa, cache, ora)], [['anna', 'https://anna.mondocamgirls.com'], ['cleo', 'https://cleo.mondocamgirls.com']]);
});

test('classifica: se l\'ultimo show è un regalo, piattaforma e nickname vengono dallo show precedente', () => {
    const shows = [
        { id: 1, nome: 'Loca', dataOraISO: iso(2026, 8, 27), costo: 100, punteggio: 5, piattaforma: 'Teams', nickname: 'peach' },
        { id: 2, nome: 'Loca', dataOraISO: iso(2026, 9, 9), costo: 30, isRegalo: true, punteggio: null, piattaforma: '' }
    ];
    const [loca] = f.calcolaClassifica(shows);
    assert.equal(loca.piattaformaPrevalente, 'Teams');
    assert.equal(loca.nicknamePrevalente, 'peach');
    // Solo regali: nessuna piattaforma
    assert.equal(f.calcolaClassifica([shows[1]])[0].piattaformaPrevalente, '');
});

test('spesa per anno, con gli anni senza show a zero', () => {
    const shows = [
        { costo: 50, dataOraISO: iso(2023, 5, 1) }, { costo: '20.5', dataOraISO: iso(2023, 6, 1) },
        { costo: 100, dataOraISO: iso(2025, 1, 1) }, { costo: 10 }
    ];
    assert.deepEqual(f.spesaPerAnno(shows), [
        { anno: 2023, spesa: 70.5, conteggio: 2 },
        { anno: 2024, spesa: 0, conteggio: 0 },
        { anno: 2025, spesa: 100, conteggio: 1 }
    ]);
    assert.deepEqual(f.spesaPerAnno([]), []);
});

test('grafico a barre: una barra per voce, linea del budget e barre oltre il budget', async () => {
    const { graficoBarre } = await import('../js/grafico-spesa.js');
    const voci = [
        { etichetta: 'Gen', valore: 120, dettaglio: 'Gennaio: € 120' },
        { etichetta: 'Feb', valore: 0, dettaglio: 'Febbraio' },
        { etichetta: 'Mar', valore: 300, dettaglio: '<b>Marzo</b>', evidenziata: true }
    ];
    const svg = graficoBarre(voci, { soglia: 200, etichettaSoglia: 'Budget € 200' });
    assert.equal((svg.match(/<rect /g) || []).length, 3);
    assert.equal((svg.match(/class="barra oltre-soglia/g) || []).length, 1);
    assert.match(svg, /class="barra oltre-soglia evidenziata"/);
    assert.match(svg, /class="linea-soglia"/);
    assert.match(svg, /&lt;b&gt;Marzo/, 'tooltip con escape');
    assert.doesNotMatch(svg, /NaN|Infinity/);
    // Senza soglia: nessuna linea; tutti zero: niente divisioni per zero
    assert.doesNotMatch(graficoBarre(voci), /linea-soglia|oltre-soglia/);
    assert.doesNotMatch(graficoBarre([{ etichetta: 'X', valore: 0, dettaglio: '' }]), /NaN|Infinity/);
});

test('scheda rapida della modella nel form: ultimo show vero e tag più usati', () => {
    const shows = [
        { id: 1, nome: 'Loca', dataOraISO: iso(2026, 8, 27), costo: 100, durata: 60, punteggio: 5, piattaforma: 'Teams', tag: ['lush', 'anal'] },
        { id: 2, nome: 'Loca', dataOraISO: iso(2026, 7, 24), costo: 80, durata: 30, punteggio: 4, tag: ['lush'] },
        { id: 3, nome: 'loca ', dataOraISO: iso(2026, 9, 9), costo: 30, isRegalo: true, punteggio: null }
    ];
    const s = f.schedaRapidaModella(shows, 'LOCA');
    assert.equal(s.totaleShow, 3);
    assert.equal(s.mediaTxt, '4.50');
    assert.equal(s.ultimoShow.id, 1, 'il regalo più recente non conta come ultimo show');
    assert.deepEqual(s.tagFrequenti, ['lush', 'anal']);
    assert.equal(f.schedaRapidaModella(shows, 'Sconosciuta'), null);
    assert.equal(f.schedaRapidaModella([shows[2]], 'Loca').ultimoShow, null);
});
