-- ============================================================================
-- BIBVANIA ONLINE — CONFIGURAÇÃO PRIVADA v1.3
-- Chaves de API: Groq AI e ImgBB
--
-- ⚠️  ESTE ARQUIVO CONTÉM SEGREDOS. NUNCA suba para o GitHub.
--
-- PRÉ-REQUISITO: execute supabase_setup.sql antes deste arquivo.
--
-- COMO EXECUTAR:
--   1. Acesse o Dashboard do Supabase → SQL Editor
--   2. Cole o conteúdo deste arquivo
--   3. Substitua os dois valores marcados com <<SUA_CHAVE_AQUI>>
--   4. Clique em Run
-- ============================================================================


-- ── ONDE OBTER AS CHAVES ────────────────────────────────────────────────────
--
-- GROQ AI (catalogação automática de livros por IA)
--   • Acesse: https://console.groq.com/keys
--   • Crie uma conta gratuita → "Create API Key"
--   • Copie a chave (começa com "gsk_...")
--
-- IMGBB (armazenamento de capas de livros)
--   • Acesse: https://api.imgbb.com
--   • Faça login → clique em "Get API key"
--   • Copie a chave (string hexadecimal)
--
-- ────────────────────────────────────────────────────────────────────────────


-- ============================================================================
-- INSERÇÃO DAS CHAVES
-- ON CONFLICT garante que re-executar este script apenas atualiza os valores,
-- sem criar duplicatas nem gerar erros.
-- ============================================================================

INSERT INTO config_privada (chave, valor)
VALUES ('groq_api_key', '<<SUA_CHAVE_GROQ_AQUI>>')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

INSERT INTO config_privada (chave, valor)
VALUES ('imgbb_api_key', '<<SUA_CHAVE_IMGBB_AQUI>>')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;


-- ============================================================================
-- VERIFICAÇÃO (opcional)
-- Execute após inserir para confirmar que as chaves foram salvas corretamente.
-- Os valores aparecem mascarados para evitar exposição no histórico do editor.
-- ============================================================================

SELECT
    chave,
    LEFT(valor, 6) || REPEAT('*', GREATEST(LENGTH(valor) - 10, 4)) || RIGHT(valor, 4) AS valor_mascarado,
    CASE WHEN LENGTH(valor) > 8 THEN '✅ OK' ELSE '⚠️ MUITO CURTA — VERIFIQUE' END AS status
FROM config_privada
WHERE chave IN ('groq_api_key', 'imgbb_api_key')
ORDER BY chave;
