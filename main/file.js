const fs = require('fs').promises;

// Scrittura atomica: scrive su file temporaneo e poi rinomina, così un crash
// a metà scrittura non lascia mai un file JSON troncato.
async function scriviFileAtomico(percorso, contenuto) {
    const tmp = `${percorso}.tmp`;
    await fs.writeFile(tmp, contenuto, 'utf-8');
    await fs.rename(tmp, percorso);
}

// Testo di un file scritto da altri programmi: UTF-8 (con o senza BOM) oppure,
// se non è UTF-8 valido, Windows-1252 (Excel in italiano salva i CSV così)
function decodificaTesto(buffer) {
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
    } catch {
        return new TextDecoder('windows-1252').decode(buffer);
    }
}

module.exports = { scriviFileAtomico, decodificaTesto };
