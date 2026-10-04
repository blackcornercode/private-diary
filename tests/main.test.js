// Test delle funzioni pure del processo principale (main/)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { urlMcgValido, slugProfiloMcg } = require('../main/rete');
const { urlPagina } = require('../main/mcg-pagine');

test('solo URL di mondocamgirls.com sono accettati', () => {
    assert.ok(urlMcgValido('https://www.mondocamgirls.com/it/areacliente_transazioni.html'));
    assert.ok(urlMcgValido('https://anna.mondocamgirls.com'));
    assert.ok(!urlMcgValido('https://mondocamgirls.com.esempio.it'));
    assert.ok(!urlMcgValido('file:///C:/Windows'));
    assert.ok(!urlMcgValido('non un url'));
});

test('sottodominio del profilo', () => {
    assert.equal(slugProfiloMcg('https://Anna.mondocamgirls.com/en'), 'anna');
    assert.equal(slugProfiloMcg('https://www.mondocamgirls.com'), null);
    assert.equal(slugProfiloMcg(''), null);
});

test('indirizzo delle pagine della cronologia', () => {
    assert.equal(urlPagina('https://www.mondocamgirls.com/it/x.html?pagina_vis=0', 3), 'https://www.mondocamgirls.com/it/x.html?pagina_vis=3');
    assert.equal(urlPagina('https://www.mondocamgirls.com/it/x.html', 100), 'https://www.mondocamgirls.com/it/x.html?pagina_vis=100');
});

test('catalogo dei tag: voci non valide scartate, colori sconosciuti in grigio', () => {
    const { validaCatalogoTag, TAG_PREDEFINITI } = require('../main/catalogo-tag');
    assert.deepEqual(validaCatalogoTag([
        { id: 'a', nome: '  Anal ', colore: 'rosso' },
        { id: 'a', nome: 'Doppione', colore: 'blu' },
        { id: 'b', nome: '', colore: 'blu' },
        { id: 'c', nome: 'Lush', colore: 'fucsia' },
        null, 'testo', { nome: 'senza id' }
    ]), [{ id: 'a', nome: 'Anal', colore: 'rosso' }, { id: 'c', nome: 'Lush', colore: 'grigio' }]);
    assert.equal(validaCatalogoTag([{ id: 'x', nome: 'n'.repeat(60) }])[0].nome.length, 40);
    assert.throws(() => validaCatalogoTag({}), /array/);
    assert.deepEqual(validaCatalogoTag(TAG_PREDEFINITI), TAG_PREDEFINITI);
});

test('profilo sospeso riconosciuto dall\'avviso della pagina MCG', () => {
    const { profiloSospeso } = require('../main/rete');
    // Estratti delle pagine reali (deabunnyrose sospesa, profilo attivo)
    const testata = '<a class="mp-btn mp-btn--primary mp-top__fav js-mp-tab-link" href="#mp-servizi">Pay for a show</a></h1>';
    assert.equal(profiloSospeso(testata + `<p class="mp-badge mp-badge--warn">WARNING! PROFILE TEMPORARYLY SUSPENDED!! IT'S NOT POSSIBLE TO PURCHASE ANY TYPE OF SHOW</p>`), true);
    assert.equal(profiloSospeso(testata + '<p class="mp-badge mp-badge--warn">ATTENZIONE! PROFILO TEMPORANEAMENTE SOSPESO</p>'), true);
    assert.equal(profiloSospeso(testata + '<p class="mp-badge mp-badge--warn">Nuovi video in arrivo</p>'), false, 'altri avvisi non contano');
    assert.equal(profiloSospeso(testata), false);
    assert.equal(profiloSospeso(''), null);
    assert.equal(profiloSospeso('<html>pagina di errore</html>'), null, 'pagina non riconosciuta');
});
