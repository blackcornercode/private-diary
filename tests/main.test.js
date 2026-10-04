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
