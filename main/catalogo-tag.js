// Catalogo dei tag degli show (tags.json nella cartella dati): elenco di
// { id, nome, colore }. Gli show salvano solo gli ID dei tag (campo "tag"),
// così rinominare un tag o cambiarne il colore non richiede di riscrivere l'archivio.

// Colori disponibili: corrispondono alle classi tag-colore-* di style.css
const COLORI_TAG = ['blu', 'verde', 'acqua', 'viola', 'rosa', 'rosso', 'arancio', 'ambra', 'grigio'];

// Catalogo iniziale, creato al primo avvio (poi liberamente modificabile)
const TAG_PREDEFINITI = [
    { id: 'anal', nome: 'Anal', colore: 'rosso' },
    { id: 'lush', nome: 'Lush', colore: 'viola' },
    { id: 'squirt', nome: 'Squirt', colore: 'blu' }
];

const LUNGHEZZA_MASSIMA_NOME = 40;

// Tiene solo voci valide (ID e nome non vuoti, ID non ripetuti) e porta i colori
// sconosciuti a "grigio". Lancia un'eccezione se non riceve un array.
function validaCatalogoTag(catalogo) {
    if (!Array.isArray(catalogo)) throw new Error('Catalogo tag non valido: era atteso un array.');
    const visti = new Set();
    const valido = [];
    for (const voce of catalogo) {
        if (!voce || typeof voce.id !== 'string' || typeof voce.nome !== 'string') continue;
        const id = voce.id.trim();
        const nome = voce.nome.trim().slice(0, LUNGHEZZA_MASSIMA_NOME);
        if (!id || !nome || visti.has(id)) continue;
        visti.add(id);
        valido.push({ id, nome, colore: COLORI_TAG.includes(voce.colore) ? voce.colore : 'grigio' });
    }
    return valido;
}

module.exports = { COLORI_TAG, TAG_PREDEFINITI, LUNGHEZZA_MASSIMA_NOME, validaCatalogoTag };
