/* ==========================================================================
   CRONOLOGIA: FILTRI PER ANNO E NOME
   ========================================================================== */
function inizializzaFiltriCronologia() {
    const limiteSalvato = localStorage.getItem('limiteRisultati');
    const limiteSelect = document.getElementById('limiteRisultati');
    if (limiteSelect && limiteSalvato) {
        limiteSelect.value = limiteSalvato;
    }
}

function inizializzaFiltroAnni(shows) {
    const container = document.getElementById('container-filtri-anni');
    if (!container) return;

    container.innerHTML = '';

    const salvati = localStorage.getItem('anniSelezionatiFiltro');
    if (salvati) {
        try {
            anniSelezionati = new Set(JSON.parse(salvati));
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
        checkbox.checked = anniSelezionati.has(anno);

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) anniSelezionati.add(anno);
            else anniSelezionati.delete(anno);
            localStorage.setItem('anniSelezionatiFiltro', JSON.stringify(Array.from(anniSelezionati)));
            paginaCorrente = 1;
            caricaCronologia(tuttiGliShow);
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(document.createTextNode(anno));
        container.appendChild(wrapper);
    });
}

/* ==========================================================================
   CRONOLOGIA E PAGINAZIONE
   ========================================================================== */
function caricaCronologia(shows) {
    const listaShow = document.getElementById('listaShow');
    if (!listaShow) return;

    const limite = document.getElementById('limiteRisultati')?.value || '5';

    // Il filtro per nome resta attivo anche cambiando pagina, ordine, numero di risultati o anno
    const filtrati = filtraOrdinaShows(shows, {
        nome: document.getElementById('searchModellaCronologia')?.value || '',
        anni: [...anniSelezionati],
        ordine: document.getElementById('ordineData')?.value || 'desc'
    });
    const { elementi, pagina, totalePagine } = paginaDi(filtrati, limite, paginaCorrente);
    paginaCorrente = pagina;

    const intestazione = document.getElementById('intestazioneCronologia');
    if (intestazione) intestazione.innerHTML = intestazioneShow(COLONNE_CRONOLOGIA);
    listaShow.innerHTML = righeShow(elementi, COLONNE_CRONOLOGIA);
    aggiornaControlliPaginazione(totalePagine, limite === 'all');
}

function cambiaPagina(direzione) {
    paginaCorrente += direzione;
    logger.info(`Navigazione pagina cronologia: ${paginaCorrente}`);
    caricaCronologia(tuttiGliShow);
}

function aggiornaControlliPaginazione(totalePagine, mostraTutti) {
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

    if (btnIndietro) btnIndietro.disabled = (paginaCorrente <= 1);
    if (btnAvanti) btnAvanti.disabled = (paginaCorrente >= totalePagine);
    if (infoPagina) {
        infoPagina.textContent = t('pagination.page_of')
            .replace('{page}', paginaCorrente)
            .replace('{total}', totalePagine);
    }
}

function resetFiltriCronologia() {
    logger.info("Reset dei filtri cronologia richiesto.");
    const ordine = document.getElementById('ordineData');
    const limite = document.getElementById('limiteRisultati');
    if (ordine) ordine.value = 'desc';
    if (limite) limite.value = '5';

    const searchInput = document.getElementById('searchModellaCronologia');
    if (searchInput) searchInput.value = '';

    anniSelezionati.clear();
    localStorage.removeItem('anniSelezionatiFiltro');

    inizializzaFiltroAnni(tuttiGliShow);

    localStorage.removeItem('limiteRisultati');
    paginaCorrente = 1;
    caricaCronologia(tuttiGliShow);
}

function filtraCronologiaPerNome() {
    paginaCorrente = 1;
    caricaCronologia(tuttiGliShow);
}
