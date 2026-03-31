/**
 * BibVania — bibvania-transition.js
 * Tela de transição animada entre páginas
 *
 * @author  Ruan Oliveira Lima
 * @version 1.2
 * @year    2026
 * @license CC-BY-4.0
 */

(function () {
    // ── Criar overlay de transição ────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = '_bv-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <img src="logo.png" alt="" id="_bv-transition-logo">
        <div id="_bv-transition-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    document.body.appendChild(overlay);

    // ── CSS injetado inline ───────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #_bv-transition {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: var(--bg, #0f172a);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.1s ease;
        }
        #_bv-transition.ativo {
            opacity: 1;
            pointer-events: all;
        }
        #_bv-transition-logo {
            width: 80px;
            height: auto;
            animation: _bv-pulse 0.6s ease-in-out infinite;
        }
        #_bv-transition-dots {
            display: flex;
            gap: 0.5rem;
        }
        #_bv-transition-dots span {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #2563eb;
            opacity: 0.3;
            animation: _bv-bounce 0.9s ease-in-out infinite;
        }
        /* 1/3 do ciclo de 0.9s = 0.3s entre cada bolinha */
        #_bv-transition-dots span:nth-child(1) { animation-delay: -0.6s; }
        #_bv-transition-dots span:nth-child(2) { animation-delay: -0.3s; }
        #_bv-transition-dots span:nth-child(3) { animation-delay:    0s; }
        @keyframes _bv-pulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%       { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes _bv-bounce {
            0%, 100% { transform: translateY(0);     opacity: 0.3; }
            50%       { transform: translateY(-10px); opacity: 1;   }
        }
    `;
    document.head.appendChild(style);

    // ── Mostrar/ocultar ───────────────────────────────────────────
    function mostrar(cb) {
        overlay.classList.add('ativo');
        // Pequeno delay para garantir que a animação seja visível
        setTimeout(cb, 140);
    }

    // ── Navegar com transição ─────────────────────────────────────
    window.navegarCom = function (url) {
        if (!url) return;
        mostrar(() => { window.location.href = url; });
    };

    // ── Ocultar ao carregar nova página (bfcache) ─────────────────
    window.addEventListener('pageshow', () => {
        overlay.classList.remove('ativo');
    });
})();
