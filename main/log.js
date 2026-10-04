// Log dell'applicazione (userData/app.log): una riga per evento, in ordine
// cronologico (le più recenti in fondo). Ogni riga viene aggiunta in coda al file;
// oltre DIMENSIONE_MAX il file diventa app.log.1 e se ne inizia uno nuovo.
// Prima ogni riga rileggeva e riscriveva l'intero file per metterla in cima.
const fs = require('fs').promises;
const percorsi = require('./percorsi');

const DIMENSIONE_MAX = 1024 * 1024; // 1 MB

// Le scritture sono messe in coda: due log ravvicinati non si sovrascrivono a vicenda
let coda = Promise.resolve();

async function ruotaSeNecessario() {
    try {
        const { size } = await fs.stat(percorsi.log);
        if (size > DIMENSIONE_MAX) await fs.rename(percorsi.log, percorsi.logPrecedente);
    } catch {
        // Il file non esiste ancora: verrà creato alla prima scrittura
    }
}

async function scriviRiga(livello, messaggio, dettagli) {
    try {
        await ruotaSeNecessario();
        const testoDettagli = dettagli ? ` - ${dettagli}` : '';
        await fs.appendFile(percorsi.log, `[${new Date().toISOString()}] [${livello}] ${messaggio}${testoDettagli}\n`, 'utf8');
    } catch (err) {
        console.error('Errore scrittura log:', err);
    }
}

function logToFile(livello, messaggio, dettagli = '') {
    coda = coda.then(() => scriviRiga(livello, messaggio, dettagli));
    return coda;
}

// Conversione una tantum dei log scritti dalle versioni precedenti, che avevano
// le righe più recenti in cima: si riordinano dalla più vecchia alla più recente
async function convertiLogVecchioFormato() {
    try {
        const righe = (await fs.readFile(percorsi.log, 'utf8')).split('\n').filter(Boolean);
        const data = r => (/^\[([^\]]+)\]/.exec(r) || [])[1] || '';
        if (righe.length > 1 && data(righe[0]) > data(righe[righe.length - 1])) {
            await fs.writeFile(percorsi.log, righe.reverse().join('\n') + '\n', 'utf8');
        }
    } catch {
        // Nessun log esistente: niente da convertire
    }
}

module.exports = { logToFile, convertiLogVecchioFormato };
