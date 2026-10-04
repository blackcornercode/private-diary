// Genera CHANGELOG.md e le note di rilascio dell'ultima versione
// (docs/note-di-rilascio.md, da incollare nella release di GitHub) a partire da
// changelog.json, che resta l'unica fonte. Uso: npm run changelog
const fs = require('fs');
const path = require('path');

const radice = path.join(__dirname, '..');

// Ordine e titoli delle categorie (la categoria è il prefisso "Novità:", "Fix:"...)
const CATEGORIE = [
    ['Novità', '✨ Novità'],
    ['Interfaccia', '🎨 Interfaccia'],
    ['Sincronizza MCG', '🔄 Sincronizzazione MCG'],
    ['Fix', '🐛 Correzioni'],
    ['Sicurezza', '🔒 Sicurezza'],
    ['Tecnico', '🛠️ Tecnico']
];

function sezioniVersione(voci, livello) {
    const gruppi = new Map();
    for (const voce of voci) {
        const m = /^([^:]{1,25}):\s+(.*)$/s.exec(voce);
        const [categoria, testo] = m ? [m[1], m[2]] : ['Altro', voce];
        if (!gruppi.has(categoria)) gruppi.set(categoria, []);
        gruppi.get(categoria).push(testo.charAt(0).toUpperCase() + testo.slice(1));
    }
    const ordinate = [...CATEGORIE, ...[...gruppi.keys()].filter(c => !CATEGORIE.some(([k]) => k === c)).map(c => [c, c])];
    return ordinate
        .filter(([chiave]) => gruppi.has(chiave))
        .map(([chiave, titolo]) => `${'#'.repeat(livello)} ${titolo}\n\n${gruppi.get(chiave).map(t => `- ${t}`).join('\n')}\n`)
        .join('\n');
}

// Testi di CHANGELOG.md e delle note di rilascio (usata anche da tests/changelog.test.js)
function generaChangelog() {
const changelog = JSON.parse(fs.readFileSync(path.join(radice, 'changelog.json'), 'utf8'));
const pacchetto = JSON.parse(fs.readFileSync(path.join(radice, 'package.json'), 'utf8'));
const versioni = Object.entries(changelog);
const md = `# Changelog

Novità di ogni versione di **Diario Privato** (*Private Diary*, già *Gestione Show MCG*).
Generato da \`changelog.json\` con \`npm run changelog\`: per modificarlo, modificare \`changelog.json\`.

${versioni.map(([versione, voci]) => `## ${versione}\n\n${sezioniVersione(voci, 3)}`).join('\n')}`;
const [ultima, vociUltima] = versioni[0];
const nomeEseguibile = pacchetto.build.artifactName.replace('${version}', ultima).replace('${ext}', 'exe');
const note = `# Private Diary ${ultima}

**Download:** \`${nomeEseguibile}\` qui sotto, negli *Assets*. App portable per Windows 10/11: non serve installarla. L'eseguibile non ha una firma digitale: se Windows SmartScreen mostra un avviso, scegli **Ulteriori informazioni › Esegui comunque** (*More info › Run anyway*).

I dati delle versioni precedenti (anche di *Gestione Show MCG*) vengono letti automaticamente: non serve fare nulla.

${sezioniVersione(vociUltima, 2)}
---
Storia completa: [CHANGELOG.md](https://github.com/blackcornercode/private-diary/blob/main/CHANGELOG.md) · Contatti: blackcornermail@gmail.com
`;
return { md, note, versioni: versioni.length, ultima };
}

module.exports = { generaChangelog };

if (require.main === module) {
    const { md, note, versioni, ultima } = generaChangelog();
    fs.writeFileSync(path.join(radice, 'CHANGELOG.md'), md);
    fs.mkdirSync(path.join(radice, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(radice, 'docs', 'note-di-rilascio.md'), note);
    console.log(`CHANGELOG.md: ${versioni} versioni. Note di rilascio della ${ultima} in docs/note-di-rilascio.md`);
}
