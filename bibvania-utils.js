/**
 * BibVania — bibvania-utils.js
 * Utilitários de acessibilidade: busca por voz (Web Speech API)
 *
 * @author  Ruan Oliveira Lima <https://github.com/ruanolima>
 * @version 1.2
 * @year    2026
 * @license CC-BY-4.0 <https://creativecommons.org/licenses/by/4.0/>
 * @source  https://github.com/ruanolima/BibVania
 */

// ═══════════════════════════════════════════════════════════════
// BUSCA POR VOZ — Web Speech API (nativa, sem chave)
// ═══════════════════════════════════════════════════════════════

/**
 * Cria um botão de microfone e o injeta no wrapper do input.
 * @param {HTMLInputElement} inputEl  — campo de busca alvo
 * @param {Function} onResult        — callback(texto) após reconhecimento
 */
export function iniciarBuscaVoz(inputEl, onResult) {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return; // navegador não suporta — botão não aparece

    const wrap = inputEl.parentElement;
    wrap.classList.add('search-voice-wrap');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-btn';
    btn.setAttribute('aria-label', 'Buscar por voz');
    btn.setAttribute('title', 'Buscar por voz');
    btn.innerHTML = _micSVG();
    wrap.appendChild(btn);

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let ouvindo = false;

    btn.addEventListener('click', () => {
        if (ouvindo) {
            recognition.stop();
            return;
        }
        recognition.start();
    });

    recognition.addEventListener('start', () => {
        ouvindo = true;
        btn.classList.add('ouvindo');
        btn.setAttribute('aria-label', 'Parar gravação de voz');
        btn.setAttribute('aria-pressed', 'true');
        _anunciar('Ouvindo…');
    });

    recognition.addEventListener('result', (e) => {
        const texto = e.results[0][0].transcript.trim();
        inputEl.value = texto;
        onResult(texto);
        _anunciar(`Buscando por: ${texto}`);
    });

    recognition.addEventListener('end', () => {
        ouvindo = false;
        btn.classList.remove('ouvindo');
        btn.setAttribute('aria-label', 'Buscar por voz');
        btn.removeAttribute('aria-pressed');
    });

    recognition.addEventListener('error', (e) => {
        ouvindo = false;
        btn.classList.remove('ouvindo');
        btn.setAttribute('aria-label', 'Buscar por voz');
        if (e.error !== 'aborted') {
            _anunciar('Não foi possível reconhecer a voz. Tente novamente.');
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ═══════════════════════════════════════════════════════════════

/** Anuncia texto para leitores de tela via live region */
function _anunciar(texto) {
    let live = document.getElementById('_bv-live');
    if (!live) {
        live = document.createElement('div');
        live.id = '_bv-live';
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        live.className = 'visually-hidden';
        document.body.appendChild(live);
    }
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = texto; });
}

/** SVG do microfone */
function _micSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>`;
}
