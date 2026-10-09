// Coerenza delle traduzioni: ogni lingua di LINGUE (js/i18n.js) ha il suo file in
// locales/, con le stesse chiavi e gli stessi segnaposto ({n}, {nome}...) dell'italiano,
// e compare nei selettori della lingua di index.html.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { caricaModuli } = require('./carica-script');

const radice = path.join(__dirname, '..');
const leggiLingua = (codice) => JSON.parse(fs.readFileSync(path.join(radice, 'locales', `${codice}.json`), 'utf8'));

// { 'form.title': 'testo', ... }
const piatte = (oggetto, prefisso = '') => Object.entries(oggetto).flatMap(([chiave, valore]) =>
    valore && typeof valore === 'object' ? piatte(valore, `${prefisso}${chiave}.`) : [[`${prefisso}${chiave}`, valore]]);
const segnaposto = (testo) => [...String(testo).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

test('ogni lingua ha le stesse chiavi e gli stessi segnaposto dell\'italiano', async () => {
    const { LINGUE } = await caricaModuli(['i18n.js']);
    const base = new Map(piatte(leggiLingua('it')));
    for (const codice of Object.keys(LINGUE)) {
        const traduzione = new Map(piatte(leggiLingua(codice)));
        const mancanti = [...base.keys()].filter(k => !traduzione.has(k));
        const inPiu = [...traduzione.keys()].filter(k => !base.has(k));
        assert.deepStrictEqual(mancanti, [], `${codice}.json: chiavi mancanti`);
        assert.deepStrictEqual(inPiu, [], `${codice}.json: chiavi in più`);
        for (const [chiave, testo] of base) {
            assert.ok(String(traduzione.get(chiave)).trim(), `${codice}.json: ${chiave} vuota`);
            assert.strictEqual(segnaposto(traduzione.get(chiave)), segnaposto(testo), `${codice}.json: segnaposto diversi in ${chiave}`);
        }
    }
});

test('i selettori della lingua offrono tutte le lingue tradotte', async () => {
    const { LINGUE } = await caricaModuli(['i18n.js']);
    const html = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
    for (const id of ['selectLingua', 'linguaBenvenuto']) {
        const select = new RegExp(`<select id="${id}"[^>]*>([\\s\\S]*?)</select>`).exec(html);
        assert.ok(select, `select ${id} non trovato`);
        const codici = [...select[1].matchAll(/<option value="(\w+)"/g)].map(m => m[1]).sort();
        assert.deepStrictEqual(codici, Object.keys(LINGUE).sort(), `lingue di ${id}`);
    }
    const file = fs.readdirSync(path.join(radice, 'locales')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
    assert.deepStrictEqual(file, Object.keys(LINGUE).sort(), 'ogni file in locales/ deve essere in LINGUE e viceversa');
});
