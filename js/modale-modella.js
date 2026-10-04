import { chiaveModella, showsDiModella, riepilogoShow, conteggioTag } from './calcoli.js';
import { apriModalImmagine } from './galleria.js';
import { t } from './i18n.js';
import { COLONNE_SCHEDA, intestazioneShow, righeShow } from './righe-show.js';
import { badgeSospesa } from './profili-sospesi.js';
import { badgeOnline } from './stato-online.js';
import { stato } from './stato.js';
import { tagDaId, etichettaTag } from './tag.js';
import { escapeHtml, urlProfiloPredefinito, formattaCostoAlMinuto, formattaDurata } from './utils.js';

/* ==========================================================================
   MODALE DETTAGLIO MODELLA E FOTO DINAMICHE
   ========================================================================== */
export async function apriModalModella(nomeModella) {
    const modal = document.getElementById('modalModella');
    const header = document.getElementById('modalHeader');
    const listaBody = document.getElementById('modalListaShow');

    if (!modal || !header || !listaBody) return;

    // Serve all'aggiornamento periodico del badge "Online" a scheda aperta
    modal.dataset.nomeModella = nomeModella;

    // Stessi totali della classifica (riepilogoShow in calcoli.js)
    const showsModella = showsDiModella(stato.tuttiGliShow, nomeModella);
    const riepilogo = riepilogoShow(showsModella);

    const chiave = chiaveModella(nomeModella);
    const fotoProfilo = stato.mappaImmaginiModelle[chiave] || (showsModella.find(s => s.immagine) || {}).immagine || '';
    const urlProfilo = stato.mappaUrlModelle[chiave] || (showsModella.find(s => s.urlProfilo) || {}).urlProfilo || '';

    const imgProfiloHtml = fotoProfilo
        ? `<img src="${escapeHtml(fotoProfilo)}" alt="${escapeHtml(nomeModella)}" class="modella-avatar" data-azione="ingrandisci-foto" data-url="${escapeHtml(fotoProfilo)}">`
        : `<div class="modella-avatar modella-avatar-vuoto">👤</div>`;

    // Riquadro statistico: etichetta sopra, valore sotto, entrambi senza andare a capo
    const statBox = (etichetta, valore, extra = '') =>
        `<div class="stat-box"${extra}><span class="stat-box-etichetta">${escapeHtml(etichetta)}</span><strong class="stat-box-valore">${valore}</strong></div>`;

    const urlHtml = urlProfilo
        ? `<a href="#" class="modella-url" title="${escapeHtml(urlProfilo)}" data-azione="apri-link" data-url="${escapeHtml(urlProfilo)}">🌐 ${escapeHtml(urlProfilo)}</a>`
        : `<span class="modella-url modella-url-vuoto">${escapeHtml(t('modal.no_website'))}</span>`;

    // Tipi di show proposti dalla modella: i suoi tag, dal più usato
    const tipiShow = conteggioTag(showsModella)
        .map(({ id, conteggio }) => ({ tag: tagDaId(id), conteggio }))
        .filter(({ tag }) => tag);
    const tipiShowHtml = tipiShow.length
        ? `<div class="modella-tipi-show"><span class="modella-tipi-etichetta">${escapeHtml(t('tags.show_types'))}</span>
            ${tipiShow.map(({ tag, conteggio }) => etichettaTag(tag, '', ` ×${conteggio}`)).join('')}</div>`
        : '';

    // Tutto su una riga: avatar | nome e sito (troncati con "…" se serve) | statistiche
    header.innerHTML = `
        <div class="modella-header-card">
            ${imgProfiloHtml}
            <div class="modella-info-main">
                <h2 class="modella-nome" title="${escapeHtml(nomeModella)}">${escapeHtml(nomeModella)}<span id="badgeOnlineScheda">${badgeOnline(nomeModella)}${badgeSospesa(nomeModella)}</span></h2>
                ${urlHtml}
            </div>
            <div class="modella-stats-summary">
                ${statBox(t('table.total_shows'), riepilogo.totaleShow)}
                ${statBox(t('table.total_duration'), formattaDurata(riepilogo.totaleDurata))}
                ${statBox(t('table.total_spent'), `€ ${riepilogo.spesaTotale.toFixed(2)}`)}
                ${statBox(t('table.avg_cost_per_minute'), formattaCostoAlMinuto(riepilogo.costoMedioMinuto), ` title="${escapeHtml(t('table.cost_per_minute_hint'))}"`)}
                ${statBox(t('table.avg_rating'), `<span class="voto-medio">${riepilogo.mediaTxt !== 'N/D' ? riepilogo.mediaTxt + ' / 5' : 'N/D'}</span>`)}
            </div>
        </div>
        ${tipiShowHtml}
    `;

    caricaFotoDinamicheModella(nomeModella, stato.mappaUrlModelle);

    const intestazione = document.getElementById('intestazioneScheda');
    if (intestazione) intestazione.innerHTML = intestazioneShow(COLONNE_SCHEDA);
    listaBody.innerHTML = righeShow(showsModella, COLONNE_SCHEDA);

    modal.style.display = 'block';
}

export function chiudiModalModella() {
    const modal = document.getElementById('modalModella');
    if (modal) modal.style.display = 'none';
}

// Aggiorna i badge "Online" e "Sospesa" della scheda, se è aperta
export function aggiornaBadgeSchedaModella() {
    const modal = document.getElementById('modalModella');
    const span = document.getElementById('badgeOnlineScheda');
    if (!modal || !span || modal.style.display !== 'block') return;
    span.innerHTML = badgeOnline(modal.dataset.nomeModella) + badgeSospesa(modal.dataset.nomeModella);
}

export async function caricaFotoDinamicheModella(nomeChiave, mappaUrl) {
    const contenitoreFoto = document.getElementById('contenitoreFotoDinamiche');
    if (!contenitoreFoto) return;

    contenitoreFoto.innerHTML = `<span class="galleria-messaggio">${escapeHtml(t('modal.loading_photos_mcg'))}</span>`;

    let rawUrl = mappaUrl[nomeChiave.trim().toLowerCase()] || urlProfiloPredefinito(nomeChiave);
    let profileUrl = rawUrl.replace(/\/+$/, '');
    let targetUrlFoto = `${profileUrl}/?pag=0#mp-foto`;

    if (window.electronAPI && window.electronAPI.fetchModellaFoto) {
        const result = await window.electronAPI.fetchModellaFoto(profileUrl);

        if (result.success && result.images && result.images.length > 0) {
            contenitoreFoto.innerHTML = '';
            result.images.forEach((imgUrl, index) => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = t('modal.photo_alt');
                img.className = 'galleria-miniatura';
                img.title = t('modal.click_to_enlarge');
                

                img.onclick = () => apriModalImmagine(imgUrl, result.images, index);

                contenitoreFoto.appendChild(img);
            });
        } else {
            const targetUrlHtml = `<a href="#" class="link-web link-sottolineato" data-azione="apri-link" data-url="${escapeHtml(targetUrlFoto)}">${escapeHtml(targetUrlFoto)}</a>`;
            
            contenitoreFoto.innerHTML = `
                <div class="galleria-messaggio">
                    ${escapeHtml(t('modal.no_photos'))} <br>
                    ${targetUrlHtml}
                </div>
            `;
        }
    } else {
        contenitoreFoto.innerHTML = `<span class="galleria-messaggio">${escapeHtml(t('modal.photos_unavailable'))}</span>`;
    }
}
