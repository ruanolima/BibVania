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
            transition: opacity 0.2s ease;
        }
        #_bv-transition.ativo {
            opacity: 1;
            pointer-events: all;
        }
        #_bv-transition-logo {
            width: 80px;
            height: auto;
            animation: _bv-pulse 1.2s ease-in-out infinite;
        }
        #_bv-transition-dots {
            display: flex;
            gap: 0.5rem;
        }
        #_bv-transition-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563eb;
            animation: _bv-bounce 1.2s ease-in-out infinite;
        }
        #_bv-transition-dots span:nth-child(2) { animation-delay: 0.2s; }
        #_bv-transition-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes _bv-pulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%       { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes _bv-bounce {
            0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
            40%            { transform: translateY(-8px); opacity: 1;   }
        }
    `;
    document.head.appendChild(style);

    // ── Mostrar/ocultar ───────────────────────────────────────────
    function mostrar(cb) {
        overlay.classList.add('ativo');
        // Pequeno delay para garantir que a animação seja visível
        setTimeout(cb, 280);
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
