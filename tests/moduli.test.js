// Controllo statico dei moduli ES di js/: ogni nome importato deve essere
// esportato dal modulo di origine, e ogni nome esportato da un altro modulo e
// usato nel codice deve essere importato. Un import mancante non dà errori al
// caricamento ma solo quando la riga viene eseguita (ReferenceError).
// Verifica anche che l'HTML non contenga più gestori inline (vietati dalla CSP).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const radice = path.join(__dirname, '..');
const DIR = path.join(radice, 'js');
const file = fs.readdirSync(DIR).filter(f => f.endsWith('.js'));
const sorgenti = Object.fromEntries(file.map(f => [f, fs.readFileSync(path.join(DIR, f), 'utf8')]));

const esportati = {};   // nome -> file
for (const f of file) {
    for (const m of sorgenti[f].matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([\w$]+)/gm)) esportati[m[1]] = f;
}
const importati = (s) => {
    const elenco = [];
    for (const m of s.matchAll(/^import\s*\{([^}]*)\}\s*from\s*'\.\/([^']+)'/gm)) {
        m[1].split(',').map(x => x.trim()).filter(Boolean).forEach(nome => elenco.push({ nome, da: m[2] }));
    }
    return elenco;
};
// Commenti e testo delle stringhe semplici esclusi (i template literal restano: contengono codice)
const codiceSenzaCommenti = (s) => s
    .replace(/^import .*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');

test('ogni nome importato è esportato dal modulo indicato', () => {
    for (const f of file) {
        for (const { nome, da } of importati(sorgenti[f])) {
            assert.ok(file.includes(da), `${f}: modulo inesistente ${da}`);
            assert.equal(esportati[nome], da, `${f}: "${nome}" non è esportato da ${da}`);
        }
    }
});

test('ogni funzione di un altro modulo usata nel codice è importata', () => {
    const mancanti = [];
    for (const f of file) {
        const giaImportati = new Set(importati(sorgenti[f]).map(i => i.nome));
        const codice = codiceSenzaCommenti(sorgenti[f]);
        for (const [nome, origine] of Object.entries(esportati)) {
            if (origine === f || giaImportati.has(nome)) continue;
            // nome usato come identificatore (non proprietà obj.nome, non chiave nome:)
            if (new RegExp(`(?<![\\w$.])${nome.replace('$', '\\$')}\\b(?!\\s*:(?!:))`).test(codice)) mancanti.push(`${f}: ${nome} (da ${origine})`);
        }
    }
    assert.deepEqual(mancanti, []);
});

test("index.html carica solo il modulo app.js e non contiene JavaScript inline", () => {
    const html = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
    assert.deepEqual(html.match(/<script[^>]*>/g), ['<script type="module" src="js/app.js">']);
    assert.equal(html.match(/\son[a-z]+\s*=/gi), null, 'gestori inline (onclick...) vietati dalla CSP');
    assert.match(html, /http-equiv="Content-Security-Policy"[^>]*script-src 'self'/);
});

test('ogni azione usata nell\'HTML o nei template è registrata in app.js', () => {
    const html = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
    // Commenti esclusi (azioni.js documenta il formato con l'esempio data-azione="nome")
    const senzaCommenti = (x) => x.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const tutto = senzaCommenti(html) + Object.values(sorgenti).map(senzaCommenti).join('\n');
    const usate = new Set([
        ...[...tutto.matchAll(/data-(?:azione|al-cambio|al-input)="([a-z-]+)"/g)].map(m => m[1]),
        ...[...tutto.matchAll(/dataset\.azione\s*=\s*'([a-z-]+)'/g)].map(m => m[1])
    ]);
    const blocco = sorgenti['app.js'].match(/registraAzioni\(\{([\s\S]*?)\n\}\);/);
    assert.ok(blocco, 'registraAzioni non trovato in app.js');
    const registrate = new Set([...blocco[1].matchAll(/^\s*'([a-z-]+)':/gm)].map(m => m[1]));
    const mancanti = [...usate].filter(a => !registrate.has(a));
    const inutilizzate = [...registrate].filter(a => !usate.has(a));
    assert.deepEqual(mancanti, [], 'azioni usate ma non registrate');
    assert.deepEqual(inutilizzate, [], 'azioni registrate ma mai usate');
});

test('i template JavaScript non generano gestori inline', () => {
    for (const f of file) {
        const codice = sorgenti[f].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        assert.equal(codice.match(/\son(click|change|input|keydown|error|load|mouseover)=/g), null, `${f} contiene gestori inline`);
    }
});
