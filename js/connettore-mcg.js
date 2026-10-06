/* ==========================================================================
   CONNETTORE MONDO CAM GIRLS (lato interfaccia)
   ==========================================================================
   Indirizzi dei profili MCG, usati da importazione, modelle online, profili
   sospesi e galleria. Il resto del connettore è in main/connettori/mcg/;
   la lettura delle pagine delle transazioni è in sincronizzazione.js. */

// Sottodominio del profilo MCG ("https://anna.mondocamgirls.com/it" -> "anna")
export function slugProfiloMcg(url) {
    const m = /^https?:\/\/([a-z0-9_-]+)\.mondocamgirls\.com/i.exec(String(url || ''));
    return m && m[1].toLowerCase() !== 'www' ? m[1].toLowerCase() : null;
}

// URL MCG dedotto dal nome quando non ne è stato salvato uno: "Giulìa Rossi" -> giuliarossi.mondocamgirls.com.
// Il minuscolo va fatto prima del filtro, altrimenti le maiuscole venivano scartate ("Giulia" -> "iulia").
export function urlProfiloPredefinito(nome) {
    const sottodominio = String(nome || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]/g, '');
    return `https://${sottodominio}.mondocamgirls.com`;
}
