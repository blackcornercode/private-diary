// Accesso alla rete del processo principale: validazione degli URL di Mondo Cam
// Girls e download di pagine con timeout.
const { net } = require('electron');

const DOMINIO_MCG = 'mondocamgirls.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Accetta solo URL https/http su mondocamgirls.com o suoi sottodomini
function urlMcgValido(targetUrl) {
    try {
        const u = new URL(targetUrl);
        const host = u.hostname.toLowerCase();
        return ['http:', 'https:'].includes(u.protocol) &&
            (host === DOMINIO_MCG || host.endsWith(`.${DOMINIO_MCG}`));
    } catch {
        return false;
    }
}

// Sottodominio del profilo MCG ("https://anna.mondocamgirls.com/it" -> "anna")
function slugProfiloMcg(url) {
    const m = /^https?:\/\/([a-z0-9_-]+)\.mondocamgirls\.com/i.exec(String(url || ''));
    return m && m[1].toLowerCase() !== 'www' ? m[1].toLowerCase() : null;
}

// Scarica una pagina e ne restituisce il testo, o '' in caso di errore,
// risposta non 2xx o timeout
function downloadHtmlPage(targetUrl, timeoutMs = 15000) {
    return new Promise((resolve) => {
        let concluso = false;
        const fine = (valore) => {
            if (concluso) return;
            concluso = true;
            clearTimeout(timer);
            resolve(valore);
        };

        const request = net.request({
            method: 'GET',
            url: targetUrl,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        // Senza timeout una pagina che non risponde bloccava la galleria per sempre
        const timer = setTimeout(() => {
            request.abort();
            fine('');
        }, timeoutMs);

        request.on('response', (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                response.on('data', () => {});
                response.on('end', () => fine(''));
                return;
            }
            // I chunk vanno uniti come Buffer prima della decodifica: convertirli
            // uno per uno spezza i caratteri accentati a cavallo di due chunk
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => fine(Buffer.concat(chunks).toString('utf8')));
            response.on('error', () => fine(''));
        });
        request.on('error', () => fine(''));
        request.end();
    });
}

module.exports = { urlMcgValido, slugProfiloMcg, downloadHtmlPage, USER_AGENT };
