// Immagine di anteprima per GitHub (Settings > Social preview, 1280x640):
// nome, slogan e uno screenshot. Avviato da esegui.cjs dopo gli screenshot:
//   electron tools/screenshot/anteprima-social.cjs <cartella screenshot>
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const cartella = process.argv[process.argv.length - 1];
const screenshot = fs.readFileSync(path.join(cartella, 'cronologia.png')).toString('base64');
const icona = fs.readFileSync(path.join(__dirname, '..', '..', 'icon-neutra.png')).toString('base64');

const pagina = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1280px; height: 640px; overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;
         background: linear-gradient(135deg, #2a0d16 0%, #6d2336 55%, #a2782f 130%); color: #faf7f1; }
  .testo { position: absolute; left: 70px; top: 120px; width: 520px; }
  .marchio { display: flex; align-items: center; gap: 18px; }
  .marchio img { width: 84px; height: 84px; }
  h1 { font-size: 64px; font-weight: 800; letter-spacing: -1px; }
  .sottotitolo { margin-top: 6px; font-size: 22px; color: #e9d7b0; font-weight: 600; }
  p { margin-top: 34px; font-size: 27px; line-height: 1.4; }
  ul { margin-top: 26px; padding: 0; list-style: none; font-size: 21px; line-height: 1.7; color: #f3e3ea; }
  .foto { position: absolute; left: 640px; top: 80px; width: 760px; border-radius: 16px; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,.45); transform: rotate(-3deg); border: 1px solid rgba(255,255,255,.25); }
  .foto img { display: block; width: 100%; }
  .piede { position: absolute; left: 70px; bottom: 40px; font-size: 18px; color: #e9d7b0; }
</style></head><body>
  <div class="testo">
    <div class="marchio"><img src="data:image/png;base64,${icona}"><div><h1>Private Diary</h1><div class="sottotitolo">Diario Privato</div></div></div>
    <p>Your private cam-show diary: spending, ratings and rankings in one place.</p>
    <ul><li>📊 €/min, budget and spending charts</li><li>🏆 Model ranking, tags and notes</li><li>🔒 PIN lock, blurred photos, neutral name</li></ul>
  </div>
  <div class="foto"><img src="data:image/png;base64,${screenshot}"></div>
  <div class="piede">Windows desktop app · © 2026 The Black Corner</div>
</body></html>`;

app.whenReady().then(async () => {
    const win = new BrowserWindow({ width: 1280, height: 640, show: false, useContentSize: true, webPreferences: { offscreen: true } });
    await win.loadURL(`data:text/html;base64,${Buffer.from(pagina).toString('base64')}`);
    await new Promise(r => setTimeout(r, 500));
    const immagine = await win.webContents.capturePage({ x: 0, y: 0, width: 1280, height: 640 });
    fs.writeFileSync(path.join(cartella, 'anteprima-social.png'), immagine.resize({ width: 1280, height: 640 }).toPNG());
    console.log('  anteprima-social.png');
    app.quit();
});
