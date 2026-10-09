# Private Diary 2.0.0

## ⬇️ Download (Windows 10/11)

Negli *Assets* qui sotto:
- **`PrivateDiary-2.0.0-setup.exe`** (consigliato): installa l'app per il tuo utente, senza permessi di amministratore, con collegamenti nel menu Start e sul desktop.
- **`PrivateDiary-2.0.0-portable.exe`**: versione portable, da avviare senza installazione.

I dati delle versioni precedenti (anche di *Gestione Show MCG*) vengono letti automaticamente; disinstallando l'app i dati restano.

## 🛡️ Se Windows o l'antivirus segnalano l'app

L'eseguibile non ha una firma digitale e, essendo nuovo, non ha ancora una «reputazione»: alcuni antivirus (per esempio AVG e Avast, con segnalazioni generiche come *IDP.ALEXA*) e Windows SmartScreen possono bloccarlo per prudenza. È un falso positivo:
- con SmartScreen scegli **Ulteriori informazioni › Esegui comunque** (*More info › Run anyway*);
- se vuoi una verifica indipendente, carica il file su [VirusTotal](https://www.virustotal.com), che lo analizza con circa 70 antivirus;
- preferisci l'installer: la versione portable a ogni avvio si estrae in una cartella temporanea, un comportamento che alcuni antivirus giudicano sospetto;
- il codice è tutto in questo repository e puoi compilarlo da te (`npm run dist`).

## ✨ Novità

- Diario Privato diventa una cronologia per tutti i siti di cam, non solo per Mondo Cam Girls: ogni sito ha le sue impostazioni e Mondo Cam Girls resta integrato in automatico
- Ogni show indica il sito su cui è stato acquistato (Mondo Cam Girls, Chaturbate, Stripchat, BongaCams, LiveJasmin, OnlyFans o siti aggiunti da te): scelta nel form con l'ultimo sito usato con la modella già proposto, badge colorato sotto l'ora in tutte le tabelle, filtro per sito in cronologia e classifica, vista Per sito nel grafico della spesa e sito nella modifica multipla
- Impostazioni › Gestisci siti, per nome, sigla e colore di ogni sito, nuovi siti e sito predefinito per gli show nuovi
- Importazione da CSV dello storico degli acquisti di qualsiasi sito (menu Dati): colonne riconosciute dalle intestazioni, scelta di sito, valuta e formato della data, anteprima con lo stato di ogni riga e controllo dei doppioni
- Esportazione della cronologia in CSV, apribile con Excel e reimportabile
- Valuta e tasso in euro per ogni sito (euro, dollari, sterline, token, crediti): il costo resta in euro, l'importo pagato in token o dollari viene ricordato e nel form un campo lo converte da solo
- Siti in uso (Impostazioni › Gestisci siti): nel form compaiono solo i siti che usi, e le funzioni di Mondo Cam Girls (indicatore, importazione automatica, modelle online, profili sospesi, foto) si attivano solo se lo usi
- Al primo avvio, con l'archivio vuoto, una finestra di benvenuto chiede la lingua (proposta in base a quella di Windows), su quali siti acquisti gli show e qual è il sito principale
- Modelle su più siti: la scheda mostra il profilo della modella su ogni sito e una tabella con show, spesa, €/min e voti per sito; nel form l'indirizzo del profilo segue il sito scelto
- Unisci / Separa nella scheda della modella: unisci gli show registrati con un altro nome (la stessa modella su un altro sito) o separa gli show di un sito quando lo stesso nome indica persone diverse. La sincronizzazione con Mondo Cam Girls ricorda il nome originale e non crea doppioni
- Interfaccia anche in spagnolo, francese, tedesco, portoghese (Brasile), rumeno e russo, oltre a italiano e inglese; al primo avvio viene proposta la lingua di Windows se è tra queste, e anche l'installer parla la lingua del sistema (per il rumeno resta in inglese)

## 🎨 Interfaccia

- Form Aggiungi / Modifica show più leggibile: quattro sezioni con un titolo (Chi e quando, Lo show, Com'è andata, Tag e note), modella, sito e data sulla stessa riga, durata in una barra unica, costo al minuto in evidenza, voti, siti e tag con un contorno ben visibile finché non sono scelti, recensione con un interruttore, sezione Dettagli in un riquadro ben visibile con il riepilogo a pillole, barra dei pulsanti sempre visibile e, in modifica, una striscia che ricorda quale show stai modificando
- Sui siti che fanno pagare in token o in un'altra valuta il campo principale del costo è l'importo pagato, con l'equivalente in euro accanto; «inserisci in euro» permette di scrivere direttamente il costo in euro
- Sotto il titolo dell'app un sottotitolo riassume in una riga a cosa serve
- Il nickname di Teams indica cosa fa il clic: 💬 apre direttamente la chat (con l'email della modella), 📋 copia lo username e apre Teams per cercarlo; nel form una nota suggerisce di usare l'email per aprire la chat con un clic
- Testi generici al posto dei riferimenti a Mondo Cam Girls fuori dalla sua sezione (nome del tema Bordeaux & Oro, finestra Informazioni)
- Al primo avvio dopo l'installazione non compare la finestra delle novità, ma solo il benvenuto

## 🐛 Correzioni

- «Nessun anno disponibile» nel filtro per anno restava in italiano con l'interfaccia in inglese
- Scrivendo nel form il nome di una modella nuova che inizia come quello di una già registrata (es. «Annabella» dopo «Anna»), profilo, foto e nickname della prima restavano nei Dettagli e venivano salvati nello show; ora i valori compilati da soli seguono il nome, quelli scritti a mano restano
- Eliminando tutti gli show dell'anno scelto nel filtro, la cronologia restava vuota senza nessuna casella da togliere; ora l'anno esce da solo dal filtro
- Aprendo di seguito le schede di due modelle, la galleria della seconda poteva mostrare le foto della prima; se il recupero delle foto falliva restava «Caricamento…» per sempre
- Nella mini-scheda del form la data dell'ultimo show importato da Mondo Cam Girls compariva tagliata (es. «02/10/26 1»)
- Con l'interfaccia in inglese restavano in italiano la riga dei totali sotto la cronologia, il giorno della settimana accanto alla data e i tooltip di Modifica, Elimina, foto e profilo web

## 🛠️ Tecnico

- Primo passo verso il supporto a più siti di cam (docs/ROADMAP.md, fase 1): ogni show ricorda il sito di provenienza (per gli show esistenti Mondo Cam Girls) e da quale sito è stato importato; nuovo catalogo dei siti incluso nel backup (formato versione 2, i backup precedenti restano importabili)
- All'avvio della 2.0 una copia dell'archivio delle versioni precedenti viene salvata in shows_data.prima-2.0.json prima della conversione al nuovo formato
- Il codice che contatta Mondo Cam Girls diventa il primo «connettore» (docs/ROADMAP.md, fase 3): ogni sito dichiara le funzioni che offre (importazione, modelle online, profili sospesi, foto, raggiungibilità) e badge, galleria e indicatore compaiono solo per i siti che le supportano. Nessun cambiamento per chi usa Mondo Cam Girls

---
Storia completa: [CHANGELOG.md](https://github.com/blackcornercode/private-diary/blob/main/CHANGELOG.md) · Contatti: blackcornermail@gmail.com
