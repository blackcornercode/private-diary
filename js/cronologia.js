import { anniDisponibili, filtraOrdinaShows, paginaDi } from './calcoli.js';
import { t } from './i18n.js';
import { logger } from './logger.js';
import { COLONNE_CRONOLOGIA, intestazioneShow, righeShow } from './righe-show.js';
import { stato } from './stato.js';

/* ==========================================================================
   CRONOLOGIA: FILTRI PER ANNO E NOME
   ========================================================================== */
export function inizializzaFiltriCronologia() {
    const limiteSalvato = localStorage.getItem('limiteRisultati');
    const limiteSelect = document.getElementById('limiteRisultati');
    if (limiteSelect && limiteSalvato) {
        limiteSelect.value = limiteSalvato;
    }
}

export function inizializzaFiltroAnni(shows) {
    const container = document.getElementById('container-filtri-anni');
    if (!container) return;

    container.innerHTML = '';

    const salvati = localStorage.getItem('anniSelezionatiFiltro');
    if (salvati) {
        try {
            stato.anniSelezionati = new Set(JSON.parse(salvati));
        } catch (e) {
            console.error("Errore nel ripristino degli anni dal localStorage", e);
        }
    }

    const anni = anniDisponibili(shows);
    if (anni.length === 0) {
        container.innerHTML = '<span class="filtro-anni-vuoto">Nessun anno disponibile</span>';
        return;
    }

    anni.forEach(anno => {
        const wrapper = document.createElement('label');
        wrapper.className = 'filtro-anno';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = anno;
        checkbox.checked = stato.anniSelezionati.has(anno);

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) stato.anniSelezionati.add(anno);
            else stato.anniSelezionati.delete(anno);
            localStorage.setItem('anniSelezionatiFiltro', JSON.stringify(Array.from(stato.anniSelezionati)));
            stato.paginaCorrente = 1;
            caricaCronologia(stato.tuttiGliShow);
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(document.createTextNode(anno));
        container.appendChild(wrapper);
    });
}

/* ==========================================================================
   CRONOLOGIA E PAGINAZIONE
   ========================================================================== */
export function caricaCronologia(shows) {
    const listaShow = document.getElementById('listaShow');
    if (!listaShow) return;

    const limite = document.getElementById('limiteRisultati')?.value || '5';

    // Il filtro per nome resta attivo anche cambiando pagina, ordine, numero di risultati o anno
    const filtrati = filtraOrdinaShows(shows, {
        nome: document.getElementById('searchModellaCronologia')?.value || '',
        anni: [...stato.anniSelezionati],
        ordine: document.getElementById('ordineData')?.value || 'desc'
    });
    const { elementi, pagina, totalePagine } = paginaDi(filtrati, limite, stato.paginaCorrente);
    stato.paginaCorrente = pagina;

    const intestazione = document.getElementById('intestazioneCronologia');
    if (intestazione) intestazione.innerHTML = intestazioneShow(COLONNE_CRONOLOGIA);
    listaShow.innerHTML = righeShow(elementi, COLONNE_CRONOLOGIA);
    aggiornaControlliPaginazione(totalePagine, limite === 'all');
}

export function cambiaPagina(direzione) {
    stato.paginaCorrente += direzione;
    logger.info(`Navigazione pagina cronologia: ${stato.paginaCorrente}`);
    caricaCronologia(stato.tuttiGliShow);
}

export function aggiornaControlliPaginazione(totalePagine, mostraTutti) {
    const btnIndietro = document.getElementById('btnPrevPagina');
    const btnAvanti = document.getElementById('btnNextPagina');
    const infoPagina = document.getElementById('infoPagina');
    const contenitorePaginazione = document.getElementById('controlliPaginazione');

    if (!contenitorePaginazione) return;

    if (mostraTutti || totalePagine <= 1) {
        contenitorePaginazione.style.display = 'none';
        return;
    }

    contenitorePaginazione.style.display = 'flex';

    if (btnIndietro) btnIndietro.disabled = (stato.paginaCorrente <= 1);
    if (btnAvanti) btnAvanti.disabled = (stato.paginaCorrente >= totalePagine);
    if (infoPagina) {
        infoPagina.textContent = t('pagination.page_of')
            .replace('{page}', stato.paginaCorrente)
            .replace('{total}', totalePagine);
    }
}

export function resetFiltriCronologia() {
    logger.info("Reset dei filtri cronologia richiesto.");
    const ordine = document.getElementById('ordineData');
    const limite = document.getElementById('limiteRisultati');
    if (ordine) ordine.value = 'desc';
    if (limite) limite.value = '5';

    const searchInput = document.getElementById('searchModellaCronologia');
    if (searchInput) searchInput.value = '';

    stato.anniSelezionati.clear();
    localStorage.removeItem('anniSelezionatiFiltro');

    inizializzaFiltroAnni(stato.tuttiGliShow);

    localStorage.removeItem('limiteRisultati');
    stato.paginaCorrente = 1;
    caricaCronologia(stato.tuttiGliShow);
}

export function filtraCronologiaPerNome() {
    stato.paginaCorrente = 1;
    caricaCronologia(stato.tuttiGliShow);
}
