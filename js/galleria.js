import { stato } from './stato.js';

/* ==========================================================================
   LIGHTBOX E GALLERIA FOTO
   ========================================================================== */
export function apriModalImmagine(urlFoto, listaFoto = null, indice = 0) {
    if (!urlFoto) return;
    
    const modalImg = document.getElementById('modalImmagineIngrandita');
    const imgTarget = document.getElementById('imgIngrandita');
    const btnNavigazione = document.querySelectorAll('.nav-btn-lightbox');
    
    if (listaFoto && Array.isArray(listaFoto) && listaFoto.length > 1) {
        stato.galleriaCorrente = listaFoto;
        stato.indiceFotoCorrente = indice;
        btnNavigazione.forEach(btn => btn.style.display = 'block');
    } else {
        stato.galleriaCorrente = [urlFoto];
        stato.indiceFotoCorrente = 0;
        btnNavigazione.forEach(btn => btn.style.display = 'none');
    }

    if (modalImg && imgTarget) {
        imgTarget.src = stato.galleriaCorrente[stato.indiceFotoCorrente];
        modalImg.style.display = 'block';
        modalImg.style.zIndex = '2000';
    }
}

export function navigaGalleria(direzione) {
    if (stato.galleriaCorrente.length <= 1) return;

    stato.indiceFotoCorrente += direzione;

    if (stato.indiceFotoCorrente < 0) {
        stato.indiceFotoCorrente = stato.galleriaCorrente.length - 1;
    } else if (stato.indiceFotoCorrente >= stato.galleriaCorrente.length) {
        stato.indiceFotoCorrente = 0;
    }

    const imgTarget = document.getElementById('imgIngrandita');
    if (imgTarget) {
        imgTarget.src = stato.galleriaCorrente[stato.indiceFotoCorrente];
    }
}

export function chiudiModalImmagine() {
    const modalImg = document.getElementById('modalImmagineIngrandita');
    if (modalImg) {
        modalImg.style.display = 'none';
    }
}

document.addEventListener('keydown', (e) => {
    const modalImg = document.getElementById('modalImmagineIngrandita');
    if (modalImg && modalImg.style.display === 'block') {
        if (e.key === 'ArrowLeft') navigaGalleria(-1);
        if (e.key === 'ArrowRight') navigaGalleria(1);
        if (e.key === 'Escape') chiudiModalImmagine();
    }
});
