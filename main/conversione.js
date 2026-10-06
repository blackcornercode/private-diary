// Conversione dell'archivio al formato 2.0 (campi "sito" e "importatoDa" al posto
// di "isAutoImport", vedi normalizzaShow in js/utils.js). La conversione avviene
// nell'interfaccia alla lettura e viene scritta al primo salvataggio: qui si
// riconosce un archivio ancora da convertire, per farne prima una copia.
function richiedeConversione(shows) {
    return Array.isArray(shows) && shows.some(s => s && typeof s === 'object' && (!('sito' in s) || 'isAutoImport' in s));
}

module.exports = { richiedeConversione };
