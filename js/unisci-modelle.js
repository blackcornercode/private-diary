import { rinominaShowsModella } from './archivio.js';
import { chiaveModella, profiliPerSito, showsDiModella } from './calcoli.js';
import { t } from './i18n.js';
import { logger } from './logger.js';
import { apriModalModella } from './modale-modella.js';
import { siglaSito, sitoDaId } from './siti.js';
import { stato } from './stato.js';
import { escapeHtml } from './utils.js';

/* ==========================================================================
   UNISCI / SEPARA MODELLE (roadmap multi-sito, fase 4)
   ==========================================================================
   Le modelle sono riconosciute dal nome. Dalla scheda della modella:
   - Unisci: gli show registrati con un altro nome (la stessa persona su un
     altro sito, o un nome scritto diversamente) passano a questa modella;
   - Separa: gli show di un sito passano a un'altra modella (stesso nome,
     persone diverse).
   Ogni show ricorda il nome con cui è stato acquistato (nomeOriginale, vedi
   rinominaModella in calcoli.js): la sincronizzazione MCG non crea doppioni. */

const el = (id) => document.getElementById(id);
const testo = (chiave, valori = {}) =>
    Object.entries(valori).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), t(chiave));

// Modella della scheda e operazione in corso
let modella = '';
let modo = 'unisci';

export function apriUnisciModella(pulsante) {
    modella = pulsante.dataset.nome || '';
    modo = pulsante.dataset.modo === 'separa' ? 'separa' : 'unisci';
    if (!modella) return;

    el('titoloUnisciModella').textContent = testo(modo === 'unisci' ? 'models.merge_title' : 'models.split_title', { nome: modella });
    el('campiUnisciModella').hidden = modo !== 'unisci';
    el('campiSeparaModella').hidden = modo !== 'separa';

    if (modo === 'unisci') {
        const proprio = chiaveModella(modella);
        el('listaModelleUnisci').innerHTML = stato.elencoModelleUniche
            .filter(m => chiaveModella(m.nome) !== proprio)
            .map(m => `<option value="${escapeHtml(m.nome)}"></option>`).join('');
        el('altraModellaUnisci').value = '';
    } else {
        const profili = profiliPerSito(stato.tuttiGliShow, modella);
        el('sitoSepara').innerHTML = profili.map(p =>
            `<option value="${escapeHtml(p.sito)}">${escapeHtml(sitoDaId(p.sito)?.nome || p.sito)} (${p.totaleShow})</option>`).join('');
        // Di solito si separa il sito con meno show: il nome proposto è "Nome (SIGLA)"
        const ultimo = profili[profili.length - 1];
        if (ultimo) el('sitoSepara').value = ultimo.sito;
        el('nuovoNomeSepara').value = ultimo ? `${modella} (${siglaSito(ultimo.sito)})` : '';
    }
    aggiornaAnteprimaUnisci();
    el('modalUnisciModella').style.display = 'block';
    (modo === 'unisci' ? el('altraModellaUnisci') : el('nuovoNomeSepara')).focus();
}

export function chiudiUnisciModella() {
    const modal = el('modalUnisciModella');
    if (modal) modal.style.display = 'none';
}

// Al cambio del sito proposto si aggiorna anche il nome, se era quello suggerito
export function cambiaSitoSepara() {
    const campo = el('nuovoNomeSepara');
    if (/ \([^)]*\)$/.test(campo.value) || !campo.value.trim()) campo.value = `${modella} (${siglaSito(el('sitoSepara').value)})`;
    aggiornaAnteprimaUnisci();
}

// Cosa succederà: { da, a, sito, conteggio, messaggio, valido }
function operazione() {
    if (modo === 'unisci') {
        const da = el('altraModellaUnisci').value.trim();
        const conteggio = da ? showsDiModella(stato.tuttiGliShow, da).length : 0;
        if (!da) return { valido: false, messaggio: '' };
        if (chiaveModella(da) === chiaveModella(modella)) return { valido: false, messaggio: t('models.same_model') };
        if (!conteggio) return { valido: false, messaggio: t('models.not_found') };
        const nomeDa = stato.elencoModelleUniche.find(m => chiaveModella(m.nome) === chiaveModella(da))?.nome || da;
        return { valido: true, da: nomeDa, a: modella, sito: null, messaggio: testo('models.merge_preview', { n: conteggio, da: nomeDa, a: modella }) };
    }
    const sito = el('sitoSepara').value;
    const a = el('nuovoNomeSepara').value.trim();
    if (!a) return { valido: false, messaggio: '' };
    if (chiaveModella(a) === chiaveModella(modella)) return { valido: false, messaggio: t('models.same_model') };
    const conteggio = showsDiModella(stato.tuttiGliShow, modella).filter(s => s.sito === sito).length;
    const esistente = showsDiModella(stato.tuttiGliShow, a).length > 0;
    return {
        valido: conteggio > 0, da: modella, a, sito,
        messaggio: testo('models.split_preview', { n: conteggio, sito: sitoDaId(sito)?.nome || sito, da: modella, a })
            + (esistente ? ' ' + testo('models.joins_existing', { a }) : '')
    };
}

export function aggiornaAnteprimaUnisci() {
    const op = operazione();
    el('anteprimaUnisciModella').textContent = op.messaggio;
    el('btnConfermaUnisciModella').disabled = !op.valido;
}

export async function confermaUnisciModella() {
    const op = operazione();
    if (!op.valido) return;
    try {
        const modificati = await rinominaShowsModella(op.da, op.a, op.sito);
        logger.info(modo === 'unisci' ? 'Modelle unite' : 'Modella separata', `${op.da} -> ${op.a}${op.sito ? ` (${op.sito})` : ''}: ${modificati} show`);
        chiudiUnisciModella();
        // La scheda resta sulla modella da cui si è partiti, con i dati aggiornati
        await apriModalModella(modella);
    } catch (err) {
        logger.error('Unione/separazione delle modelle non riuscita', err);
        alert(`❌ ${err.message}`);
    }
}
