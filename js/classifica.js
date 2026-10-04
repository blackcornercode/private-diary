import { calcolaClassifica } from './calcoli.js';
import { t } from './i18n.js';
import { getPiattaformaFormatted } from './righe-show.js';
import { badgeSospesa } from './profili-sospesi.js';
import { eModellaOnline, badgeOnline } from './stato-online.js';
import { stato } from './stato.js';
import { escapeHtml, formattaCostoAlMinuto, formattaDurata } from './utils.js';

/* ==========================================================================
   CLASSIFICA MODELLE E MEDIE
   ========================================================================== */
export function caricaMedieEStoricizzazione(shows) {
    if (!document.getElementById('listaMedie')) return;

    // Ordinamento: 1° media voti, 2° numero di show (vedi calcolaClassifica in calcoli.js)
    stato.classificaCompletaCache = calcolaClassifica(shows, { immagini: stato.mappaImmaginiModelle, url: stato.mappaUrlModelle });

    mostraClassifica(stato.classificaCompletaCache);
    aggiornaLegendaMediaMinuto();
}

// Nella legenda dei colori mostra il valore attuale della media €/min di riferimento
export function aggiornaLegendaMediaMinuto() {
    const elem = document.getElementById('legendaMediaMinuto');
    if (!elem) return;
    elem.textContent = stato.costoMinutoRiferimento
        ? t('ranking.colors_your_avg').replace('{media}', `€ ${stato.costoMinutoRiferimento.toFixed(2)}`)
        : '';
}

export function mostraClassifica(lista) {
    const listaMedie = document.getElementById('listaMedie');
    if (!listaMedie) return;
    listaMedie.innerHTML = '';

    const fragment = document.createDocumentFragment();

    lista.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'cliccabile';
        tr.dataset.azione = 'apri-scheda-modella';
        tr.dataset.nome = item.nome;

        const imgHtml = item.foto 
            ? `<img src="${escapeHtml(item.foto)}" class="thumb-img" alt="foto" data-azione="ingrandisci-foto" data-url="${escapeHtml(item.foto)}" data-sostituto="${escapeHtml(t('table.no_photo'))}">`
            : `<div class="no-img">${escapeHtml(t('table.no_photo'))}</div>`;

        const linkWebHtml = item.urlProfilo 
            ? `<a href="#" class="link-web link-profilo" title="Profilo Web" aria-label="Profilo Web" data-azione="apri-link" data-url="${escapeHtml(item.urlProfilo)}">🌐</a>`
            : `-`;

        // Stesso formato della cronologia: piattaforma e, sotto, il nickname
        // (su una sola riga le email lunghe allargavano la tabella oltre lo schermo)
        const piattaformaHtml = item.piattaformaPrevalente
            ? getPiattaformaFormatted({ piattaforma: item.piattaformaPrevalente, nickname: item.nicknamePrevalente })
            : '-';

        // Calcolo/Formattazione del tempo totale accumulato
        const tempoTotaleTxt = formattaDurata(item.totaleDurata);

        tr.innerHTML = `
            <td class="col-centro col-grassetto">#${item.posizioneOriginale || (index + 1)}</td>
            <td>${imgHtml}</td>
            <td><strong>${escapeHtml(item.nome)}</strong>${badgeOnline(item.nome)}${badgeSospesa(item.nome)}</td>
            <td class="col-centro">${linkWebHtml}</td>
            <td>${piattaformaHtml}</td>
            <td class="col-centro">${item.totaleShow}</td>
            <td class="col-nowrap col-centro col-grassetto">${tempoTotaleTxt}</td>
            <td class="col-nowrap col-centro col-grassetto">€ ${item.spesaTotale.toFixed(2)}</td>
            <td class="col-nowrap col-centro" title="${escapeHtml(t('table.cost_per_minute_hint'))}">${formattaCostoAlMinuto(item.costoMedioMinuto)}</td>
            <td class="voto-medio">${item.mediaTxt}</td>
        `;
        fragment.appendChild(tr);
    });

    listaMedie.appendChild(fragment);
}

export function filtraClassificaModelle() {
    const input = document.getElementById('searchModellaClassifica');
    if (!input) return;
    const filtro = input.value.trim().toLowerCase();
    const soloOnline = Boolean(document.getElementById('filtroSoloOnline')?.checked);

    const filtrati = stato.classificaCompletaCache.filter(m =>
        m.nome.toLowerCase().includes(filtro) && (!soloOnline || eModellaOnline(m.nome) === true));
    mostraClassifica(filtrati);
}
