# Gestione Show MCG

## Verifiche
- `npm test`: test automatici in `tests/` (node:test, nessuna dipendenza). Eseguirli dopo ogni modifica; `npm run dist` li esegue comunque prima della build.
- L'archivio vive in memoria (`tuttiGliShow`) ed è gestito da js/archivio.js: leggere da `tuttiGliShow`/`trovaShow()`, modificare solo con `aggiungiShow()`, `aggiornaShow()`, `rimuoviShow()` o `salvaArchivio()` (salvano su disco e chiamano `aggiornaViste()`). Mai `electronAPI.readData()`/`saveData()` diretti fuori da archivio.js e utils.js. Per elaborazioni che modificano i record usare `copiaArchivio()`.
- I record passano da `normalizzaShow()` alla lettura: usare solo i campi attuali (`durata`, `urlProfilo`, `punteggio`, `dataOraISO`, `dataFormattata`).
- Calcoli (totali, classifica, statistiche, filtri) in js/calcoli.js come funzioni pure, con test in tests/calcoli.test.js; le viste si limitano a disegnare.
- Colonne delle tabelle degli show: definite una volta in js/righe-show.js (`COLONNE_SHOW`); niente stili inline nei template, usare classi in style.css.
- js/ contiene moduli ES: ogni funzione usata da un altro file va esportata e importata esplicitamente (il test `moduli` lo verifica). Stato condiviso solo tramite l'oggetto `stato` di js/stato.js.
- Niente JavaScript nell'HTML (vietato dalla Content-Security-Policy): niente onclick/onchange/onerror né <script> inline. Usare `data-azione`/`data-al-cambio`/`data-al-input` e registrare la funzione in `registraAzioni` (js/app.js); per le immagini usare `data-sostituto`.
- Nuovi file usati dall'app vanno aggiunti a `build.files` in package.json (la build include solo i file elencati).
- Nuovi canali IPC: definirli in `main/canali.js`, registrarli in `main/ipc-*.js` ed esporli in `preload.js`; il test `canali-ipc` verifica la coerenza.

## Graphify
- Graphify (pacchetto `graphifyy`) è installato **solo nel venv del progetto**, non nel PATH di sistema.
- Interprete da usare: `venv/Scripts/python.exe` (già scritto in `graphify-out/.graphify_python`); eseguibile: `venv/Scripts/graphify.exe`.
- Nel passo "Ensure graphify is installed" della skill, usare questo interprete: non ricadere su `python3` e non installare `graphifyy` con pip/uv fuori dal venv.
- Aggiornare il grafo dopo modifiche al codice: `venv/Scripts/graphify.exe update .` (locale, senza costi).
- Dalla fase 3 i moduli di `js/` usano `import`/`export`: il grafo vede anche i collegamenti tra file. Restano invisibili le azioni dichiarate negli attributi `data-azione` (collegate a runtime da js/azioni.js) e i canali IPC tra interfaccia e processo principale.
