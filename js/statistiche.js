import { anniDisponibili, calcolaStatisticheAnno, spesaMeseCorrente, statoBudget } from './calcoli.js';
import { t } from './i18n.js';
import { COLONNE_DETTAGLIO_MESE, intestazioneShow, righeShow } from './righe-show.js';
import { stato } from './stato.js';

/* ==========================================================================
   STATISTICHE MENSILI PER ANNO E DETTAGLIO MESI CLICCABILI
   ========================================================================== */
export function popolaSelettoreAnni(dati) {
    const selectAnno = document.getElementById('selezionaAnnoStatistiche');
    if (!selectAnno) return;

    const anniOrdinati = anniDisponibili(dati);
    if (anniOrdinati.length === 0) anniOrdinati.push(new Date().getFullYear());

    const annoSelezionatoCorrente = selectAnno.value;

    selectAnno.innerHTML = '';
    anniOrdinati.forEach(anno => {
        const option = document.createElement('option');
        option.value = anno;
        option.textContent = anno;
        selectAnno.appendChild(option);
    });

    if (annoSelezionatoCorrente && anniOrdinati.includes(parseInt(annoSelezionatoCorrente))) {
        selectAnno.value = annoSelezionatoCorrente;
    } else {
        selectAnno.value = anniOrdinati[0];
    }
}

export function aggiornaStatisticheMensili() {
    stato.meseSelezionatoDettaglio = null;
    caricaStatisticheMensili(stato.tuttiGliShow);
}

export function selezionaMeseDettaglio(idxMese) {
    stato.meseSelezionatoDettaglio = (stato.meseSelezionatoDettaglio === idxMese) ? null : idxMese;
    caricaStatisticheMensili(stato.tuttiGliShow);
}

export const budgetMensile = () => parseFloat(localStorage.getItem('monthly_budget')) || 0;

// Riquadro "Obiettivo e Budget Mensile": spesa del mese corrente rispetto al budget
export function aggiornaRiquadroBudget(shows) {
    const budgetStatusText = document.getElementById('budgetStatusText');
    const budgetRemainingText = document.getElementById('budgetRemainingText');
    const progressBar = document.getElementById('progressBar');
    if (!budgetStatusText || !budgetRemainingText || !progressBar) return;

    const spesa = spesaMeseCorrente(shows);
    const budget = budgetMensile();
    const esitoBudget = statoBudget(spesa, budget);

    budgetStatusText.textContent = `${t('stats.current_month_spent')}: € ${spesa.toFixed(2)} / € ${budget.toFixed(2)}`;
    progressBar.style.width = `${esitoBudget.percentuale}%`;
    if (!esitoBudget.impostato) {
        budgetRemainingText.textContent = t('budget.not_set_badge');
    } else if (esitoBudget.differenza >= 0) {
        budgetRemainingText.textContent = `${t('budget.remaining')}: € ${esitoBudget.differenza.toFixed(2)}`;
    } else {
        budgetRemainingText.textContent = `${t('budget.exceeded_by')}: € ${Math.abs(esitoBudget.differenza).toFixed(2)}`;
    }
    // I colori vengono dalle classi stato-* (definite per ogni tema in style.css)
    budgetRemainingText.className = esitoBudget.stato;
    progressBar.className = esitoBudget.stato;
}

export function caricaStatisticheMensili(shows) {
    const sezioneStatistiche = document.getElementById('sezioneStatistiche');
    const selectAnno = document.getElementById('selezionaAnnoStatistiche');
    if (!sezioneStatistiche) return;

    if (selectAnno && selectAnno.options.length === 0) popolaSelettoreAnni(shows);

    const oggi = new Date();
    const annoSelezionato = (selectAnno && parseInt(selectAnno.value)) || oggi.getFullYear();
    const { spesa, conteggio, showPerMese } = calcolaStatisticheAnno(shows, annoSelezionato);

    aggiornaRiquadroBudget(shows);

    const mesi = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(m => t(`months.${m}`));

    const righeMesi = mesi.map((nomeMese, idx) => {
        const isAttivo = (stato.meseSelezionatoDettaglio === idx);
        const haShow = conteggio[idx] > 0;
        const eMeseCorrente = (idx === oggi.getMonth() && annoSelezionato === oggi.getFullYear());

        const classiTr = [
            haShow ? 'riga-mese-cliccabile' : 'riga-mese-vuota',
            eMeseCorrente ? 'riga-mese-corrente' : (isAttivo ? 'riga-mese-attiva' : '')
        ].filter(Boolean).join(' ');

        const tooltipText = haShow ? t('stats.click_details') : t('stats.no_shows_month');

        return `
            <tr class="${classiTr}" ${haShow ? `data-azione="seleziona-mese" data-mese="${idx}"` : ''} title="${tooltipText}">
                <td><strong>${haShow ? (isAttivo ? '🔽 ' : '▶ ') : ''}${nomeMese} ${eMeseCorrente ? `📌 (${t('stats.current')})` : ''}</strong></td>
                <td class="col-centro">${conteggio[idx]}</td>
                <td class="spesa-mese col-destra col-grassetto">€ ${spesa[idx].toFixed(2)}</td>
            </tr>`;
    }).join('');

    let html = `
        <table class="table-container tabella-mesi">
            <thead>
                <tr>
                    <th>${t('stats.month')} (${annoSelezionato})</th>
                    <th class="col-centro">${t('stats.shows_done')}</th>
                    <th class="col-destra">${t('stats.total_spent')}</th>
                </tr>
            </thead>
            <tbody>${righeMesi}</tbody>
        </table>
    `;

    if (stato.meseSelezionatoDettaglio !== null && showPerMese[stato.meseSelezionatoDettaglio]) {
        const elencoShowMese = showPerMese[stato.meseSelezionatoDettaglio];
        html += `
            <div class="dettaglio-mese">
                <div class="dettaglio-mese-intestazione">
                    <h3>${t('stats.shows_done')} - ${mesi[stato.meseSelezionatoDettaglio]} ${annoSelezionato} (${elencoShowMese.length})</h3>
                    <button class="btn-chiudi-dettaglio" data-azione="seleziona-mese" data-mese="">✖ ${t('actions.close_details')}</button>
                </div>
                <table class="tabella-dettaglio-mese">
                    <thead>${intestazioneShow(COLONNE_DETTAGLIO_MESE)}</thead>
                    <tbody>${righeShow(elencoShowMese, COLONNE_DETTAGLIO_MESE)}</tbody>
                </table>
            </div>
        `;
    }

    sezioneStatistiche.innerHTML = html;
}

// Badge "Budget OK/KO" accanto alla scheda Statistiche
export function aggiornaIndicatoreBudgetHomepage(shows) {
    const navBadge = document.getElementById('navBudgetBadge');
    if (!navBadge) return;

    const esitoBudget = statoBudget(spesaMeseCorrente(shows), budgetMensile());
    if (!esitoBudget.impostato) {
        navBadge.style.display = 'none';
        return;
    }
    const rispettato = esitoBudget.stato === 'stato-ok';
    navBadge.style.display = 'inline-block';
    navBadge.textContent = rispettato ? 'Budget OK' : 'Budget KO';
    navBadge.className = `nav-badge ${esitoBudget.stato}`;
}
