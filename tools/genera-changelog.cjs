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
const nomeFile = (target) => pacchetto.build[target].artifactName.replace('${version}', ultima).replace('${ext}', 'exe');
const note = `# Private Diary ${ultima}

## ⬇️ Download (Windows 10/11)

Negli *Assets* qui sotto:
- **\`${nomeFile('nsis')}\`** (consigliato): installa l'app per il tuo utente, senza permessi di amministratore, con collegamenti nel menu Start e sul desktop.
- **\`${nomeFile('portable')}\`**: versione portable, da avviare senza installazione.

I dati delle versioni precedenti (anche di *Gestione Show MCG*) vengono letti automaticamente; disinstallando l'app i dati restano.

## 🛡️ Se Windows o l'antivirus segnalano l'app

L'eseguibile non ha una firma digitale e, essendo nuovo, non ha ancora una «reputazione»: alcuni antivirus (per esempio AVG e Avast, con segnalazioni generiche come *IDP.ALEXA*) e Windows SmartScreen possono bloccarlo per prudenza. È un falso positivo:
- con SmartScreen scegli **Ulteriori informazioni › Esegui comunque** (*More info › Run anyway*);
- se vuoi una verifica indipendente, carica il file su [VirusTotal](https://www.virustotal.com), che lo analizza con circa 70 antivirus;
- preferisci l'installer: la versione portable a ogni avvio si estrae in una cartella temporanea, un comportamento che alcuni antivirus giudicano sospetto;
- il codice è tutto in questo repository e puoi compilarlo da te (\`npm run dist\`).

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
