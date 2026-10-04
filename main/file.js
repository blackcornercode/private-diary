const fs = require('fs').promises;

// Scrittura atomica: scrive su file temporaneo e poi rinomina, così un crash
// a metà scrittura non lascia mai un file JSON troncato.
async function scriviFileAtomico(percorso, contenuto) {
    const tmp = `${percorso}.tmp`;
    await fs.writeFile(tmp, contenuto, 'utf-8');
    await fs.rename(tmp, percorso);
}

module.exports = { scriviFileAtomico };
