// Coerenza dei canali IPC: preload.js (che in sandbox non può importare
// main/canali.js) deve usare esattamente i canali definiti e registrati nel
// processo principale. Un nome scritto male farebbe fallire la chiamata solo a runtime.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const canali = require('../main/canali');

const radice = path.join(__dirname, '..');
const leggi = (f) => fs.readFileSync(path.join(radice, f), 'utf8');

const preload = leggi('preload.js');
const usatiInPreload = new Set([...preload.matchAll(/ipcRenderer\.(?:invoke|on|removeListener)\('([^']+)'/g)].map(m => m[1]));
const definiti = new Set(Object.values(canali));

const moduliIpc = fs.readdirSync(path.join(radice, 'main')).filter(f => f.startsWith('ipc-')).map(f => leggi(path.join('main', f)));
const registrati = new Set(moduliIpc.flatMap(s => [...s.matchAll(/ipcMain\.handle\(canali\.([A-Z_]+)/g)].map(m => canali[m[1]])));

test('ogni canale usato in preload.js è definito in main/canali.js', () => {
    for (const c of usatiInPreload) assert.ok(definiti.has(c), `canale non definito: ${c}`);
});

test('ogni canale definito è usato in preload.js', () => {
    for (const c of definiti) assert.ok(usatiInPreload.has(c), `canale definito ma non esposto: ${c}`);
});

test('ogni canale invocato dal preload ha un gestore registrato', () => {
    const invocati = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m => m[1]);
    for (const c of invocati) assert.ok(registrati.has(c), `nessun ipcMain.handle per: ${c}`);
});

test('i moduli ipc non usano nomi di canale scritti a mano', () => {
    for (const s of moduliIpc.concat(leggi('main.js'))) {
        assert.equal((s.match(/ipcMain\.handle\('/g) || []).length, 0);
    }
});
