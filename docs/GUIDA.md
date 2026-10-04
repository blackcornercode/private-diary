# 📔 Diario Privato: guida all'uso

Guida completa di tutte le funzioni dell'app. Per una presentazione rapida vedi il [README](../README.it.md); per architettura, test e build vedi [SVILUPPO.md](SVILUPPO.md).

## 📸 Caratteristiche Principali

- **Storicizzazione e Monitoraggio Show**: Registrazione dettagliata di ciascuna sessione con camgirl (data/ora, performer, piattaforma utilizzata, costi, valutazioni e recensioni).
- **Integrazione Mondo Cam Girls**: Sincronizzazione remota integrata per l'importazione automatica delle transazioni direttamente dall'area clienti web del sito Mondo Cam Girls.
- **Internazionalizzazione (i18n)**: Supporto nativo multilingua (Italiano 🇮🇹 ed Inglese 🇬🇧) con caricamento dinamico e persistenza della lingua selezionata.
- **Classifica Automatica Performer**: Elaborazione automatica delle metriche e delle valutazioni delle modella/camgirl in base a frequenza e punteggio medio.
- **Controllo Finanziario e Budget**: Monitoraggio della spesa mensile con soglie configurabili, avvisi di sforamento e barre di avanzamento grafiche.
- **Personalizzazione Visiva**: Supporto per temi multipli (*Neve & Nebbia*, *Luce Chiara*, *Eclissi Scura*, *Bordeaux & Oro*) e ridimensionamento dinamico del font.
- **Tag, privacy e grafici**: tag personalizzabili per il tipo di show, PIN di sblocco, foto sfocate, nome neutro e grafico della spesa.
- **Gestione Dati Integrata**: Backup e ripristino in formato JSON (archivio show e budget mensile), con filtri avanzati per anno, ricerca per nome e paginazione.

---

## 🚀 Sezioni e Navigazione

L'interfaccia si sviluppa in tre sezioni principali accessibili dalla barra superiore:

### 1. Form & Cronologia
Consente l'inserimento manuale, la modifica e la consultazione dell'archivio storico degli show.

Il form è chiuso di default per lasciare spazio alla cronologia: si apre con **＋ Nuovo show** oppure con il pulsante ✏️ (Modifica) di una riga. Dopo il salvataggio si richiude; chiudendolo durante una modifica, la modifica viene annullata, mentre una bozza di nuovo show resta compilata.

Il form segue l'ordine in cui si registra uno show:

| Parte | Descrizione |
| :--- | :--- |
| **Show / 🎁 Regalo** | Scelta in alto. Con «Regalo» spariscono piattaforma, voto e durata, che non valgono per i regali. |
| **Data e Ora** | Preimpostata all'ora attuale. Una data non valida blocca il salvataggio con un avviso. |
| **Nome Modella** | Con autocompletamento. Se la modella è già nell'archivio compare una **mini-scheda**: foto, numero di show, media voti, ultimo show (data, costo, durata, piattaforma), badge Online/Sospesa e tag usati più spesso. Il pulsante **↻ Ripeti ultimo show** compila durata, costo, tag e dettagli come nell'ultimo show con lei (data, voto, recensione e note restano da compilare). |
| **Durata** | Pulsanti rapidi 10/15/20/30/45/60 minuti oppure valore libero. Facoltativa: senza durata lo show resta fuori dal calcolo del €/min. |
| **Costo (€)** | Con il pulsante **= ultimo** per riusare il prezzo dell'ultimo show. Sotto compare subito il **€/min**, verde o rosso rispetto alla tua media. |
| **Valutazione** | Accanto al costo, con gli stessi badge colorati della cronologia (1-2 rosso, 3 ambra, 4 verde acqua, 5 verde, TBD grigio): quelli non scelti restano tenui. Un secondo clic sullo stesso voto lo toglie; senza voto lo show viene salvato come TBD. |
| **Recensione fatta** | Casella sotto il voto. |
| **Tag** | I tag usati di solito con la modella sono segnati con ☆ come suggerimento. |
| **Note** | Testo libero. |
| **Dettagli** | Sezione chiusa con piattaforma, nickname, link al profilo e URL della foto: si compilano da soli dall'ultimo show o da MCG; il titolo ne mostra il riepilogo. |

