import { spesaPerAnno, spesaPerSito } from './calcoli.js';
import { t, localeCorrente } from './i18n.js';
import { sitoDaId, siglaSito } from './siti.js';
import { COLORI_TAG } from './tag.js';
import { escapeHtml, formattaCostoAlMinuto } from './utils.js';

/* ==========================================================================
   GRAFICO DELLA SPESA (scheda Statistiche)
   ==========================================================================
   Barre in SVG generate qui, senza librerie esterne. Due viste:
   - "mesi": spesa di ogni mese dell'anno scelto, con la linea del budget mensile
     (i mesi oltre il budget sono in rosso);
   - "anni": spesa di ogni anno.
   Colori e testi vengono dalle classi in style.css, quindi seguono il tema. */

const CHIAVE_VISTA = 'graficoSpesaVista';
const MESI = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const VISTE = ['mesi', 'anni', 'siti'];

export function vistaGraficoSpesa() {
    try {
        const vista = localStorage.getItem(CHIAVE_VISTA);
        return VISTE.includes(vista) ? vista : 'mesi';
    } catch {
        return 'mesi';
    }
}

export function impostaVistaGraficoSpesa(vista) {
    try {
        localStorage.setItem(CHIAVE_VISTA, VISTE.includes(vista) ? vista : 'mesi');
    } catch { /* preferenza non salvata: resta la vista predefinita */ }
}

const euro = (valore) => `€ ${Math.round(valore).toLocaleString(localeCorrente())}`;

// Valore "tondo" per la scala verticale (1, 2, 2.5, 5 × 10^n), almeno pari a massimo
function scalaTonda(massimo) {
    if (massimo <= 0) return 100;
    const potenza = 10 ** Math.floor(Math.log10(massimo));
    const passo = [1, 2, 2.5, 5, 10].find(m => m * potenza >= massimo);
    return passo * potenza;
}

// SVG a barre. voci: [{ etichetta, valore, dettaglio, evidenziata }];
// soglia (facoltativa): linea orizzontale, le barre oltre sono "oltre-soglia".
export function graficoBarre(voci, { soglia = 0, etichettaSoglia = '' } = {}) {
    const L = 1000, A = 280;
    const margine = { sinistra: 70, destra: 14, alto: 26, basso: 34 };
    const larghezzaUtile = L - margine.sinistra - margine.destra;
    const altezzaUtile = A - margine.alto - margine.basso;
    const massimo = scalaTonda(Math.max(soglia, ...voci.map(v => v.valore)) * 1.08);
    const y = (valore) => margine.alto + altezzaUtile * (1 - valore / massimo);
    const slot = larghezzaUtile / Math.max(voci.length, 1);
    const larghezzaBarra = Math.min(slot * 0.62, 70);

    const griglia = [0, 0.25, 0.5, 0.75, 1].map(f => {
        const valore = massimo * f;
        return `<line class="griglia" x1="${margine.sinistra}" x2="${L - margine.destra}" y1="${y(valore)}" y2="${y(valore)}"/>
            <text class="asse" x="${margine.sinistra - 8}" y="${y(valore) + 4}" text-anchor="end">${euro(valore)}</text>`;
    }).join('');

    const barre = voci.map((voce, i) => {
        const centro = margine.sinistra + slot * (i + 0.5);
        const altezza = Math.max(0, y(0) - y(voce.valore));
        // voce.classe: colore proprio della barra (vista per sito: il colore del sito)
        const classi = ['barra', voce.classe || '', soglia > 0 && voce.valore > soglia ? 'oltre-soglia' : '', voce.evidenziata ? 'evidenziata' : ''].filter(Boolean).join(' ');
        return `<g>
            <title>${escapeHtml(voce.dettaglio)}</title>
            <rect class="${classi}" x="${centro - larghezzaBarra / 2}" y="${y(voce.valore)}" width="${larghezzaBarra}" height="${altezza}" rx="4"/>
            ${voce.valore > 0 ? `<text class="valore" x="${centro}" y="${y(voce.valore) - 6}" text-anchor="middle">${euro(voce.valore)}</text>` : ''}
            <text class="asse${voce.evidenziata ? ' evidenziata' : ''}" x="${centro}" y="${A - 12}" text-anchor="middle">${escapeHtml(voce.etichetta)}</text>
        </g>`;
    }).join('');

    const lineaSoglia = soglia > 0
        ? `<line class="linea-soglia" x1="${margine.sinistra}" x2="${L - margine.destra}" y1="${y(soglia)}" y2="${y(soglia)}"/>
           <text class="etichetta-soglia" x="${L - margine.destra}" y="${y(soglia) - 6}" text-anchor="end">${escapeHtml(etichettaSoglia)}</text>`
        : '';

    return `<svg class="grafico-spesa" viewBox="0 0 ${L} ${A}" role="img" aria-label="${escapeHtml(t('chart.title'))}">${griglia}${barre}${lineaSoglia}</svg>`;
}

