// CHANGELOG.md e le note di rilascio sono generati da changelog.json:
// se changelog.json cambia bisogna rigenerarli con `npm run changelog`
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { generaChangelog } = require('../tools/genera-changelog.cjs');

const radice = path.join(__dirname, '..');
// Git su Windows può riscrivere gli a capo come CRLF: si confronta il testo
const leggi = (f) => fs.readFileSync(path.join(radice, f), 'utf8').replace(/\r\n/g, '\n');

test('CHANGELOG.md e note di rilascio sono aggiornati (npm run changelog)', () => {
    const { md, note } = generaChangelog();
    assert.equal(leggi('CHANGELOG.md'), md, 'CHANGELOG.md non aggiornato: eseguire npm run changelog');
    assert.equal(leggi('docs/note-di-rilascio.md'), note, 'docs/note-di-rilascio.md non aggiornato: eseguire npm run changelog');
});
