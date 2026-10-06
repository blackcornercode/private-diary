// Catalogo dei siti di provenienza degli show (siti.json nella cartella dati):
// elenco di { id, nome, sigla, colore, valuta, tasso, urlProfilo? }. Gli show
// salvano l'ID nel campo "sito" (roadmap multi-sito, docs/ROADMAP.md).
//   sigla       etichetta breve per badge e tabelle (es. "MCG")
//   valuta      unità in cui il sito fa pagare: EUR, USD, GBP, token, crediti
//   tasso       valore in euro di un'unità (EUR = 1): gli show salvano sempre il
//               costo in euro, così €/min e budget restano confrontabili tra siti
//   attivo      il sito è tra quelli che si usano: solo questi compaiono nel form
//               e, per Mondo Cam Girls, attivano le funzioni collegate al sito
//   urlProfilo  modello dell'indirizzo del profilo di una modella, con {nome}
//               al posto del nome (facoltativo: solo per i siti che lo hanno)
const { COLORI_TAG } = require('./catalogo-tag');

// Mondo Cam Girls: gli show salvati prima dell'introduzione dei siti vengono tutti da qui
const SITO_MCG = 'mcg';

const VALUTE = ['EUR', 'USD', 'GBP', 'token', 'crediti'];

// Tassi indicativi (valore in euro di un'unità): si correggono in Impostazioni › Gestisci siti
const SITI_PREDEFINITI = [
    { id: SITO_MCG, nome: 'Mondo Cam Girls', sigla: 'MCG', colore: 'rosso', valuta: 'EUR', tasso: 1, urlProfilo: 'https://{nome}.mondocamgirls.com' },
    { id: 'chaturbate', nome: 'Chaturbate', sigla: 'CB', colore: 'arancio', valuta: 'token', tasso: 0.08 },
    { id: 'stripchat', nome: 'Stripchat', sigla: 'SC', colore: 'rosa', valuta: 'token', tasso: 0.08 },
    { id: 'bongacams', nome: 'BongaCams', sigla: 'BC', colore: 'viola', valuta: 'token', tasso: 0.08 },
    { id: 'livejasmin', nome: 'LiveJasmin', sigla: 'LJ', colore: 'ambra', valuta: 'crediti', tasso: 0.9 },
    { id: 'onlyfans', nome: 'OnlyFans', sigla: 'OF', colore: 'blu', valuta: 'USD', tasso: 0.9 }
];

const LUNGHEZZA_MASSIMA_NOME = 40;
const LUNGHEZZA_MASSIMA_SIGLA = 6;

// Tiene solo voci valide (ID e nome non vuoti, ID non ripetuti); colori sconosciuti
// in grigio, sigla ricavata dal nome se manca, valuta sconosciuta in EUR, tasso
// positivo (1 per l'euro), urlProfilo solo se https con {nome}.
// Mondo Cam Girls resta sempre nel catalogo: gli show esistenti lo usano.
// Lancia un'eccezione se non riceve un array.
function validaCatalogoSiti(catalogo) {
    if (!Array.isArray(catalogo)) throw new Error('Catalogo siti non valido: era atteso un array.');
    const visti = new Set();
    const valido = [];
    for (const voce of catalogo) {
        if (!voce || typeof voce.id !== 'string' || typeof voce.nome !== 'string') continue;
        const id = voce.id.trim();
        const nome = voce.nome.trim().slice(0, LUNGHEZZA_MASSIMA_NOME);
        if (!id || !nome || visti.has(id)) continue;
        visti.add(id);
        const sigla = (typeof voce.sigla === 'string' && voce.sigla.trim() ? voce.sigla.trim() : nome)
            .slice(0, LUNGHEZZA_MASSIMA_SIGLA).toUpperCase();
        const valuta = VALUTE.includes(voce.valuta) ? voce.valuta : 'EUR';
        const tasso = valuta === 'EUR' ? 1 : (Number(voce.tasso) > 0 && Number(voce.tasso) <= 10000 ? Number(voce.tasso) : 1);
        // Un sito senza l'informazione (cataloghi precedenti) è considerato in uso
        const sito = { id, nome, sigla, colore: COLORI_TAG.includes(voce.colore) ? voce.colore : 'grigio', valuta, tasso, attivo: voce.attivo !== false };
        if (typeof voce.urlProfilo === 'string' && /^https:\/\/\S*\{nome\}/.test(voce.urlProfilo)) sito.urlProfilo = voce.urlProfilo;
        valido.push(sito);
    }
    if (!visti.has(SITO_MCG)) valido.unshift({ ...SITI_PREDEFINITI[0], attivo: true });
    return valido;
}

module.exports = { SITO_MCG, VALUTE, SITI_PREDEFINITI, validaCatalogoSiti };