// Disegna grafico e riepilogo. spesaMesi/conteggioMesi: dati dell'anno scelto
// (calcolaStatisticheAnno), budget: budget mensile (0 = non impostato).
export function disegnaGraficoSpesa({ shows, anno, spesaMesi, conteggioMesi, budget, oggi = new Date() }) {
    const contenitore = document.getElementById('graficoSpesa');
    const riepilogo = document.getElementById('riepilogoGraficoSpesa');
    if (!contenitore) return;

    const vista = vistaGraficoSpesa();
    document.querySelectorAll('[data-azione="vista-grafico-spesa"]').forEach(btn => {
        const attivo = btn.dataset.vista === vista;
        btn.classList.toggle('attivo', attivo);
        btn.setAttribute('aria-pressed', String(attivo));
    });

    const showTxt = (n) => `${n} ${t('chart.shows')}`;
    let voci, testoRiepilogo, opzioni = {};
    if (vista === 'siti') {
        // Tutti gli anni: spesa per sito, dal sito con più spesa; il tooltip riporta anche il €/min
        const siti = spesaPerSito(shows);
        voci = siti.map(s => {
            const sito = sitoDaId(s.sito);
            const minuto = s.costoMedioMinuto !== null ? ` · ${formattaCostoAlMinuto(s.costoMedioMinuto, null)} ${t('form.per_minute')}` : '';
            return {
                etichetta: siglaSito(s.sito) || '–',
                valore: s.spesa,
                dettaglio: `${sito?.nome || s.sito || '–'}: ${euro(s.spesa)} · ${showTxt(s.conteggio)}${minuto}`,
                classe: `tag-colore-${sito && COLORI_TAG.includes(sito.colore) ? sito.colore : 'grigio'}`
            };
        });
        const totale = siti.reduce((s, x) => s + x.spesa, 0);
        testoRiepilogo = `${t('chart.total_sites').replace('{n}', siti.length)}: ${euro(totale)} · ${showTxt(siti.reduce((s, x) => s + x.conteggio, 0))}`;
    } else if (vista === 'anni') {
        const anni = spesaPerAnno(shows);
        voci = anni.map(a => ({
            etichetta: String(a.anno),
            valore: a.spesa,
            dettaglio: `${a.anno}: ${euro(a.spesa)} · ${showTxt(a.conteggio)}`,
            evidenziata: a.anno === oggi.getFullYear()
        }));
        const totale = anni.reduce((s, a) => s + a.spesa, 0);
        const media = anni.length ? totale / anni.length : 0;
        testoRiepilogo = `${t('chart.total_all')}: ${euro(totale)} · ${showTxt(anni.reduce((s, a) => s + a.conteggio, 0))} · ${t('chart.avg_year')}: ${euro(media)}`;
    } else {
        voci = MESI.map((m, i) => {
            const nome = t(`months.${m}`);
            return {
                etichetta: nome.slice(0, 3),
                valore: spesaMesi[i],
                dettaglio: `${nome} ${anno}: ${euro(spesaMesi[i])} · ${showTxt(conteggioMesi[i])}`,
                evidenziata: anno === oggi.getFullYear() && i === oggi.getMonth()
            };
        });
        const totale = spesaMesi.reduce((s, v) => s + v, 0);
        // Media sui mesi trascorsi per l'anno in corso, su 12 per gli anni passati
        const mesiTrascorsi = anno === oggi.getFullYear() ? oggi.getMonth() + 1 : 12;
        testoRiepilogo = `${t('chart.total_year').replace('{anno}', anno)}: ${euro(totale)} · ${showTxt(conteggioMesi.reduce((s, v) => s + v, 0))} · ${t('chart.avg_month')}: ${euro(totale / mesiTrascorsi)}`;
        if (budget > 0) opzioni = { soglia: budget, etichettaSoglia: `${t('chart.budget')} ${euro(budget)}` };
    }

    if (riepilogo) riepilogo.textContent = testoRiepilogo;
    contenitore.innerHTML = voci.some(v => v.valore > 0)
        ? graficoBarre(voci, opzioni)
        : `<p class="grafico-vuoto">${escapeHtml(t('chart.empty'))}</p>`;
}
