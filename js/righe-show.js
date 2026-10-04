/* ==========================================================================
   RIGHE DEGLI SHOW (disegnatore unico)
   ==========================================================================
   Ogni colonna è definita una volta sola (intestazione + cella). Cronologia,
   dettaglio del mese e scheda modella sono elenchi di colonne: per aggiungere
   o cambiare una colonna basta intervenire qui. */

// Piattaforma con icona e, sotto, il nickname (link alla chat se disponibile).
// Usata anche dalla classifica.
function getPiattaformaFormatted(show) {
    if (show.isRegalo) {
        return `<span class="badge-regalo">${escapeHtml(t('form.gift'))}</span>`;
    }

    const nomePiattaforma = show.piattaforma || 'Teams';
    const iconaHtml = iconePiattaformaHTML[nomePiattaforma] || `<i class="fa-solid fa-globe"></i> ${escapeHtml(nomePiattaforma)}`;

    if (show.nickname) {
        // I nickname sono spesso email lunghe: troncati con "…", completi nel tooltip
        const nick = escapeHtml(show.nickname);
        const urlChat = generaLinkChat(nomePiattaforma, show.nickname);
        const nickHtml = urlChat
            ? `<a href="#" class="link-web nick-troncato nick-chat" title="${nick}" onclick="apriLinkEsterno(event, ${argJs(urlChat)})">💬 ${nick}</a>`
            : `<small class="nick-troncato" title="${nick}">${nick}</small>`;
        return `<div class="piattaforma-con-nick">
            <span>${iconaHtml}</span>
            ${nickHtml}
        </div>`;
    }

    return iconaHtml;
}

function cellaFoto(show) {
    const fotoUrl = show.immagine || mappaImmaginiModelle[chiaveModella(show.nome)] || '';
    const senzaFoto = `<div class="no-img">${escapeHtml(t('table.no_photo'))}</div>`;
    if (!fotoUrl) return `<td>${senzaFoto}</td>`;
    // In caso di errore di caricamento l'immagine viene sostituita dal riquadro "No Foto"
    return `<td><img src="${escapeHtml(fotoUrl)}" class="thumb-img cliccabile" alt="foto" title="Clicca per ingrandire"
        onclick="event.stopPropagation(); apriModalImmagine(${argJs(fotoUrl)})" onerror="this.outerHTML=${escapeHtml(JSON.stringify(senzaFoto))}"></td>`;
}

// chiave: [chiave della traduzione dell'intestazione, classe dell'intestazione, cella]
const COLONNE_SHOW = {
    foto:          ['table.photo', '', cellaFoto],
    data:          ['table.date', '', s => `<td class="col-nowrap">${escapeHtml(s.dataFormattata)}</td>`],
    nome:          ['table.name', '', s => `<td><strong>${escapeHtml(s.nome)}</strong></td>`],
    nomeCliccabile:['table.name', '', s => `<td><strong class="cliccabile" onclick="apriModalModella(${argJs(s.nome)})">${escapeHtml(s.nome)}</strong></td>`],
    piattaforma:   ['table.platform', '', s => `<td>${getPiattaformaFormatted(s)}</td>`],
    durata:        ['table.duration', 'col-centro', s => `<td class="col-nowrap col-centro col-grassetto">${formattaDurata(s.durata)}</td>`],
    costo:         ['table.cost', '', s => cellaCosto(s)],
    costoMinuto:   ['table.cost_per_minute', 'col-centro', s => `<td class="col-nowrap col-centro">${formattaCostoAlMinuto(costoAlMinuto(s))}</td>`],
    voto:          ['table.rating', '', s => `<td class="col-nowrap">${formattaVoto(s)}</td>`],
    origine:       ['table.source', '', s => `<td>${s.isAutoImport
                        ? '<span class="badge-origine auto" title="Auto MCG">🤖 MCG</span>'
                        : '<span class="badge-origine manuale" title="Manuale">👤</span>'}</td>`],
    recensione:    ['table.review', 'col-centro', s => `<td class="col-centro">${s.recensione ? '✅' : '❌'}</td>`],
    note:          ['table.notes', '', s => cellaNote(s.note)],
    azioni:        ['table.actions', '', s => `<td class="col-azioni">
                        <button class="btn-edit" title="Modifica" aria-label="Modifica" onclick="modificaShow(${argJs(s.id)})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" title="Elimina" aria-label="Elimina" onclick="eliminaShow(${argJs(s.id)})"><i class="fa-solid fa-trash"></i></button>
                    </td>`]
};

const COLONNE_CRONOLOGIA = ['foto', 'data', 'nome', 'piattaforma', 'durata', 'costo', 'costoMinuto', 'voto', 'origine', 'recensione', 'note', 'azioni'];
const COLONNE_DETTAGLIO_MESE = ['foto', 'data', 'nomeCliccabile', 'piattaforma', 'durata', 'costo', 'costoMinuto', 'voto', 'recensione', 'note'];
const COLONNE_SCHEDA = ['data', 'piattaforma', 'durata', 'costo', 'costoMinuto', 'voto', 'recensione', 'note'];

function intestazioneShow(colonne) {
    return `<tr>${colonne.map(c => {
        const [chiave, classe] = COLONNE_SHOW[c];
        return `<th${classe ? ` class="${classe}"` : ''}>${escapeHtml(t(chiave))}</th>`;
    }).join('')}</tr>`;
}

function rigaShow(show, colonne) {
    return `<tr>${colonne.map(c => COLONNE_SHOW[c][2](show)).join('')}</tr>`;
}

function righeShow(shows, colonne) {
    return shows.map(s => rigaShow(s, colonne)).join('');
}
