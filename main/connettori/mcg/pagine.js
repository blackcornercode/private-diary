// Lettura delle pagine della cronologia transazioni di Mondo Cam Girls, nella
// finestra di sincronizzazione già autenticata. Usato da main.js.

const ATTESA_TRA_PAGINE_MS = 400;   // pausa tra una pagina e l'altra, per non sovraccaricare il sito
const MAX_PAGINE = 300;             // limite di sicurezza

const attendi = (ms) => new Promise(r => setTimeout(r, ms));

// Legge la pagina caricata: HTML, codici delle transazioni (dal link
// javascript:dettaglitrans(<codice>)), valori di paginazione e richiesta di login
function leggiPaginaCorrente(win) {
    return win.webContents.executeJavaScript(`(() => {
        const righe = [...document.querySelectorAll('table tr')].filter(tr => tr.querySelector('a[href*="dettaglitrans("]'));
        const codici = righe.map(tr => (tr.querySelector('a[href*="dettaglitrans("]').getAttribute('href').match(/\\d+/) || [''])[0]);
        const valoriPagina = [...document.querySelectorAll('a[href*="pagina_vis="]')]
            .map(a => parseInt(new URL(a.href, location.href).searchParams.get('pagina_vis'), 10))
            .filter(n => Number.isFinite(n));
        return {
            html: document.body.innerHTML,
            codici,
            valoriPagina,
            richiedeLogin: !!document.querySelector('input[type="password"]')
        };
    })()`);
}

function urlPagina(urlBase, valore) {
    const u = new URL(urlBase);
    u.searchParams.set('pagina_vis', String(valore));
    return u.toString();
}

// Legge le pagine successive alla prima finché arrivano transazioni nuove.
// Il passo tra le pagine si ricava dai link di paginazione (1 se indicano il
// numero di pagina, es. 100 se indicano lo scostamento); senza link si usa 1.
async function leggiTutteLePagine(win, urlBase, primaPagina, onAvanzamento) {
    const pagine = [primaPagina.html];
    const visti = new Set(primaPagina.codici);
    const positivi = primaPagina.valoriPagina.filter(n => n > 0);
    const passo = positivi.length ? Math.min(...positivi) : 1;
    const partenza = parseInt(new URL(urlBase).searchParams.get('pagina_vis') || '0', 10) || 0;
    let motivoFine = 'limite di pagine raggiunto';

    for (let i = 1; i < MAX_PAGINE; i++) {
        if (win.isDestroyed()) { motivoFine = 'finestra chiusa'; break; }
        if (onAvanzamento) onAvanzamento(i + 1, visti.size);
        await win.loadURL(urlPagina(urlBase, partenza + i * passo));
        const pagina = await leggiPaginaCorrente(win);
        if (pagina.richiedeLogin) { motivoFine = 'sessione scaduta: MCG ha chiesto di nuovo il login'; break; }
        const nuovi = pagina.codici.filter(c => !visti.has(c));
        // Pagina vuota, oltre la fine o uguale a una già letta: cronologia finita
        if (nuovi.length === 0) { motivoFine = 'fine della cronologia'; break; }
        nuovi.forEach(c => visti.add(c));
        pagine.push(pagina.html);
        await attendi(ATTESA_TRA_PAGINE_MS);
    }

    return { pagine, transazioni: visti.size, passo, motivoFine, completa: motivoFine === 'fine della cronologia' };
}

module.exports = { leggiPaginaCorrente, leggiTutteLePagine, urlPagina, MAX_PAGINE };
