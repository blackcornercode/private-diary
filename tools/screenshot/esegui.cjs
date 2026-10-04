// Rigenera gli screenshot del README con dati dimostrativi: `npm run screenshot`.
// I dati veri non vengono mai letti: l'app parte con --user-data-dir su una
// cartella temporanea che contiene solo l'archivio inventato (genera-demo.cjs).
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const radice = path.join(__dirname, '..', '..');
const datiDemo = fs.mkdtempSync(path.join(os.tmpdir(), 'private-diary-demo-'));
const uscita = path.join(radice, 'docs', 'screenshot');
fs.mkdirSync(uscita, { recursive: true });

execFileSync(process.execPath, [path.join(__dirname, 'genera-demo.cjs'), datiDemo], { stdio: 'inherit' });

// Barre normali: dentro NODE_OPTIONS la barra rovesciata tra virgolette fa da carattere di escape
const moduloCattura = path.join(__dirname, 'cattura.cjs').split(path.sep).join('/');
const env = { ...process.env, CATTURA_USCITA: uscita, NODE_OPTIONS: `--require "${moduloCattura}"` };
// Nel terminale di VS Code ELECTRON_RUN_AS_NODE farebbe partire Electron come Node
delete env.ELECTRON_RUN_AS_NODE;
console.log(`Screenshot in ${uscita}:`);
const esito = spawnSync(require('electron'), ['.', `--user-data-dir=${datiDemo}`], { cwd: radice, env, stdio: 'inherit' });

fs.rmSync(datiDemo, { recursive: true, force: true });
if (esito.status !== 0) process.exit(esito.status ?? 1);

// Immagine di anteprima per GitHub, composta con lo screenshot della cronologia
const envAnteprima = { ...process.env };
delete envAnteprima.ELECTRON_RUN_AS_NODE;
const anteprima = spawnSync(require('electron'), [path.join(__dirname, 'anteprima-social.cjs'), uscita], { cwd: radice, env: envAnteprima, stdio: 'inherit' });
process.exit(anteprima.status ?? 1);
