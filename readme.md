# Gestione Show MCG V2

![Version](https://img.shields.io/badge/version-v1.11.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Electron-brightgreen.svg)

**Gestione Show MCG** è un'applicazione desktop basata sull'architettura **Electron**, progettata per il monitoraggio, l'organizzazione e la storicizzazione degli show con **camgirl**. Il sistema offre un tracciamento avanzato delle sessioni e della spesa rispetto a budget mensili prefissati, fornendo metriche, statistiche economiche e classifiche automatiche. È nativamente integrata con il portale web **Mondo Cam Girls**.

---

## 📸 Caratteristiche Principali

- **Storicizzazione e Monitoraggio Show**: Registrazione dettagliata di ciascuna sessione con camgirl (data/ora, performer, piattaforma utilizzata, costi, valutazioni e recensioni).
- **Integrazione Mondo Cam Girls**: Sincronizzazione remota integrata per l'importazione automatica delle transazioni direttamente dall'area clienti web del sito Mondo Cam Girls.
- **Internazionalizzazione (i18n)**: Supporto nativo multilingua (Italiano 🇮🇹 ed Inglese 🇬🇧) con caricamento dinamico e persistenza della lingua selezionata.
- **Classifica Automatica Performer**: Elaborazione automatica delle metriche e delle valutazioni delle modella/camgirl in base a frequenza e punteggio medio.
- **Controllo Finanziario e Budget**: Monitoraggio della spesa mensile con soglie configurabili, avvisi di sforamento e barre di avanzamento grafiche.
- **Personalizzazione Visiva**: Supporto per temi multipli (*Neve & Nebbia*, *Luce Chiara*, *Eclissi Scura*) e ridimensionamento dinamico del font.
- **Gestione Dati Integrata**: Backup e ripristino in formato JSON (archivio show e budget mensile), con filtri avanzati per anno, ricerca per nome e paginazione.

---

## 🚀 Sezioni e Navigazione

L'interfaccia si sviluppa in tre sezioni principali accessibili dalla barra superiore:

### 1. Form & Cronologia
Consente l'inserimento manuale, la modifica e la consultazione dell'archivio storico degli show.

Il form è chiuso di default per lasciare spazio alla cronologia: si apre con **＋ Nuovo show** oppure con il pulsante ✏️ (Modifica) di una riga. Dopo il salvataggio si richiude; chiudendolo durante una modifica, la modifica viene annullata, mentre una bozza di nuovo show resta compilata.

| Campo | Tipo Dato | Descrizione |
| :--- | :--- | :--- |
| **Data e Ora** | Data/Ora ISO | Data e orario esatto della sessione. Una data non valida blocca il salvataggio con un avviso. |
| **Nome Modella** | Testo (Autocompletamento) | Nome della camgirl. Recupera automaticamente link e foto salvati. |
| **Piattaforma** | Menù a tendina custom | Opzioni: *Teams, Telegram, Skype, Zoom, Altro*. Disabilitato se "Regalo". |
| **Costo (€)** | Numerico (Decimali) | Importo economico speso per lo show. |
| **Durata Show** | Numerico (minuti) | Durata della sessione, usata anche per il costo al minuto. |
| **Voto / Punteggio** | Selezione (1-5 o TBD) | Valutazione qualitativa (1-5) o `TBD` (*To Be Decided*) per revisioni rinviate. |
| **Regalo / Recensione**| Checkbox | Contrassegna eventi gratuiti/regalo o presenza di recensione lasciata. |
| **URL Foto / Profilo** | URL Web | Link esterni per la foto e il profilo web della performer. |

#### Funzionalità avanzate della Cronologia:
- **Paginazione Dinamica**: Selezione di vista a 5, 10, 20 elementi o elenco completo.
- **Filtri e Ricerca**: Filtro per anno (generato dinamicamente) e ricerca istantanea per testo.
- **Badge Origine**: Distinzione visiva tra record ad inserimento manuale (`👤`) o importati da MCG (`🤖 MCG`).
- **Righe compatte**: Modifica (✏️) ed Elimina (🗑️) sono pulsanti a icona; nickname e note lunghi sono troncati con "…" e il testo completo compare al passaggio del mouse. Cliccando su una nota (o premendo Invio quando è selezionata) la si espande per leggerla tutta; un secondo clic la richiude. Se la finestra è stretta, la tabella scorre in orizzontale invece di tagliare le colonne.
- **Costo al Minuto (€/min)**: Calcolato automaticamente come costo ÷ durata. Mostra `–` per gli show senza durata registrata e per i regali.
- **Colori con significato** (gli stessi in cronologia, scheda modella e dettaglio del mese):
  - **Voto**: badge verde (5), verde acqua (4), ambra (3), rosso (1-2); `TBD` in grigio.
  - **€/min**: verde se lo show è costato meno al minuto della tua media su tutti gli show, rosso se di più; entro ±10% dalla media resta neutro. Il valore della media compare passando il mouse.
  - **Dati mancanti e regali**: durata non registrata mostrata come `–` in grigio; costo e voto dei regali attenuati.
  - Tutte le coppie testo/sfondo rispettano il contrasto minimo WCAG di 4.5:1 in ogni tema, righe a zebra comprese.

---

### 2. Classifica Generale Modelle
Elabora la cronologia salvata per generare indicatori prestazionali e statistici sulle camgirl:

- **Podio Automatico**: Assegnazione visiva delle prime posizioni (🥇 1°, 🥈 2°, 🥉 3°) per le valutazioni più alte.
- **Media Voti**: Calcolo ponderato escludendo sessioni contrassegnate come regali o `TBD`.
- **€/min Medio**: Costo medio al minuto per modella, presente anche nella scheda dettaglio. È calcolato come spesa ÷ minuti dei soli show con durata registrata, regali esclusi, così gli show più vecchi senza durata non gonfiano il risultato.
- **Scheda Dettaglio (Modal)**: Cliccando su una riga si apre il resoconto storico dettagliato degli show effettuati con la singola modella.
- **Modelle online**: accanto al nome compare il badge verde **● Online** se la modella è online su Mondo Cam Girls (anche nella scheda dettaglio); il filtro **Solo online** mostra solo quelle. Lo stato si aggiorna all'avvio e ogni 3 minuti, leggendo l'elenco delle modelle online dal servizio pubblico del sito (`getdata.html?online=si`, senza login). La modella viene riconosciuta dall'indirizzo del suo profilo (`https://<nome>.mondocamgirls.com`): senza un indirizzo valido lo stato non è verificabile e il badge non compare. Se il sito non risponde, i badge non compaiono e l'errore viene annotato nel log.

---

### 3. Statistiche Mensili e Budget
Fornisce il controllo finanziario sulle uscite e sui costi degli show:

- **Impostazione Budget**: Definisce la soglia massima di spesa mensile (€).
- **Avanzamento e Indicatori Dynamic**: Monitoraggio percentuale in tempo reale con avvisi cromatici e messaggi contestuali tradotti in base al superamento o rispetto del budget.
- **Visualizzazione Tabellare Dettagliata**: Prospetto dei 12 mesi con contatore degli show effettuati, totale speso e vista espandibile per singolo mese.

---

## ⚙️ Funzioni di Sistema e Utility

L'intestazione mostra sempre **🔄 Sincronizza MCG** e l'indicatore di raggiungibilità del sito. Le altre funzioni sono raccolte in due menu a tendina:
- **💾 Dati**: Esporta, Importa, Cartella.
- **⚙️ Impostazioni**: dimensione del testo, lingua, tema.

I menu si chiudono con un clic fuori o con `Esc`.

- **🌍 Selezione Lingua (i18n)**: Switch istantaneo tra Italiano (`it`) e Inglese (`en`), dal menu Impostazioni.
- **🔄 Sincronizzazione Automatica MCG**: Scarica e importa in automatico le transazioni dal profilo Mondo Cam Girls non ancora registrate localmente.
  - **Anti-duplicato**: una transazione è considerata già salvata se esiste uno show con la stessa modella e la stessa data/ora (al minuto). Se nella pagina ci sono più transazioni con la stessa modella nello stesso minuto, vengono importate tutte quelle non ancora presenti.
  - Le righe della tabella senza una data valida (intestazioni, totali) vengono ignorate.
  - **Solo i pagamenti diventano show**: il tipo di transazione (cella con il link al dettaglio) distingue "Pagamento da conto ricaricabile", "Ricarica con carta di credito" e "Rimborso su conto ricaricabile". Le ricariche vengono ignorate; i pagamenti in cui MCG mostra un codice numerico al posto della modella (profilo non più presente) vengono scartati.
  - **Rimborsi**: un rimborso non crea uno show ma segna come rimborsato il pagamento della stessa modella con lo stesso importo. Lo show rimborsato ha costo 0 € (con il simbolo ↩ e l'importo pagato nel tooltip), è escluso dal €/min e la nota riporta la data del rimborso. Un rimborso già applicato non viene riapplicato alle sincronizzazioni successive.
  - **Controllo della struttura**: se la pagina non contiene transazioni riconoscibili (link al dettaglio), l'importazione si ferma con un avviso e nessun dato viene salvato.
  - **Doppioni**: una transazione è già presente se esiste uno show della stessa modella alla stessa data e ora; in mancanza, se esiste uno show della stessa modella con lo stesso importo entro ±3 ore (copre show importati in passato con l'orario spostato). Ogni show dell'archivio corrisponde al massimo a una transazione.
- **📜 Cronologia completa MCG** (menu Dati): dopo il login legge tutte le pagine delle transazioni (`pagina_vis=1, 2, …`) invece della sola prima. Il passo tra le pagine viene ricavato dai link di paginazione della pagina. La lettura si ferma quando una pagina non contiene transazioni nuove (riconosciute dal codice della transazione), se MCG richiede di nuovo il login o dopo 300 pagine; l'avanzamento è mostrato nel titolo della finestra. Prima di salvare compare un riepilogo (pagine lette, show nuovi, rimborsi) da confermare. La sincronizzazione normale continua a leggere solo la prima pagina, che contiene le ultime 100 transazioni.
  - Foto, nickname e piattaforma dei nuovi show vengono presi dagli show precedenti della stessa modella.
  - **Link del profilo**: viene usato il link reale fornito da MCG nella tabella. Negli show già salvati, un indirizzo vuoto o indovinato dal nome viene sostituito con quello reale; un indirizzo diverso, inserito a mano, non viene toccato.
  - **Copia diagnostica**: a ogni sincronizzazione viene salvato `mcg_ultima_sincronizzazione.json` nella cartella dati, con le tabelle lette dalla pagina di MCG e l'esito di ogni riga (importata, già presente o scartata con il motivo). Il file viene sovrascritto ogni volta, resta solo sul computer e serve a capire la struttura della pagina se l'importazione non si comporta come previsto.
- **💾 Esportazione / Importazione Backup**: Ripristino e salvataggio dell'intero archivio in formato JSON, incluso il budget mensile. I backup delle versioni precedenti (solo elenco show) restano importabili; in quel caso il budget attuale non viene modificato.
- **🎨 Accessibilità e Temi**:
  - **Dimensione Testo**: Pulsanti `A+` / `A-` per modificare al volo la grandezza dei font (12px - 26px).
  - **Temi Visivi**: Selezione tra *Neve & Nebbia*, *Luce Chiara* ed *Eclissi Scura*. I colori di stato (budget, mese corrente, badge) sono definiti come variabili CSS per ogni tema in `style.css`.
  - **Font e icone in locale**: il font Inter e le icone Font Awesome sono inclusi tra le dipendenze (`@fontsource/inter`, `@fortawesome/fontawesome-free`), quindi l'interfaccia si vede correttamente anche offline.
- **📁 Gestione Cartella Dati**: Collegamento rapido alla cartella `userData` di sistema per consultare file JSON e log.

---

## 💾 Dati e Backup

I dati sono salvati nella cartella `userData` dell'applicazione (apribile dal pulsante **📁 Cartella Dati**):

| File | Contenuto |
| :--- | :--- |
| `shows_data.json` | Archivio degli show (array JSON). Scritto in modo atomico: un crash durante il salvataggio non lo lascia mai troncato. |
| `shows_data.bak.json` | Copia della versione precedente, aggiornata a ogni salvataggio o importazione. |
| `shows_data.corrotto-<timestamp>.json` | Copia di un archivio illeggibile, conservata invece di sovrascriverlo. |
| `app.log` | Log dell'applicazione, in ordine cronologico (righe più recenti in fondo). Oltre 1 MB diventa `app.log.1` e ne viene iniziato uno nuovo. |
| `window_state.json` | Dimensione e posizione della finestra. |
| `mcg_ultima_sincronizzazione.json` | Copia della tabella letta nell'ultima sincronizzazione MCG, con l'esito di ogni riga. |

Il budget mensile, il tema, la lingua e i filtri sono salvati nel `localStorage` dell'interfaccia.

Formato del file di backup esportato:

```json
{
  "formato": "gestioneshow-backup",
  "versione": 1,
  "versioneApp": "1.11.0",
  "shows": [ ... ],
  "impostazioni": { "monthly_budget": "300" }
}
```

---

## 🗂️ Struttura del Progetto

| Percorso | Ruolo |
| :--- | :--- |
| `main.js` | Processo principale Electron: ciclo di vita dell'app, finestre, menu e stato della finestra. Registra i gestori IPC di `main/`. |
| `main/ipc-dati.js` | Archivio degli show: lettura, salvataggio (con copia `.bak`), esportazione e importazione dei backup. |
| `main/ipc-sistema.js` | Versione, log, apertura di cartelle e link esterni, changelog e avviso "Novità". |
| `main/ipc-mcg.js` | Mondo Cam Girls: lettura delle transazioni con login, copia diagnostica, modelle online, foto, raggiungibilità. |
| `main/mcg-pagine.js` | Lettura pagina per pagina della cronologia transazioni di MCG. |
| `main/canali.js` | Nomi dei canali IPC tra interfaccia e processo principale. |
| `main/log.js`, `main/rete.js`, `main/file.js`, `main/percorsi.js` | Supporto: log, download e validazione degli URL MCG, scrittura atomica dei file, percorsi dei dati. |
| `tests/` | Test automatici (`npm test`), esclusi dalla build. |
| `preload.js` | Espone all'interfaccia le funzioni del processo principale (`window.electronAPI`). |
| `index.html`, `style.css`, `splash.html` | Pagina principale, stili e schermata di avvio. |
| `locales/` | Traduzioni `it.json` e `en.json`. |
| `changelog.json` | Novità per versione, mostrate nel modale *Novità e Changelog*. |
| `js/` | Codice dell'interfaccia, suddiviso in moduli (vedi sotto). |

I file di `js/` sono **moduli ES** (`import`/`export`): `index.html` carica solo `js/app.js` (`<script type="module">`), che importa gli altri. Lo stato condiviso tra i moduli è un unico oggetto `stato` (in `stato.js`), perché le variabili importate sono in sola lettura.

**Azioni dell'interfaccia.** L'HTML non contiene JavaScript (`onclick`, `onchange`, `onerror`…): gli elementi dichiarano un'azione con attributi `data-azione`, `data-al-cambio` o `data-al-input` (es. `<button data-azione="modifica-show" data-id="…">`), e `azioni.js` le esegue con un solo ascoltatore sul documento. La tabella di tutte le azioni è in `app.js` (`registraAzioni`). Se più elementi annidati hanno un'azione vince il più interno (es. la foto dentro una riga cliccabile).

**Content-Security-Policy.** `index.html` vieta script esterni e codice JavaScript scritto nell'HTML (`script-src 'self'`): un eventuale testo malevolo inserito in un campo non può eseguire codice. `splash.html` non permette script.

| Modulo | Contenuto |
| :--- | :--- |
| `logger.js` | Log a console, a file e nel pannello log. |
| `i18n.js` | Caricamento lingue e funzione `t()`. |
| `stato.js` | Stato condiviso: l'oggetto `stato` (archivio in memoria, filtri, pagina corrente, classifica…). |
| `azioni.js` | Esecuzione delle azioni dichiarate negli attributi `data-azione`/`data-al-cambio`/`data-al-input`, e sostituzione delle foto che non si caricano. |
| `utils.js` | Funzioni comuni: escape HTML, ID univoci, lettura delle date (anche formato italiano `gg/mm/aaaa`), normalizzazione dei record vecchi (`normalizzaShow`), formattazione importi, voti e durate, link esterni. |
| `calcoli.js` | Calcoli puri sugli show, senza accesso alla pagina: classifica, totali di una modella, statistiche per anno, budget, filtri e pagine della cronologia, mappe di foto e profili. Verificati dai test. |
| `righe-show.js` | Disegnatore unico delle righe degli show: ogni colonna (intestazione e cella) è definita una volta; cronologia, dettaglio del mese e scheda modella sono elenchi di colonne. |
| `archivio.js` | Archivio in memoria: letto da disco solo all'avvio e dopo un'importazione; aggiunte, modifiche ed eliminazioni salvano su disco e ridisegnano le viste senza rileggere il file. |
| `preferenze.js` | Schede, tema, dimensione font, budget, versione. |
| `galleria.js` | Lightbox e navigazione foto. |
| `form-show.js` | Form di inserimento/modifica, autocompilazione, eliminazione. |
| `dati.js` | Esportazione e importazione dei backup, apertura della cartella dati. |
| `cronologia.js` | Cronologia show, filtri e paginazione. |
| `statistiche.js` | Statistiche mensili e indicatori budget. |
| `classifica.js` | Classifica modelle. |
| `modale-modella.js` | Scheda dettaglio modella e foto da Mondo Cam Girls. |
| `sincronizzazione.js` | Importazione transazioni da Mondo Cam Girls. |
| `changelog.js` | Modale novità. |
| `stato-mcg.js` | Indicatore di raggiungibilità di Mondo Cam Girls. |
| `stato-online.js` | Modelle online su Mondo Cam Girls: badge e filtro in classifica e nella scheda. |
| `menu-header.js` | Menu a tendina Dati e Impostazioni dell'intestazione. |
| `app.js` | Punto di ingresso: importa i moduli, registra le azioni dell'interfaccia, collega l'archivio alle viste, avvia l'applicazione. |

---

## 🛠️ Requisiti e Installazione

1. Assicurati di aver installato [Node.js](https://nodejs.org/) (versione consigliata LTS).
2. Clona il repository ed entra nella directory del progetto:
   ```bash
   git clone https://github.com/blackcornercode/gestioneshow.git
   cd gestioneshow
   ```
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. Avvia l'applicazione con `npm start` (oppure con `AVVIA.bat` su Windows).
   > Se l'avvio dal terminale di VS Code fallisce con `Cannot read properties of undefined (reading 'getPath')`, è impostata la variabile d'ambiente `ELECTRON_RUN_AS_NODE`: rimuovila prima di lanciare l'app.
5. Per creare l'eseguibile portable per Windows:
   ```bash
   npm run dist
   ```
   Il file viene creato in `dist/GestioneShowMCG-<versione>-portable.exe`.
   Per una prova veloce senza creare l'eseguibile, `npm run pack` prepara solo la cartella `dist/win-unpacked/` (circa 10 secondi invece di quasi 2 minuti); l'app si avvia da `dist/win-unpacked/Gestione Show MCG.exe`.

### Test automatici
```bash
npm test
```
Esegue i test in `tests/` con il test runner integrato di Node (nessuna dipendenza aggiuntiva), in meno di un secondo:
- **funzioni dell'interfaccia** (`utils.js`, `calcoli.js`, `righe-show.js`, `archivio.js`, parte di `sincronizzazione.js`): date, normalizzazione dei record vecchi, €/min, voti, durate, importi e tipi delle transazioni MCG. I moduli ES di `js/` vengono importati in Node con sostituti minimi di `document` e `localStorage` (`js/package.json` indica a Node che sono moduli ES);
- **struttura dei moduli** (`moduli.test.js`): ogni nome importato esiste nel modulo di origine, ogni funzione di un altro modulo usata nel codice è importata, ogni azione usata nell'HTML è registrata in `app.js`, e l'HTML non contiene JavaScript inline;
- **funzioni del processo principale** (`main/rete.js`, `main/mcg-pagine.js`);
- **coerenza dei canali IPC**: ogni canale usato in `preload.js` deve essere definito in `main/canali.js` e avere un gestore registrato (il preload, in sandbox, non può importare `canali.js`).

`npm run dist` esegue automaticamente i test prima della build (`predist`): se un test fallisce, l'eseguibile non viene creato.

### Cosa include la build
La configurazione è nella sezione `build` di `package.json` ed è pensata per tenere l'eseguibile leggero:
- **Solo i file dell'app**: `files` elenca esplicitamente i file necessari (`main.js`, `preload.js`, pagine, stili, `js/`, `locales/`, `changelog.json`, icona). File di sviluppo come `.vscode/`, `AVVIA.bat` e `readme.md` restano fuori. Un nuovo file usato dall'app va aggiunto a questo elenco.
- **Dipendenze ridotte al necessario**: di Font Awesome vengono inclusi solo il CSS e i font `.woff2`; del font Inter solo i pesi usati (400, 500, 600, 700), senza corsivo e solo in formato `.woff2`.
- **Lingue di Chromium**: `electronLanguages` mantiene solo italiano e inglese invece di 55 lingue.

| | Prima | Dopo |
| :--- | ---: | ---: |
| Eseguibile portable | 106 MB | 93 MB |
| Codice e risorse dell'app (`app.asar`) | 25 MB, 3220 file | 2.4 MB |
| Lingue di Chromium | 49 MB | 1.3 MB |

La parte restante dell'eseguibile è il runtime di Electron, che non si può ridurre.
