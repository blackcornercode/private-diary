// Archivio DIMOSTRATIVO per gli screenshot del README: modelle, nickname e note
// inventati, foto sostituite da avatar grafici (SVG con le iniziali), tag non
// espliciti. Nessun dato reale. Uso: node tools/screenshot/genera-demo.cjs <cartella>
const fs = require('fs');
const path = require('path');

const cartella = process.argv[2];
if (!cartella) {
    console.error('Uso: node tools/screenshot/genera-demo.cjs <cartella dati>');
    process.exit(1);
}

// Generatore pseudo-casuale con seme fisso: gli screenshot restano uguali tra un'esecuzione e l'altra
let seme = 20261004;
const caso = () => ((seme = (seme * 1103515245 + 12345) % 2147483648) / 2147483648);
const scegli = (elenco) => elenco[Math.floor(caso() * elenco.length)];

function avatar(iniziali, da, a) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${da}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><text x="60" y="74" font-family="Segoe UI, Arial" font-size="44" font-weight="700" fill="#fff" text-anchor="middle">${iniziali}</text></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const TAG = [
    { id: 'lovense', nome: 'Lovense', colore: 'viola' },
    { id: 'strip', nome: 'Strip', colore: 'rosa' },
    { id: 'roleplay', nome: 'Roleplay', colore: 'blu' },
    { id: 'lingerie', nome: 'Lingerie', colore: 'rosso' },
    { id: 'cosplay', nome: 'Cosplay', colore: 'verde' },
    { id: 'dirty-talk', nome: 'Dirty talk', colore: 'arancio' }
];

// nome, colori dell'avatar, piattaforma, nickname, prezzo tipico, voto medio, tag preferiti
const MODELLE = [
    ['LunaVelvet', '#7c3aed', '#db2777', 'Teams', 'luna.velvet@example.com', 60, 5, ['lovense', 'lingerie']],
    ['ScarlettRose', '#dc2626', '#f97316', 'Telegram', '@scarlett_rose', 50, 4, ['strip', 'roleplay']],
    ['MiaDolce', '#0891b2', '#22c55e', 'Teams', 'mia.dolce@example.com', 40, 5, ['dirty-talk', 'lovense']],
    ['NoirKitty', '#111827', '#6b7280', 'Skype', 'noir.kitty', 70, 3, ['cosplay', 'roleplay']],
    ['BellaStar', '#2563eb', '#7c3aed', 'Teams', 'bella.star@example.com', 45, 4, ['lingerie', 'strip']],
    ['RubyMoon', '#be123c', '#a855f7', 'Zoom', 'ruby.moon', 55, 4, ['cosplay']],
    ['GiadaBlue', '#0d9488', '#2563eb', 'Teams', 'giada.blue@example.com', 35, 3, ['dirty-talk']],
    ['VioletFox', '#9333ea', '#f59e0b', 'Telegram', '@violet_fox', 80, 5, ['lovense', 'roleplay']]
];

// In inglese: gli screenshot del README usano l'interfaccia in inglese
const NOTE = [
    'Very friendly, engaging show.',
    'Great connection and a lovely set.',
    'Started a bit late, then perfect.',
    'Must repeat: best of the month.',
    'Short but intense.',
    'Nice chat before the show.',
    '', '', ''
];

const shows = [];
let id = 1780000000000;
const aggiungi = (modella, data, extra = {}) => {
    const [nome, da, a, piattaforma, nickname, prezzo, voto, preferiti] = modella;
    const durata = scegli([10, 15, 15, 20, 30, 30, 45, 60]);
    const costo = Math.round(prezzo * (0.6 + durata / 40) / 5) * 5;
    const iniziali = nome.replace(/[^A-Z]/g, '').slice(0, 2);
    const votoShow = Math.max(1, Math.min(5, voto + scegli([-1, 0, 0, 0, 1])));
    shows.push({
        id: id++,
        dataOraISO: data.toISOString(),
        dataFormattata: `${data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
        nome,
        isRegalo: false,
        piattaforma,
        punteggio: caso() < 0.08 ? 'TBD' : votoShow,
        costo,
        durata,
        immagine: avatar(iniziali, da, a),
        urlProfilo: '',
        recensione: caso() < 0.4,
        note: scegli(NOTE),
        isAutoImport: caso() < 0.5,
        nickname,
        tag: preferiti.filter(() => caso() < 0.7).concat(caso() < 0.2 ? [scegli(TAG).id] : []).filter((t, i, e) => e.indexOf(t) === i),
        ...extra
    });
};

// Show da gennaio 2025 a inizio ottobre 2026, più frequenti nei mesi recenti
for (let mese = 0; mese < 22; mese++) {
    const quanti = mese < 12 ? 1 + Math.floor(caso() * 2) : 2 + Math.floor(caso() * 3);
    for (let n = 0; n < quanti; n++) {
        const giorno = 1 + Math.floor(caso() * 27);
        const data = new Date(2025, mese, giorno, 19 + Math.floor(caso() * 4), Math.floor(caso() * 4) * 15);
        if (data > new Date(2026, 9, 3)) continue;
        aggiungi(scegli(MODELLE), data);
    }
}
// Uno show nel mese corrente, per il budget e il grafico
aggiungi(MODELLE[2], new Date(2026, 9, 2, 21, 30));
// Un regalo, per mostrare il badge
const regalo = MODELLE[0];
shows.push({
    id: id++, dataOraISO: new Date(2026, 8, 14, 21, 0).toISOString(), dataFormattata: '14/09/2026 21:00',
    nome: regalo[0], isRegalo: true, piattaforma: '', punteggio: null, costo: 25, durata: 0,
    immagine: shows.find(s => s.nome === regalo[0]).immagine, urlProfilo: '', recensione: false,
    note: 'Birthday gift.', isAutoImport: false, nickname: regalo[4], tag: []
});

fs.mkdirSync(cartella, { recursive: true });
fs.writeFileSync(path.join(cartella, 'shows_data.json'), JSON.stringify(shows, null, 2));
fs.writeFileSync(path.join(cartella, 'tags.json'), JSON.stringify(TAG, null, 2));
console.log(`Archivio dimostrativo: ${shows.length} show di ${MODELLE.length} modelle in ${cartella}`);
