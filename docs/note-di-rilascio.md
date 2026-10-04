# Private Diary 1.12.3

## ⬇️ Download (Windows 10/11)

Negli *Assets* qui sotto:
- **`PrivateDiary-1.12.3-setup.exe`** (consigliato): installa l'app per il tuo utente, senza permessi di amministratore, con collegamenti nel menu Start e sul desktop.
- **`PrivateDiary-1.12.3-portable.exe`**: versione portable, da avviare senza installazione.

I dati delle versioni precedenti (anche di *Gestione Show MCG*) vengono letti automaticamente; disinstallando l'app i dati restano.

## 🛡️ Se Windows o l'antivirus segnalano l'app

L'eseguibile non ha una firma digitale e, essendo nuovo, non ha ancora una «reputazione»: alcuni antivirus (per esempio AVG e Avast, con segnalazioni generiche come *IDP.ALEXA*) e Windows SmartScreen possono bloccarlo per prudenza. È un falso positivo:
- con SmartScreen scegli **Ulteriori informazioni › Esegui comunque** (*More info › Run anyway*);
- se vuoi una verifica indipendente, carica il file su [VirusTotal](https://www.virustotal.com), che lo analizza con circa 70 antivirus;
- preferisci l'installer: la versione portable a ogni avvio si estrae in una cartella temporanea, un comportamento che alcuni antivirus giudicano sospetto;
- il codice è tutto in questo repository e puoi compilarlo da te (`npm run dist`).

## ✨ Novità

- Installer per Windows (PrivateDiary-setup.exe), per utente e senza permessi di amministratore, oltre alla versione portable; disinstallando l'app i dati restano

## 🎨 Interfaccia

- Sincronizza MCG e Cronologia completa MCG sono nel menu Dati, in una sezione evidenziata «Importa da Mondo Cam Girls», con una descrizione sotto ogni voce e un tooltip che spiega la differenza; il pulsante Sincronizza MCG non è più nell'intestazione

## 🛠️ Tecnico

- La versione portable si estrae sempre nella stessa cartella temporanea invece che in una con nome casuale, per ridurre i falsi positivi degli antivirus (es. AVG IDP.ALEXA); avviso con le istruzioni nei README e nelle note di rilascio

---
Storia completa: [CHANGELOG.md](https://github.com/blackcornercode/private-diary/blob/main/CHANGELOG.md) · Contatti: blackcornermail@gmail.com
