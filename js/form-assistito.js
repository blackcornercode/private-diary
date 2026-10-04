import { chiaveModella, schedaRapidaModella } from './calcoli.js';
import { t } from './i18n.js';
import { badgeSospesa } from './profili-sospesi.js';
import { badgeOnline } from './stato-online.js';
import { stato } from './stato.js';
import { tagDaId, etichettaTag, impostaTagSuggeriti } from './tag.js';
import { escapeHtml, costoAlMinuto, formattaCostoAlMinuto } from './utils.js';

/* ==========================================================================
   FORM "AGGIUNGI / MODIFICA SHOW": PARTI ASSISTITE
   ==========================================================================
   I valori salvati restano nei campi di sempre (isRegalo, punteggio, durataShow,
   costo...), letti da form-show.js; qui ci sono i comandi che li impostano
   (tipo show/regalo, stelle, durate rapide) e le informazioni calcolate mentre
   si compila: €/min, mini-scheda della modella, riepilogo dei dettagli. */

const el = (id) => document.getElementById(id);
const euro = (valore) => `€ ${Number(valore).toFixed(2)}`;
let schedaCorrente = null;

/* --- Tipo: show o regalo --- */
export function impostaTipo(tipo) {
    const casella = el('isRegalo');
    if (casella) casella.checked = tipo === 'regalo';
}

// Pulsanti e campi visibili coerenti con la casella isRegalo (i campi .solo-show
// spariscono per i regali: style.css, .modalita-regalo)
export function aggiornaVistaTipo() {
    const regalo = Boolean(el('isRegalo')?.checked);
    document.querySelectorAll('[data-azione="tipo-show"]').forEach(btn => {
        const attivo = (btn.dataset.tipo === 'regalo') === regalo;
        btn.classList.toggle('attivo', attivo);
        btn.setAttribute('aria-pressed', String(attivo));
    });
    el('showForm')?.classList.toggle('modalita-regalo', regalo);
    aggiornaAnteprimaCostoMinuto();
    aggiornaRiepilogoDettagli();
}

/* --- Voto (badge come in cronologia): nessun voto = TBD al salvataggio --- */
export function cliccaVoto(pulsante) {
    const select = el('punteggio');
    if (!select) return;
    // Un secondo clic sullo stesso valore lo toglie
    select.value = select.value === pulsante.dataset.voto ? '' : pulsante.dataset.voto;
    aggiornaStelle();
}

export function aggiornaStelle() {
    const valore = el('punteggio')?.value || '';
    document.querySelectorAll('.scelta-voto [data-azione="voto-stelle"]').forEach(btn => {
        const scelto = btn.dataset.voto === valore;
        btn.classList.toggle('scelto', scelto);
        btn.setAttribute('aria-pressed', String(scelto));
    });
}

/* --- Durata rapida e €/min --- */
export function durataRapida(pulsante) {
    const campo = el('durataShow');
    if (campo) campo.value = pulsante.dataset.minuti;
    aggiornaAnteprimaCostoMinuto();
}

export function aggiornaAnteprimaCostoMinuto() {
    const durata = el('durataShow')?.value || '';
    document.querySelectorAll('[data-azione="durata-rapida"]').forEach(btn => btn.classList.toggle('attivo', btn.dataset.minuti === durata));

    const box = el('anteprimaCostoMinuto');
    if (!box) return;
    const valore = costoAlMinuto({
        costo: parseFloat(el('costo')?.value) || 0,
        durata: parseInt(durata, 10) || 0,
        isRegalo: Boolean(el('isRegalo')?.checked)
    });
    const riferimento = stato.costoMinutoRiferimento;
    box.innerHTML = valore === null ? '' :
        `${formattaCostoAlMinuto(valore)} ${escapeHtml(t('form.per_minute'))}` +
        (riferimento ? ` <span class="anteprima-media">(${escapeHtml(t('form.per_min_avg').replace('{media}', euro(riferimento)))})</span>` : '');
}

/* --- Mini-scheda della modella --- */
export function ultimoShowModella() {
    return schedaCorrente?.ultimoShow || null;
}

