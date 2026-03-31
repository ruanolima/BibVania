/**
 * BibVania — database.js
 * Sistema de Biblioteca Escolar da EMTI Professora Maria Vânia Farias Linhares
 *
 * @author  Ruan Oliveira Lima <https://github.com/ruanolima>
 * @version 1.2
 * @year    2026
 * @license CC-BY-4.0 <https://creativecommons.org/licenses/by/4.0/>
 * @source  https://github.com/ruanolima/BibVania
 */

// ============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================================
const supabaseUrl = "https://skiqzvtbogtaygvvhswk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNraXF6dnRib2d0YXlndnZoc3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzAwMjMsImV4cCI6MjA4NzY0NjAyM30.VPHf3Wj0IKotbtC4JauebzOH5Ln2JexDYFabANF2n1k";

// Importar Supabase via CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================

const CATEGORIAS_FIXAS = [
    'EDUCAÇÃO INCLUSIVA', 'INFANTIL (1º AO 4º)', 'INFANTOJUVENIL (5º E 6º)',
    'JUVENIL (7º AO 9º)', 'JOVEM ADULTO (ENSINO MÉDIO)', 'EJA (FUNDAMENTAL)', 'EJA (MÉDIO)',
    'DIDÁTICO (1º)', 'DIDÁTICO (2º)', 'DIDÁTICO (3º)', 'DIDÁTICO (4º)',
    'DIDÁTICO (5º)', 'DIDÁTICO (6º)', 'DIDÁTICO (7º)', 'DIDÁTICO (8º)',
    'DIDÁTICO (9º)', 'DIDÁTICO (EM 1º)', 'DIDÁTICO (EM 2º)', 'DIDÁTICO (EM 3º)',
    'DIDÁTICO (EJAF)', 'DIDÁTICO (EJAM)',
    'DE REFERÊNCIA', 'CLÁSSICOS & REGIONAIS', 'POESIA'
];

// ============================================================================
// UTILITÁRIOS
// ============================================================================
const toUpper = (val) => (val && typeof val === 'string') ? val.toUpperCase().trim() : val;

const padronizarObjeto = (obj) => {
    const novoObj = { ...obj };
    for (let key in novoObj) {
        if (typeof novoObj[key] === 'string') {
            novoObj[key] = toUpper(novoObj[key]);
        }
    }

    if (Array.isArray(novoObj.palavras_chave)) {
        novoObj.palavras_chave = novoObj.palavras_chave.map(p => typeof p === 'string' ? p.toLowerCase().trim() : p);
    }
    return novoObj;
};