Il pulsante **🧹 Svuota** azzera in un colpo tutti i campi e lascia il form aperto (in modifica equivale ad annullare: i dati salvati non cambiano).

Scorciatoie: **Ctrl+Invio** salva, **Esc** chiude il form (in modifica equivale ad Annulla).

#### Funzionalità avanzate della Cronologia:
- **Paginazione Dinamica**: Selezione di vista a 5, 10, 20 elementi o elenco completo.
- **Filtri e Ricerca**: Filtro per anno (generato dinamicamente, con la casella **Seleziona tutti** che spunta o toglie tutti gli anni e appare parzialmente spuntata se ne sono scelti solo alcuni), filtro per tag e ricerca istantanea per testo.
- **Badge Origine**: Distinzione visiva tra record ad inserimento manuale (`👤`) o importati da MCG (`🤖 MCG`), mostrata accanto all'ora dello show.
- **Spazio per tag e note**: in tutte le tabelle degli show (cronologia, dettaglio del mese, scheda modella) data e ora stanno su due righe e la colonna **Tag e note** prende tutto lo spazio che avanza, quindi le note troncate si leggono molto di più.
- **Righe compatte**: Modifica (✏️) ed Elimina (🗑️) sono pulsanti a icona; nickname e note lunghi sono troncati con "…" e il testo completo compare al passaggio del mouse. Cliccando su una nota (o premendo Invio quando è selezionata) la si espande per leggerla tutta; un secondo clic la richiude. Se la finestra è stretta, la tabella scorre in orizzontale invece di tagliare le colonne.
- **Selezione multipla**: una casella all'inizio di ogni riga seleziona lo show; quella nell'intestazione seleziona l'intera pagina. La selezione resta valida cambiando pagina, ordine o filtri. Con almeno uno show selezionato compare una barra con il conteggio (e quanti selezionati sono nascosti dai filtri attuali) e i pulsanti:
  - **Seleziona tutti i risultati**: tutti gli show che passano i filtri, anche nelle altre pagine.
  - **✏️ Modifica selezionati**: piattaforma, voto, recensione, durata e nickname impostati in un colpo solo; i campi lasciati su «non modificare» restano invariati. Come nel form, piattaforma e voto non vengono applicati ai regali.
  - **🗑️ Elimina selezionati**: dopo una conferma che avvisa se tra i selezionati ci sono show nascosti dai filtri.
  
  Entrambe le operazioni salvano su disco una sola volta.
- **Costo al Minuto (€/min)**: Calcolato automaticamente come costo ÷ durata. Mostra `–` per gli show senza durata registrata e per i regali.
- **Colori con significato** (gli stessi in cronologia, scheda modella e dettaglio del mese):
  - **Voto**: badge verde (5), verde acqua (4), ambra (3), rosso (1-2); `TBD` in grigio.
  - **€/min**: verde se lo show è costato meno al minuto della tua media su tutti gli show, rosso se di più; entro ±10% dalla media resta neutro. Il valore della media compare passando il mouse.
  - **Dati mancanti e regali**: durata non registrata mostrata come `–` in grigio; costo e voto dei regali attenuati.
  - Tutte le coppie testo/sfondo rispettano il contrasto minimo WCAG di 4.5:1 in ogni tema, righe a zebra comprese.

#### 🏷️ Tag degli show
I tag indicano a colpo d'occhio il tipo di show (es. Anal, Lush, Squirt). Sono personalizzabili e ognuno ha un colore.
- **Nel form**: sotto le note, clic su un tag per assegnarlo o toglierlo; un tag nuovo si crea scrivendolo nel campo e premendo Invio o **＋ Aggiungi**.
- **Nelle tabelle**: per non allargare la tabella, i tag stanno nella colonna **Tag e note**, sopra la nota. Si vedono i primi tre tag e un «+N» per gli altri; il clic sulla cella mostra tutti i tag e la nota completa. Il tooltip elenca tutti i tag.
- **Filtro**: il menu **🏷️ Tag** della cronologia mostra solo gli show con quel tag.
- **Modifica multipla**: nella finestra della modifica dei selezionati, ogni clic su un tag passa da «non modificare» a **+ aggiungi**, a **− togli** e di nuovo a «non modificare». Utile per assegnare i tag agli show già salvati.
- **Scheda modella**: la riga **Tipi di show** riassume i tag degli show fatti con la modella, dal più usato, con il numero di volte (es. `Squirt ×5`).
- **⚙️ Impostazioni › 🏷️ Gestisci tag**: creazione, rinomina, colore ed eliminazione. Rinomina e colore valgono subito per tutti gli show che usano il tag; eliminandolo, dopo una conferma con il numero di show coinvolti, viene tolto anche da quegli show.