export function aggiornaMiniScheda() {
    const box = el('miniSchedaModella');
    const nome = el('nome')?.value.trim() || '';
    schedaCorrente = nome ? schedaRapidaModella(stato.tuttiGliShow, nome) : null;
    const ultimo = ultimoShowModella();
    const inModifica = Boolean(el('editId')?.value);

    // Tag usati di solito con lei, segnati nel selettore dei tag
    impostaTagSuggeriti(schedaCorrente?.tagFrequenti || []);
    const notaTag = el('notaTagSuggeriti');
    if (notaTag) notaTag.hidden = !schedaCorrente?.tagFrequenti.length;

    // "= ultimo": stesso costo dell'ultimo show con lei
    const btnCosto = el('btnCostoUltimo');
    if (btnCosto) {
        btnCosto.hidden = !(ultimo && ultimo.costo > 0);
        if (!btnCosto.hidden) btnCosto.textContent = t('form.cost_last').replace('{costo}', euro(ultimo.costo));
    }

    if (!box) return;
    if (!nome) {
        box.hidden = true;
        box.innerHTML = '';
        return;
    }
    box.hidden = false;
    if (!schedaCorrente) {
        box.innerHTML = `<span class="mini-scheda-nuova">${escapeHtml(t('form.mini_new'))}</span>`;
        return;
    }

    const foto = stato.mappaImmaginiModelle[chiaveModella(nome)] || '';
    const fotoHtml = foto
        ? `<img src="${escapeHtml(foto)}" class="thumb-img mini-scheda-foto" alt="" data-sostituto="${escapeHtml(t('table.no_photo'))}">`
        : `<div class="no-img mini-scheda-foto">${escapeHtml(t('table.no_photo'))}</div>`;
    const media = schedaCorrente.mediaTxt !== 'N/D' ? `${schedaCorrente.mediaTxt} / 5` : 'N/D';
    const ultimoHtml = ultimo ? escapeHtml(t('form.mini_last')
        .replace('{data}', (ultimo.dataFormattata || '').slice(0, 10))
        .replace('{costo}', euro(ultimo.costo || 0))
        .replace('{durata}', ultimo.durata ? `${ultimo.durata} min` : '–')
        .replace('{piattaforma}', ultimo.piattaforma || '–')) : '';
    const tagHtml = schedaCorrente.tagFrequenti.map(tagDaId).filter(Boolean).map(tag => etichettaTag(tag)).join('');

    box.innerHTML = `
        ${fotoHtml}
        <div class="mini-scheda-testo">
            <div><strong>${escapeHtml(t('form.mini_shows').replace('{n}', schedaCorrente.totaleShow))}</strong> · ${escapeHtml(t('form.mini_avg').replace('{media}', media))}${badgeOnline(nome)}${badgeSospesa(nome)}</div>
            ${ultimoHtml ? `<div class="mini-scheda-ultimo">${ultimoHtml}</div>` : ''}
            ${tagHtml ? `<div class="mini-scheda-tag">${tagHtml}</div>` : ''}
        </div>
        ${ultimo && !inModifica ? `<button type="button" class="btn-data mini-scheda-ripeti" data-azione="ripeti-ultimo-show" title="${escapeHtml(t('form.repeat_last_hint'))}">${escapeHtml(t('form.repeat_last'))}</button>` : ''}`;
}

/* --- Riepilogo della sezione "Dettagli" (chiusa) --- */
export function aggiornaRiepilogoDettagli() {
    const box = el('riepilogoDettagli');
    if (!box) return;
    const parti = [];
    if (!el('isRegalo')?.checked) parti.push(el('piattaforma')?.value || 'Teams');
    if (el('nickname')?.value.trim()) parti.push(el('nickname').value.trim());
    if (el('urlProfilo')?.value.trim()) parti.push(`🌐 ${t('form.details_profile')}`);
    if (el('immagine')?.value.trim()) parti.push(`🖼️ ${t('form.details_photo')}`);
    box.textContent = parti.join(' · ');
}

// Allinea tutte le parti assistite ai valori dei campi (dopo modifica, reset, autocompilazione)
export function sincronizzaFormAssistito() {
    aggiornaVistaTipo();
    aggiornaStelle();
    aggiornaAnteprimaCostoMinuto();
    aggiornaMiniScheda();
    aggiornaRiepilogoDettagli();
}
