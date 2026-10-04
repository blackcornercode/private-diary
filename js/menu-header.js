/* ==========================================================================
   MENU A TENDINA DELL'HEADER (Dati / Impostazioni)
   ==========================================================================
   Un solo ascoltatore sul documento: i clic non vengono fermati
   (stopPropagation), così le azioni dentro i menu (data-azione) arrivano
   all'ascoltatore comune di azioni.js. */
export function chiudiMenuHeader(eccetto = null) {
    document.querySelectorAll('.menu-header.open').forEach(menu => {
        if (menu === eccetto) return;
        menu.classList.remove('open');
        menu.querySelector('.menu-header-toggle')?.setAttribute('aria-expanded', 'false');
    });
}

export function inizializzaMenuHeader() {
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.menu-header-toggle');
        if (toggle) {
            const menu = toggle.closest('.menu-header');
            chiudiMenuHeader(menu);
            const aperto = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(aperto));
            return;
        }
        // I clic dentro il pannello (select, A+/A-) non lo chiudono, tranne le
        // voci del menu Dati, che aprono una finestra di dialogo
        if (e.target.closest('.menu-header-pannello') && !e.target.closest('[role="menuitem"]')) return;
        chiudiMenuHeader();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') chiudiMenuHeader();
    });
}
