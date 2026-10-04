<div align="center">

<img src="icon-neutra.png" width="96" alt="Diario Privato">

# Diario Privato

**Il tuo diario privato degli show: ogni incontro registrato, ogni euro sotto controllo, ogni modella al posto giusto in classifica.**

[![Versione](https://img.shields.io/badge/versione-1.12.3-6d2336)](https://github.com/blackcornercode/private-diary/releases)
![Piattaforma](https://img.shields.io/badge/piattaforma-Windows-0078d4)
[![Test](https://github.com/blackcornercode/private-diary/actions/workflows/test.yml/badge.svg)](https://github.com/blackcornercode/private-diary/actions/workflows/test.yml)
[![Licenza](https://img.shields.io/badge/licenza-ISC-c5a05a)](LICENSE)

[🇬🇧 English](README.md) · 🇮🇹 Italiano

<img src="docs/screenshot/cronologia.png" alt="Cronologia degli show" width="900">

</div>

## ✨ Funzioni

- 📝 **Registro degli show assistito**: mini-scheda della modella con i suoi dati, *ripeti ultimo show*, durate rapide, **€/min** calcolato mentre scrivi e confrontato con la tua media, voti colorati.
- 🏆 **Classifica delle modelle**: media voti, numero di show, tempo e spesa totali, €/min medio, e una scheda dettagliata per ogni modella.
- 🏷️ **Tag personalizzabili**: tag colorati per il tipo di show, filtri, modifica in blocco e riepilogo dei «tipi di show» di ogni modella.
- 📊 **Budget e grafici**: budget mensile con badge OK/KO, grafico della spesa per mese o per anno, dettaglio mese per mese.
- 🔄 **Sincronizzazione con Mondo Cam Girls**: importa le tue transazioni (rimborsi compresi) con il tuo login, mostra chi è **online**, segnala i profili **sospesi** o **rimossi**.
- 🔒 **Privacy prima di tutto**: PIN con blocco automatico, foto sfocate, nome e icona neutri della finestra («Agenda»), un tasto rapido personalizzabile per nascondere subito l'app.
- 🎨 **Quattro temi**, tra cui *Bordeaux & Oro* ispirato a mondocamgirls.com, dimensione del testo regolabile, interfaccia in italiano e in inglese.
- 💾 **I tuoi dati restano tuoi**: tutto è salvato sul tuo computer, con salvataggi sicuri, copie di backup automatiche ed esportazione/importazione in JSON.

## 📸 Screenshot

| Aggiungi / modifica show | Scheda della modella |
| :---: | :---: |
| <img src="docs/screenshot/form.png" width="430" alt="Form dello show"> | <img src="docs/screenshot/scheda-modella.png" width="430" alt="Scheda della modella"> |
| **Classifica** (tema scuro) | **Grafico della spesa e budget** |
| <img src="docs/screenshot/classifica.png" width="430" alt="Classifica"> | <img src="docs/screenshot/statistiche.png" width="430" alt="Statistiche"> |

<sub>Screenshot con dati dimostrativi inventati (`npm run screenshot`), interfaccia in inglese.</sub>

## ⬇️ Download

Dall'[ultima release](https://github.com/blackcornercode/private-diary/releases/latest) (Windows 10/11):
- **`PrivateDiary-<versione>-setup.exe`** (consigliato): installa l'app solo per il tuo utente, senza permessi di amministratore, con collegamenti nel menu Start e sul desktop. Disinstallandola i dati restano.
- **`PrivateDiary-<versione>-portable.exe`**: si avvia senza installazione.

### 🛡️ Se Windows o l'antivirus segnalano l'app

L'eseguibile non ha una firma digitale e, essendo nuovo, non ha ancora una «reputazione»: Windows SmartScreen e alcuni antivirus (per esempio AVG e Avast, con segnalazioni generiche come *IDP.ALEXA*) possono bloccarlo per prudenza. È un falso positivo:
- con SmartScreen scegli **Ulteriori informazioni › Esegui comunque**;
- per una verifica indipendente, carica il file su [VirusTotal](https://www.virustotal.com), che lo analizza con circa 70 antivirus;
- preferisci l'installer: la versione portable a ogni avvio si estrae in una cartella temporanea, un comportamento che alcuni antivirus giudicano sospetto;
- il codice è tutto in questo repository e puoi compilarlo da te (`npm run dist`).

## 🚀 Primi passi

1. **Registra il primo show** con **＋ Nuovo show**, oppure importa la tua cronologia da Mondo Cam Girls dal menu **💾 Dati**: **🔄 Sincronizza MCG** legge le ultime transazioni, **📜 Cronologia completa MCG** tutte le pagine.
2. **Imposta un budget mensile** in **Statistiche Mensili**: il badge accanto alla scheda ti dice a colpo d'occhio se lo stai rispettando.
3. **Proteggi l'app** da **⚙️ Impostazioni › 🔒 Privacy**: PIN, foto sfocate, nome neutro e tasto rapido per nasconderla (predefinito **Ctrl+Shift+H**).

La guida completa di tutte le funzioni è in [docs/GUIDA.md](docs/GUIDA.md).

## 🔐 I tuoi dati

- Show, tag e impostazioni sono salvati solo sul tuo computer, in `%APPDATA%\gestioneshow`.
- L'app comunica soltanto con **mondocamgirls.com**: per sapere quali modelle sono online, verificare i profili e caricarne le foto e, quando lo chiedi tu, per leggere le tue transazioni con il tuo login.
- Il PIN protegge l'app aperta, ma **non cifra i file dei dati**.

## 🛠️ Compilare dal codice

```bash
npm install
npm start          # avvia l'app
npm test           # test automatici
npm run dist       # installer ed eseguibile portable per Windows in dist/
```

Architettura, test e build: [docs/SVILUPPO.md](docs/SVILUPPO.md). Storia delle versioni: [CHANGELOG.md](CHANGELOG.md).

## ⚠️ Avvertenza

Diario Privato è un progetto indipendente e **non è affiliato, approvato né sponsorizzato da Mondo Cam Girls**; nomi e marchi appartengono ai rispettivi proprietari. L'app legge solo pagine che potresti aprire tu stesso, con il tuo account, e conserva tutto sul tuo computer. È pensata per un pubblico adulto (18+): usala nel rispetto dei termini dei siti che frequenti.

## ✉️ Contatti

Idee, segnalazioni o domande: **[blackcornermail@gmail.com](mailto:blackcornermail@gmail.com)**, oppure apri una [segnalazione](https://github.com/blackcornercode/private-diary/issues/new/choose). Nell'app: **? › ✉️ Contatti**.

## 📄 Licenza

[ISC](LICENSE) © 2026 The Black Corner