Al primo avvio il catalogo contiene tre tag di esempio (Anal, Lush, Squirt), modificabili o eliminabili.

---

### 2. Classifica Generale Modelle
Elabora la cronologia salvata per generare indicatori prestazionali e statistici sulle camgirl:

- **Podio Automatico**: Assegnazione visiva delle prime posizioni (🥇 1°, 🥈 2°, 🥉 3°) per le valutazioni più alte.
- **Media Voti**: Calcolo ponderato escludendo sessioni contrassegnate come regali o `TBD`.
- **€/min Medio**: Costo medio al minuto per modella, presente anche nella scheda dettaglio. È calcolato come spesa ÷ minuti dei soli show con durata registrata, regali esclusi, così gli show più vecchi senza durata non gonfiano il risultato.
- **Scheda Dettaglio (Modal)**: Cliccando su una riga si apre il resoconto storico dettagliato degli show effettuati con la singola modella.
- **Modelle online**: accanto al nome compare il badge verde **● Online** se la modella è online su Mondo Cam Girls (anche nella scheda dettaglio); il filtro **Solo online** mostra solo quelle. Lo stato si aggiorna all'avvio e ogni 3 minuti, leggendo l'elenco delle modelle online dal servizio pubblico del sito (`getdata.html?online=si`, senza login). La modella viene riconosciuta dall'indirizzo del suo profilo (`https://<nome>.mondocamgirls.com`): senza un indirizzo valido lo stato non è verificabile e il badge non compare. Se il sito non risponde, i badge non compaiono e l'errore viene annotato nel log.
- **Profili sospesi o rimossi**: accanto al nome (in classifica e nella scheda) compare il badge rosso **⛔ Sospesa** se il profilo su MCG è temporaneamente sospeso (la pagina mostra l'avviso «PROFILE TEMPORARYLY SUSPENDED»: non si possono acquistare show), oppure il badge grigio **🚫 Rimossa** se il profilo non esiste più (il suo sottodominio non esiste più, mentre il sito risponde). MCG non lo indica nell'elenco delle modelle, quindi l'app legge in background la pagina di ogni profilo, tre alla volta. L'esito di ogni profilo vale 12 ore ed è conservato tra un avvio e l'altro: si riverificano solo i profili controllati da più di 12 ore (all'avvio e poi ogni ora). Il tooltip del badge indica quando è stato verificato.

---

### 3. Statistiche Mensili e Budget
Fornisce il controllo finanziario sulle uscite e sui costi degli show:

- **Impostazione Budget**: Definisce la soglia massima di spesa mensile (€).
- **Riquadro apribile con stato sempre visibile**: il riquadro *Obiettivo e Budget Mensile* è chiuso e si apre con un clic sul titolo; accanto al titolo il badge **Budget OK** (verde), **Budget KO** (rosso) o **Non impostato** (grigio) mostra lo stato anche a riquadro chiuso, e il suo tooltip riporta spesa, budget e importo rimanente o sforato.
- **Avanzamento e Indicatori Dynamic**: Monitoraggio percentuale in tempo reale con avvisi cromatici e messaggi contestuali tradotti in base al superamento o rispetto del budget.
- **Grafico della spesa**: barre con la spesa di ogni mese dell'anno scelto (**Per mese**) o di ogni anno (**Per anno**), con totale, numero di show e media mensile o annua. Nella vista per mese, se è impostato un budget, una linea tratteggiata lo indica e i mesi oltre il budget sono in rosso; il mese o l'anno in corso è evidenziato. Passando il mouse su una barra si vedono spesa e numero di show. La vista scelta viene ricordata.
- **Visualizzazione Tabellare Dettagliata**: Prospetto dei 12 mesi con contatore degli show effettuati, totale speso e vista espandibile per singolo mese.