// ============================================================================
// OBJETO DB - Funções para gerenciar livros, empréstimos e autenticação
// ============================================================================
const DB = {
    CATEGORIAS: CATEGORIAS_FIXAS,
    supabase: supabase,

    // ========================================================================
    // FUNÇÕES DE AUTENTICAÇÃO E SEGURANÇA
    // ========================================================================
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        (window.navegarCom || (u => window.location.href = u))('login.html');
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async checkAuth() {
        const session = await this.getSession();
        if (!session) {
            (window.navegarCom || (u => window.location.href = u))('login.html');
            return null;
        }
        return session;
    },

    async redirectIfLoggedIn() {
        const session = await this.getSession();
        if (session) {
            (window.navegarCom || (u => window.location.href = u))('admin.html');
        }
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // ========================================================================
    // FUNÇÕES PARA LIVROS
    // ========================================================================
    async getLivros() {
        try {
            const { data, error } = await supabase
                .from("livros")
                .select("id, titulo, autor, isbn, categoria, prateleira, quantidade_total, quantidade_disponivel, palavras_chave, alt_text, imagem_url, pdf_url")
                .order("data_cadastro", { ascending: false });
            if (error) throw error;
            if (!data) {
                console.error("Nenhum dado retornado do Supabase");
                return [];
            }
            return data;
        } catch (error) {
            console.error("Erro ao listar livros:", error.message);
            throw error;
        }
    },

    async getLivroPorId(id) {
        const { data, error } = await supabase.from("livros").select("*").eq("id", id).single();
        if (error) return null;
        return data;
    },

    async getCapa(id) {
        const { data, error } = await supabase
            .from("livros").select("imagem_url").eq("id", id).single();
        if (error || !data) return null;
        return data.imagem_url || null;
    },

    // Retorna Set de IDs que têm capa — sem trazer a imagem
    async getIdsComCapa() {
        const { data } = await supabase
            .from("livros")
            .select("id")
            .not("imagem_url", "is", null)
            .neq("imagem_url", "");
        return new Set((data || []).map(l => l.id));
    },

    // Busca capas de vários livros de uma vez (1 request só)
    async getCapas(ids) {
        if (!ids || ids.length === 0) return {};
        const { data, error } = await supabase
            .from("livros")
            .select("id, imagem_url")
            .in("id", ids)
            .not("imagem_url", "is", null)
            .neq("imagem_url", "");
        if (error || !data) return {};
        const map = {};
        data.forEach(l => { if (l.imagem_url) map[l.id] = l.imagem_url; });
        return map;
    },

    async getCapaUnica(id) {
        const { data, error } = await supabase
            .from("livros")
            .select("imagem_url")
            .eq("id", id)
            .single();
        if (error || !data) return null;
        return data.imagem_url || null;
    },

    async getProximoIdDisponivel() {
        // Busca todos os IDs existentes e retorna o menor inteiro >= 1 que não esteja em uso
        const { data, error } = await supabase.from("livros").select("id").order("id", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return 1;
        const ids = new Set(data.map(r => r.id));
        let candidato = 1;
        while (ids.has(candidato)) candidato++;
        return candidato;
    },

    async salvarLivro(livro) {
        try {
            livro = padronizarObjeto(livro);
            
            // Verificar se já existe livro com mesmo título para somar quantidade
            const { data: existente, error: searchError } = await supabase
                .from("livros")
                .select("*")
                .ilike("titulo", livro.titulo)
                .maybeSingle();

            if (existente) {
                const novaQuantidadeTotal = parseInt(existente.quantidade_total) + parseInt(livro.quantidade_total);
                const novaQuantidadeDisponivel = parseInt(existente.quantidade_disponivel) + parseInt(livro.quantidade_total);
                
                const { data, error } = await supabase
                    .from("livros")
                    .update({
                        quantidade_total: novaQuantidadeTotal,
                        quantidade_disponivel: novaQuantidadeDisponivel,
                        autor: livro.autor || existente.autor,
                        isbn: livro.isbn || existente.isbn,
                        categoria: livro.categoria || existente.categoria,
                        prateleira: livro.prateleira || existente.prateleira,
                        palavras_chave: livro.palavras_chave?.length ? livro.palavras_chave : existente.palavras_chave,
                        alt_text: livro.alt_text || existente.alt_text,
                    })
                    .eq("id", existente.id)
                    .select()
                    .single();

                if (error) throw error;
                return { action: "updated", data };
            } else {
                // Novo livro - Buscar menor ID disponível
                const novoId = await this.getProximoIdDisponivel();
                livro.id = novoId;
                livro.quantidade_disponivel = livro.quantidade_total;
                livro.data_cadastro = new Date().toISOString();

                const { data, error } = await supabase
                    .from("livros")
                    .insert([livro])
                    .select()
                    .single();

                if (error) throw error;
                return { action: "added", data };
            }
        } catch (error) {
            console.error("Erro ao salvar livro:", error);
            throw error;
        }
    },

    async atualizarLivro(livro) {
        try {
            livro = padronizarObjeto(livro);
            
            // Recalcular disponibilidade baseada nos empréstimos ativos
            const { count, error: countError } = await supabase
                .from("emprestimos")
                .select("*", { count: 'exact', head: true })
                .eq("livro_id", livro.id)
                .eq("status", "emprestado");
            
            if (countError) throw countError;
            
            livro.quantidade_disponivel = livro.quantidade_total - (count || 0);

            // imagem_url: atualiza SOMENTE se fornecida explicitamente no payload (null limpa, string salva)
            // pdf_url: URL de texto simples — atualiza se fornecida no payload
            const { imagem_url, pdf_url, ...livroSemImagem } = livro;
            const updatePayload = { ...livroSemImagem };
            if (imagem_url !== undefined) updatePayload.imagem_url = imagem_url; // null limpa, string salva
            if (pdf_url !== undefined) updatePayload.pdf_url = pdf_url; // null limpa, string salva

            const { data, error } = await supabase
                .from("livros")
                .update(updatePayload)
                .eq("id", livro.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao atualizar livro:", error);
            throw error;
        }
    },

    async excluirLivro(id) {
        try {
            // Bloquear se há empréstimos ativos — devem ser excluídos primeiro
            const { data: ativos, error: empError } = await supabase
                .from("emprestimos")
                .select("id, nome_aluno, data_emprestimo")
                .eq("livro_id", id)
                .eq("status", "emprestado");

            if (empError) throw empError;

            if (ativos && ativos.length > 0) {
                const lista = ativos.map(e => {
                    const data = e.data_emprestimo
                        ? new Date(e.data_emprestimo).toLocaleDateString("pt-BR")
                        : "\u2014";
                    return "\u2022 " + e.nome_aluno + " (desde " + data + ")";
                }).join("\n");
                throw new Error(
                    "IMPOSSÍVEL EXCLUIR: EXISTEM " + ativos.length + " EMPRÉSTIMO(S) ATIVO(S):\n" + lista + "\n\nExclua o(s) empréstimo(s) primeiro."
                );
            }

            // Buscar livro para saber se tem capa/PDF no IA
            const { data: livro } = await supabase
                .from("livros")
                .select("imagem_url, pdf_url")
                .eq("id", id)
                .single();

            // Excluir histórico de empréstimos (devolvidos) do livro
            await supabase.from("emprestimos").delete().eq("livro_id", id);

            // Excluir capa do IA se existir
            if (livro && livro.imagem_url) {
                await this._iaDelete(`capa-${id}.jpg`);
            }

            // Excluir PDF do IA se existir
            if (livro && livro.pdf_url) {
                await this._iaDelete(`pdf-${id}.pdf`);
            }

            const { error } = await supabase.from("livros").delete().eq("id", id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Erro ao excluir livro:", error.message);
            throw error;
        }
    },

    // ========================================================================
    // FUNÇÕES PARA EMPRÉSTIMOS
    // ========================================================================
    async registrarEmprestimo(emprestimo) {
        try {
            emprestimo = padronizarObjeto(emprestimo);
            
            const { data: livro, error: livroError } = await supabase
                .from("livros")
                .select("*")
                .eq("id", emprestimo.livro_id)
                .single();

            if (livroError || !livro || livro.quantidade_disponivel <= 0) {
                throw new Error("LIVRO INDISPONÍVEL OU NÃO ENCONTRADO");
            }

            emprestimo.status = "emprestado";

            if (emprestimo.sem_data_definida) {
                emprestimo.data_prevista_devolucao = null;
                emprestimo.dias_emprestimo = 0;
            } else {
                // Usa a data do empréstimo como base (suporta registros retroativos)
                const baseDate = emprestimo.data_emprestimo
                    ? new Date(emprestimo.data_emprestimo)
                    : new Date();
                const dataPrevista = new Date(baseDate);
                dataPrevista.setDate(dataPrevista.getDate() + parseInt(emprestimo.dias_emprestimo));
                emprestimo.data_prevista_devolucao = dataPrevista.toISOString();
            }

            const { data: emprestimoData, error: emprestimoError } = await supabase
                .from("emprestimos")
                .insert([emprestimo])
                .select()
                .single();

            if (emprestimoError) throw emprestimoError;

            // Disponibilidade atualizada automaticamente pelo trigger ao inserir o empréstimo

            return emprestimoData.id;
        } catch (error) {
            console.error("Erro ao registrar empréstimo:", error);
            throw error;
        }
    },

    async atualizarEmprestimo(emprestimo) {
        try {
            const updateData = {};
            
            if (emprestimo.nome_aluno) updateData.nome_aluno = String(emprestimo.nome_aluno).toUpperCase();
            if (emprestimo.sexo) updateData.sexo = String(emprestimo.sexo);
            if (emprestimo.ano_aluno !== undefined) updateData.ano_aluno = parseInt(emprestimo.ano_aluno);
            if (emprestimo.turma_aluno) updateData.turma_aluno = String(emprestimo.turma_aluno).toUpperCase();
            if (emprestimo.dias_emprestimo !== undefined) updateData.dias_emprestimo = parseInt(emprestimo.dias_emprestimo);
            if (emprestimo.sem_data_definida !== undefined) updateData.sem_data_definida = emprestimo.sem_data_definida;
            
            if (emprestimo.sem_data_definida) {
                updateData.data_prevista_devolucao = null;
            } else if (emprestimo.data_prevista_devolucao) {
                // Data já calculada pelo caller (ex: renovar)
                updateData.data_prevista_devolucao = emprestimo.data_prevista_devolucao;
            } else if (emprestimo.dias_emprestimo) {
                const dataCalc = new Date();
                dataCalc.setDate(dataCalc.getDate() + parseInt(emprestimo.dias_emprestimo));
                updateData.data_prevista_devolucao = dataCalc.toISOString();
            }
            
            const { data, error } = await supabase
                .from("emprestimos")
                .update(updateData)
                .eq("id", emprestimo.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    async excluirEmprestimo(emprestimoId) {
        try {
            const { data: emprestimo, error: empError } = await supabase
                .from("emprestimos")
                .select("*")
                .eq("id", emprestimoId)
                .single();

            if (empError) throw empError;

            // Disponibilidade atualizada automaticamente pelo trigger ao excluir o empréstimo

            const { error } = await supabase.from("emprestimos").delete().eq("id", emprestimoId);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Erro ao excluir empréstimo:", error);
            throw error;
        }
    },

    async registrarDevolucao(emprestimoId, dataDevolucao) {
        try {
            const { data: emprestimo, error: empError } = await supabase
                .from("emprestimos")
                .select("*")
                .eq("id", emprestimoId)
                .single();

            if (empError) throw empError;

            const { data, error } = await supabase
                .from("emprestimos")
                .update({
                    status: "devolvido",
                    data_devolucao: dataDevolucao
                })
                .eq("id", emprestimoId)
                .select()
                .single();

            if (error) throw error;

            // Disponibilidade atualizada automaticamente pelo trigger no banco

            return data;
        } catch (error) {
            console.error("Erro ao registrar devolução:", error);
            throw error;
        }
    },

    async getEmprestimos() {
        try {
            const { data, error } = await supabase
                .from("emprestimos")
                .select("*")
                .order("data_emprestimo", { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Erro ao listar empréstimos:", error);
            throw error;
        }
    },

    // Histórico completo de uma pessoa (ativos + devolvidos) com título do livro
    async getHistoricoPessoa(nomeAluno) {
        try {
            const { data, error } = await supabase
                .from("emprestimos")
                .select("id, livro_id, status, data_emprestimo, data_devolucao, livros(titulo)")
                .ilike("nome_aluno", nomeAluno)
                .order("data_emprestimo", { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            return [];
        }
    },

    // Busca empréstimos ativos com dados do livro (join via FK)
    async getEmprestimosAtivosComLivro() {
        try {
            const { data, error } = await supabase
                .from("emprestimos")
                .select("*, livros(titulo, autor, prateleira)")
                .eq("status", "emprestado")
                .order("ano_aluno", { ascending: true })
                .order("turma_aluno", { ascending: true })
                .order("nome_aluno",  { ascending: true });
            if (error) throw error;
            const hoje = new Date(); hoje.setHours(0,0,0,0);
            return (data || []).map(e => {
                if (e.data_prevista_devolucao) {
                    const d = new Date(e.data_prevista_devolucao); d.setHours(0,0,0,0);
                    if (d < hoje) e.atrasado = true;
                }
                return e;
            });
        } catch (error) {
            console.error("Erro ao buscar empréstimos com livro:", error);
            throw error;
        }
    },

    async getEmprestimosAtivos(livroId = null) {
        try {
            let query = supabase
                .from("emprestimos")
                .select("*")
                .eq("status", "emprestado")
                .order("data_emprestimo", { ascending: false });

            if (livroId) {
                query = query.eq("livro_id", livroId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const hoje = new Date();
            return (data || []).map((e) => {
                const dataPrevista = e.data_prevista_devolucao ? new Date(e.data_prevista_devolucao) : null;
                // Zerar horas para comparação justa de data
                const hojeZero = new Date(); hojeZero.setHours(0,0,0,0);
                if (dataPrevista) {
                    dataPrevista.setHours(0,0,0,0);
                    if (dataPrevista < hojeZero) e.atrasado = true;
                }
                return e;
            });
        } catch (error) {
            console.error("Erro ao listar empréstimos ativos:", error);
            throw error;
        }
    },

    // ========================================================================
    // REALTIME
    // ========================================================================
    onLivrosChange(callback) {
        return supabase
            .channel('livros-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'livros' }, callback)
            .subscribe();
    },


    // ── Internet Archive — via Edge Function bibvania (chaves seguras no servidor) ──
    async _iaEdgeFunction(payload) {
        const session = await supabase.auth.getSession();
        const token   = session?.data?.session?.access_token ?? supabaseKey;
        const res = await fetch(`${supabaseUrl}/functions/v1/bibvania`, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Edge Function erro ${res.status}`);
        return json;
    },

    async _iaUpload(filename, bytes, contentType) {
        // Converte bytes para base64 em chunks para evitar stack overflow com imagens grandes
        const tipo    = contentType.startsWith('image') ? 'capa' : 'pdf';
        const livroId = parseInt(filename.replace(/\D+/g, ''), 10);
        let b64 = '';
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
            b64 += btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
        }
        const json = await this._iaEdgeFunction({ acao: 'upload', tipo, livroId, arquivo: b64 });
        return json.url;
    },

    async _iaDelete(filename) {
        const tipo    = filename.startsWith('capa') ? 'capa' : 'pdf';
        const livroId = parseInt(filename.replace(/\D+/g, ''), 10);
        await this._iaEdgeFunction({ acao: 'excluir', tipo, livroId }).catch(() => {});
    },

    // ── CAPAS ─────────────────────────────────────────────────────────────────
    async uploadCapa(livroId, base64url) {
        try {
            const base64 = base64url.includes(',') ? base64url.split(',')[1] : base64url;
            const bytes  = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const url    = await this._iaUpload(`capa-${livroId}.jpg`, bytes, 'image/jpeg');
            const { error } = await supabase
                .from("livros")
                .update({ imagem_url: url })
                .eq("id", livroId);
            if (error) throw error;
            return url;
        } catch (error) {
            console.error("Erro ao salvar capa:", error);
            throw error;
        }
    },

    async removerCapa(livroId) {
        try {
            await this._iaDelete(`capa-${livroId}.jpg`);
            await supabase.from("livros").update({ imagem_url: null }).eq("id", livroId);
        } catch (error) {
            console.error("Erro ao remover capa:", error);
            throw error;
        }
    },

    // ── PDFs ──────────────────────────────────────────────────────────────────
    async uploadPdf(livroId, base64url) {
        try {
            const base64 = base64url.includes(',') ? base64url.split(',')[1] : base64url;
            const bytes  = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const url    = await this._iaUpload(`pdf-${livroId}.pdf`, bytes, 'application/pdf');
            const { error } = await supabase
                .from("livros")
                .update({ pdf_url: url })
                .eq("id", livroId);
            if (error) throw error;
            return url;
        } catch (error) {
            console.error("Erro ao salvar PDF:", error);
            throw error;
        }
    },

    async removerPdf(livroId) {
        try {
            await this._iaDelete(`pdf-${livroId}.pdf`);
            await supabase.from("livros").update({ pdf_url: null }).eq("id", livroId);
        } catch (error) {
            console.error("Erro ao remover PDF:", error);
            throw error;
        }
    },

    onEmprestimosChange(callback) {
        return supabase
            .channel('emprestimos-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emprestimos' }, callback)
            .subscribe();
    },

    onPessoasChange(callback) {
        return supabase
            .channel('pessoas-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pessoas' }, callback)
            .subscribe();
    },

    // ── PESSOAS (alunos e funcionários) ──────────────────────────────────────
    async getPessoas() {
        const { data, error } = await supabase
            .from('pessoas')
            .select('*')
            .order('nome', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async salvarPessoa(pessoa) {
        const { data, error } = await supabase
            .from('pessoas')
            .insert([pessoa])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async excluirPessoa(id) {
        // Buscar nome da pessoa para deletar empréstimos associados
        const { data: pessoa } = await supabase
            .from('pessoas').select('nome').eq('id', id).single();
        if (pessoa && pessoa.nome) {
            await supabase.from('emprestimos')
                .delete().ilike('nome_aluno', pessoa.nome.trim());
        }
        const { error } = await supabase.from('pessoas').delete().eq('id', id);
        if (error) throw error;
    },

    async atualizarPessoa(pessoa) {
        const { id, ...campos } = pessoa;
        const { data, error } = await supabase
            .from('pessoas')
            .update(campos)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// Tornar DB global para acesso nos scripts das páginas
window.DB = DB;
export default DB;
