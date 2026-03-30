/**
 * BibVania — Edge Function universal
 *
 * Arquivo: bibvania.ts
 * Deploy:  supabase/functions/bibvania/index.ts
 *
 * Esta é a única Edge Function do sistema. Todas as operações
 * que precisam de chaves secretas passam por aqui.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  AÇÕES DISPONÍVEIS (campo "acao" no payload JSON)           │
 * │                                                             │
 * │  "groq"    → Analisa capa de livro com visão computacional  │
 * │  "upload"  → Envia capa (JPG) ou PDF para Internet Archive  │
 * │  "excluir" → Remove arquivo do Internet Archive             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Secrets necessários (supabase secrets set <NOME>=<valor>):
 *   GROQ_API_KEY   → console.groq.com → API Keys
 *   IA_ACCESS_KEY  → archive.org/account/s3.php → Access Key
 *   IA_SECRET_KEY  → archive.org/account/s3.php → Secret Key
 *   IA_IDENTIFIER  → nome do item no IA (ex: bibvania-emti-vania)
 *
 * Como fazer o deploy:
 *   1. Crie a pasta:  mkdir -p supabase/functions/bibvania
 *   2. Copie o arquivo: cp bibvania.ts supabase/functions/bibvania/index.ts
 *   3. Configure os secrets acima
 *   4. Execute: supabase functions deploy bibvania
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ─────────────────────────────────────────────────────────────────────
const CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respJson(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, "Content-Type": "application/json" },
    });
}

// ── Payload esperado ─────────────────────────────────────────────────────────
interface Payload {
    acao:        string;
    // Internet Archive
    tipo?:       "capa" | "pdf";
    livroId?:    number;
    arquivo?:    string;          // base64 (com ou sem prefixo data:…)
    // Groq
    base64?:     string;          // base64 JPEG sem prefixo
    categorias?: string[];        // lista de categorias do acervo
}

// ════════════════════════════════════════════════════════════════════════════
serve(async (req) => {

    // ── Preflight CORS ───────────────────────────────────────────────────────
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    // ── 1. Autenticação via Supabase Auth ────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respJson({ error: "Não autenticado" }, 401);

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return respJson({ error: "Sessão inválida" }, 401);

    // ── 2. Leitura do payload ────────────────────────────────────────────────
    let payload: Payload;
    try {
        payload = await req.json();
    } catch {
        return respJson({ error: "Payload JSON inválido" }, 400);
    }

    const { acao } = payload;
    if (!acao) return respJson({ error: "Campo 'acao' obrigatório" }, 400);

    // ════════════════════════════════════════════════════════════════════════
    // AÇÃO: groq
    // Analisa a imagem da capa e retorna metadados do livro.
    //
    // Payload:  { acao:"groq", base64:string, categorias?:string[] }
    // Retorna:  { titulo, autor, categoria, palavras_chave, alt_text }
    // ════════════════════════════════════════════════════════════════════════
    if (acao === "groq") {
        const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
        if (!GROQ_API_KEY) {
            return respJson({ error: "Secret GROQ_API_KEY não configurado no servidor" }, 500);
        }

        const { base64, categorias } = payload;
        if (!base64) return respJson({ error: "Campo 'base64' obrigatório para acao=groq" }, 400);

        // Usa as categorias do acervo enviadas pelo cliente,
        // ou cai no conjunto padrão da BibVania caso omitido.
        const cats: string[] = (categorias && categorias.length > 0)
            ? categorias
            : [
                "EDUCAÇÃO INCLUSIVA", "INFANTIL (1º AO 4º)", "INFANTOJUVENIL (5º E 6º)",
                "JUVENIL (7º AO 9º)", "JOVEM ADULTO (ENSINO MÉDIO)", "EJA (FUNDAMENTAL)", "EJA (MÉDIO)",
                "DIDÁTICO (1º)", "DIDÁTICO (2º)", "DIDÁTICO (3º)", "DIDÁTICO (4º)",
                "DIDÁTICO (5º)", "DIDÁTICO (6º)", "DIDÁTICO (7º)", "DIDÁTICO (8º)",
                "DIDÁTICO (9º)", "DIDÁTICO (EM 1º)", "DIDÁTICO (EM 2º)", "DIDÁTICO (EM 3º)",
                "DIDÁTICO (EJAF)", "DIDÁTICO (EJAM)", "DE REFERÊNCIA", "CLÁSSICOS & REGIONAIS", "POESIA",
              ];

        const PROMPT =
            "Você é um especialista em catalogação de livros escolares brasileiros.\n" +
            "Analise a imagem da capa com muita atenção e retorne APENAS um JSON válido.\n" +
            "TODOS os campos são obrigatórios — nunca deixe um campo como null ou vazio.\n\n" +

            "=== CAMPOS ===\n\n" +

            "TITULO (string em MAIÚSCULAS)\n" +
            "- Transcreva o título EXATAMENTE como está na capa, em maiúsculas.\n" +
            "- Inclua o subtítulo se houver (separado por dois-pontos ou travessão).\n" +
            "- Inclua número de volume/série/edição se aparecer na capa (ex: HISTÓRIA: 6º ANO).\n" +
            "- NÃO inclua nome do autor, editora ou selo no título.\n\n" +

            "AUTOR (string em MAIÚSCULAS — NUNCA null, NUNCA vazio)\n" +
            "- Procure na capa palavras como: POR, AUTOR, AUTORA, ESCRITO POR, ADAPTADO POR, ORGANIZADO POR, TRADUZIDO POR, COORDENADO POR, TEXT BY, BY — e use o nome que vem depois.\n" +
            "- Use apenas o nome do autor original; ignore ilustradores, tradutores, organizadores se o autor principal estiver presente.\n" +
            "- Se o livro tiver mais de um autor, coloque apenas o primeiro.\n" +
            "- Se NÃO houver nenhum nome de autor ou colaborador na capa, coloque o nome da EDITORA ou do ÓRGÃO/INSTITUIÇÃO responsável pela obra (ex: MINISTÉRIO DA EDUCAÇÃO, MODERNA, FTD, SARAIVA).\n" +
            "- Em último caso, coloque AUTOR DESCONHECIDO.\n\n" +

            "ISBN (string com apenas dígitos, ou null)\n" +
            "- Se o ISBN aparece na capa ou no verso, inclua aqui (somente dígitos, sem hifens).\n" +
            "- Caso contrário, null.\n\n" +

            "CATEGORIA (EXATAMENTE UMA das opções abaixo — NUNCA null, NUNCA vazio)\n" +
            "Regras para identificar a categoria correta:\n\n" +
            "LIVROS DE LEITURA / PARADIDÁTICOS:\n" +
            "  INFANTIL (1º AO 4º)       → Histórias infantis, contos, fábulas para crianças pequenas. Linguagem simples, ilustrações abundantes.\n" +
            "  INFANTOJUVENIL (5º E 6º)  → Aventura, fantasia, mistério para pré-adolescentes. Indica 5º, 6º ano ou faixa 10-12 anos. ATENÇÃO: se a capa indica '6º ao 9º', verifique se o conteúdo é infanto ou juvenil.\n" +
            "  JUVENIL (7º AO 9º)        → Literatura para adolescentes, 7º ao 9º ano ou faixa 12-15 anos. Temas mais complexos.\n" +
            "  JOVEM ADULTO (ENSINO MÉDIO) → Para estudantes do Ensino Médio (EM), 1º ao 3º EM, faixa 15-18 anos.\n" +
            "  EJA (FUNDAMENTAL)          → Livros de leitura recomendados para jovens e adultos do EJA de nível fundamental (retomada do Ensino Fundamental).\n" +
            "  EJA (MÉDIO)                → Livros de leitura recomendados para jovens e adultos do EJA de nível médio (retomada do Ensino Médio).\n" +
            "  POESIA                    → Coletâneas de poemas, cordel, haiku, poesia visual.\n" +
            "  CLÁSSICOS & REGIONAIS     → Clássicos da literatura brasileira e mundial, literatura regional, obras que não se encaixam nas faixas etárias acima.\n" +
            "  EDUCAÇÃO INCLUSIVA        → Livros sobre inclusão, diversidade, acessibilidade, deficiências.\n\n" +
            "LIVROS DIDÁTICOS:\n" +
            "  DIDÁTICO (1º) ao DIDÁTICO (9º) → Livro didático específico para aquele ano do Ensino Fundamental.\n" +
            "  DIDÁTICO (EM 1º/2º/3º)    → Livro didático do Ensino Médio.\n" +
            "  DIDÁTICO (EJAF)           → Material didático do EJA de nível fundamental (estudos e formação).\n" +
            "  DIDÁTICO (EJAM)           → Material didático do EJA de nível médio (estudos e formação).\n" +
            "  DE REFERÊNCIA             → Dicionários, enciclopédias, atlas, gramáticas, materiais de consulta geral.\n\n" +
            "DICA: Se a capa tem COMPONENTE CURRICULAR (Matemática, Português, etc.) + ANO ESCOLAR → é DIDÁTICO. Se é narrativa/história/poema → é paradidático/leitura.\n\n" +

            "PALAVRAS_CHAVE (array com exatamente 1 string em minúsculas)\n" +
            "- Escolha o gênero ou tema principal do livro.\n" +
            "- Pode ser uma palavra simples ou composta se isso descrever melhor o conteúdo.\n" +
            "- NÃO use vírgula dentro da string — é uma única expressão.\n" +
            "- Exemplos simples: [\"aventura\"], [\"poesia\"], [\"romance\"], [\"fábula\"], [\"matemática\"]\n" +
            "- Exemplos compostos: [\"ficção científica\"], [\"cordel nordestino\"], [\"educação física\"], [\"história regional\"]\n\n" +

            "ALT_TEXT (string em português, máx 100 chars)\n" +
            "Descreva brevemente os elementos visuais da capa para acessibilidade.\n\n" +

            "Retorne SOMENTE o JSON válido, sem markdown, sem explicações:\n" +
            "{\"titulo\":\"...\",\"autor\":\"...\",\"isbn\":null,\"categoria\":\"...\",\"palavras_chave\":[\"...\"],\"alt_text\":\"...\"}";

        // Até 3 tentativas — retry automático em rate limit (429) e indisponibilidade (503)
        for (let tentativa = 1; tentativa <= 3; tentativa++) {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model:           "meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature:     0.1,
                    response_format: { type: "json_object" },
                    messages: [{
                        role: "user",
                        content: [
                            { type: "text",      text: PROMPT },
                            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
                        ],
                    }],
                }),
            });

            const groqJson = await groqRes.json();

            if (!groqRes.ok) {
                const retentar = (groqRes.status === 429 || groqRes.status === 503) && tentativa < 3;
                if (retentar) {
                    await new Promise((r) => setTimeout(r, 2000 * tentativa));
                    continue;
                }
                console.error(`[groq] Erro ${groqRes.status}:`, groqJson);
                return respJson({
                    error: groqJson.error?.message ?? `Erro Groq: ${groqRes.status}`,
                }, 502);
            }

            // Groq pode retornar o JSON embrulhado em blocos de markdown — limpa antes de parsear
            const conteudo = groqJson.choices[0].message.content
                .replace(/```json\s*/gi, "")
                .replace(/```/g, "")
                .trim();

            try {
                return respJson(JSON.parse(conteudo));
            } catch {
                console.error("[groq] JSON inválido recebido:", conteudo);
                return respJson({ error: "Groq retornou resposta não-JSON" }, 502);
            }
        }

        return respJson({ error: "Serviço Groq indisponível após 3 tentativas" }, 503);
    }

    // ════════════════════════════════════════════════════════════════════════
    // AÇÕES: upload / excluir  — Internet Archive S3 API
    //
    // Payload upload:  { acao:"upload",  tipo:"capa"|"pdf", livroId:number, arquivo:string }
    // Payload excluir: { acao:"excluir", tipo:"capa"|"pdf", livroId:number }
    // ════════════════════════════════════════════════════════════════════════
    if (acao === "upload" || acao === "excluir") {
        const IA_ACCESS_KEY = Deno.env.get("IA_ACCESS_KEY");
        const IA_SECRET_KEY = Deno.env.get("IA_SECRET_KEY");
        const IA_IDENTIFIER = Deno.env.get("IA_IDENTIFIER") ?? "bibvania-arquivos";

        if (!IA_ACCESS_KEY || !IA_SECRET_KEY) {
            return respJson({ error: "Secrets IA_ACCESS_KEY / IA_SECRET_KEY não configurados" }, 500);
        }

        const { tipo, livroId } = payload;
        if (!tipo || !livroId) {
            return respJson({ error: "Campos 'tipo' e 'livroId' obrigatórios para upload/excluir" }, 400);
        }

        // Nome do arquivo no IA: capa-42.jpg  ou  pdf-42.pdf
        const ext      = tipo === "capa" ? "jpg" : "pdf";
        const filename = `${tipo}-${livroId}.${ext}`;
        const iaUrl    = `https://s3.us.archive.org/${IA_IDENTIFIER}/${filename}`;

        // ── UPLOAD ──────────────────────────────────────────────────────────
        if (acao === "upload") {
            const { arquivo } = payload;
            if (!arquivo) return respJson({ error: "Campo 'arquivo' ausente para acao=upload" }, 400);

            // Remove prefixo data:image/jpeg;base64, (se presente)
            const base64raw = arquivo.includes(",") ? arquivo.split(",")[1] : arquivo;
            const bytes     = Uint8Array.from(atob(base64raw), (c) => c.charCodeAt(0));

            const contentType = tipo === "capa" ? "image/jpeg" : "application/pdf";
            const mediatype   = tipo === "capa" ? "image"      : "texts";

            const iaRes = await fetch(iaUrl, {
                method: "PUT",
                headers: {
                    // Autenticação S3 do Internet Archive
                    "Authorization":            `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
                    "Content-Type":             contentType,
                    // Cria o item/bucket automaticamente se ainda não existir
                    "x-amz-auto-make-bucket":   "1",
                    // Metadados do item no IA
                    "x-archive-meta-mediatype": mediatype,
                    "x-archive-meta-subject":   "biblioteca escolar",
                    "x-archive-meta-language":  "por",
                    "x-archive-meta-licenseurl":"https://creativecommons.org/licenses/by/4.0/",
                },
                body: bytes,
            });

            if (!iaRes.ok) {
                const msg = await iaRes.text();
                console.error(`[ia-upload/upload] Erro ${iaRes.status}:`, msg);
                return respJson({ error: `Internet Archive recusou o upload: HTTP ${iaRes.status}` }, 502);
            }

            // URL permanente pública (fica disponível em alguns instantes no IA)
            const url = `https://archive.org/download/${IA_IDENTIFIER}/${filename}`;
            return respJson({ url });
        }

        // ── EXCLUIR ─────────────────────────────────────────────────────────
        if (acao === "excluir") {
            const iaRes = await fetch(iaUrl, {
                method: "DELETE",
                headers: {
                    "Authorization":              `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
                    // Apaga todas as versões derivadas do arquivo
                    "x-archive-cascade-delete":   "1",
                    // Não mantém versão antiga após a deleção
                    "x-archive-keep-old-version": "0",
                },
            });

            // 404 = arquivo já não existia no IA → trata como sucesso silencioso
            if (!iaRes.ok && iaRes.status !== 404) {
                const msg = await iaRes.text();
                console.error(`[ia-excluir] Erro ${iaRes.status}:`, msg);
                return respJson({ error: `Erro ao excluir no Internet Archive: HTTP ${iaRes.status}` }, 502);
            }

            return respJson({ ok: true });
        }
    }

    return respJson({ error: `Ação desconhecida: "${acao}". Use: groq | upload | excluir` }, 400);
});