---

## 🔒 Privacy

Dal menu **⚙️ Impostazioni › 🔒 Privacy**:

- **Sfoca le foto**: le foto delle modelle (cronologia, classifica, scheda, galleria, foto ingrandita, mini-scheda del form) restano sfocate e tornano nitide solo passandoci sopra con il mouse.
- **Nome e icona neutri**: la finestra si chiama «Agenda» e usa un'icona generica (un calendario) nella barra delle applicazioni e in Alt+Tab; all'avvio non compare la schermata con il nome dell'app. L'icona del file eseguibile e dei collegamenti non cambia.
- **PIN di sblocco** (4-8 cifre): con un PIN l'app parte bloccata e si blocca con il **tasto rapido per nascondere l'app** (che la riduce anche a icona) e, se scelto, dopo 5/15/30/60 minuti di inattività. Dopo 5 tentativi errati bisogna attendere 30 secondi. Il PIN non viene salvato in chiaro (hash scrypt con sale in `preferenze.json`); per cambiarlo o rimuoverlo serve quello attuale. **Protegge l'app aperta, ma non cifra i file dei dati.** Se lo dimentichi, chiudi l'app ed elimina `preferenze.json` dalla cartella dei dati.
- **Tasto rapido per nascondere l'app** (predefinito **Ctrl+Shift+H**): riduce subito a icona l'app, e la blocca se c'è un PIN. Mentre è nascosta la finestra usa anche nome e icona neutri, pure con l'opzione spenta: tornano quelli veri alla riapertura o, con un PIN, dopo lo sblocco (l'impostazione salvata non cambia). Si cambia con **Cambia** premendo la nuova combinazione (Esc annulla) e si ripristina con ↺. Lettere e numeri richiedono Ctrl o Alt (con il solo Shift scatterebbe scrivendo una maiuscola); i tasti F1-F12 si possono usare anche da soli. Le combinazioni già usate dall'app o dal sistema (Ctrl+C/V/X/A/Z/Y, Ctrl+Invio, Alt+F4, F5…) vengono rifiutate. Il tasto viene riconosciuto per posizione, quindi funziona con qualsiasi layout di tastiera.

## ⚙️ Funzioni di Sistema e Utility

L'intestazione mostra sempre **🔄 Sincronizza MCG** e l'indicatore di raggiungibilità del sito. Le altre funzioni sono raccolte in due menu a tendina:
- **💾 Dati**: Esporta, Importa, Cartella.
- **⚙️ Impostazioni**: dimensione del testo, lingua, tema, gestione dei tag, privacy.

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
  - **Temi Visivi**: Selezione tra *Neve & Nebbia*, *Luce Chiara*, *Eclissi Scura* e *Bordeaux & Oro (MCG)*, con i colori di mondocamgirls.com (crema, bordeaux, oro). I colori di stato (budget, mese corrente, badge) sono definiti come variabili CSS per ogni tema in `style.css`.
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
| `tags.json` | Catalogo dei tag (`id`, `nome`, `colore`). Gli show salvano solo gli ID dei tag nel campo `tag`, quindi rinominare un tag non modifica l'archivio. |
| `window_state.json` | Dimensione e posizione della finestra. |
| `preferenze.json` | Preferenze di privacy: nome e icona neutri, PIN di sblocco (solo hash e sale), minuti del blocco automatico. |
| `mcg_ultima_sincronizzazione.json` | Copia della tabella letta nell'ultima sincronizzazione MCG, con l'esito di ogni riga. |

Il budget mensile, il tema, la lingua e i filtri sono salvati nel `localStorage` dell'interfaccia.

Formato del file di backup esportato:

```json
{
  "formato": "gestioneshow-backup",
  "versione": 1,
  "versioneApp": "1.12.2",
  "shows": [ ... ],
  "tag": [ { "id": "lush", "nome": "Lush", "colore": "viola" } ],
  "impostazioni": { "monthly_budget": "300" }
}
```

