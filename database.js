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
    "EDUCAÇÃO INCLUSIVA",
    "INFANTIL (1º AO 4º)",
    "INFANTOJUVENIL (5º E 6º)",
    "JUVENIL (7º AO 9º)",
    "DIDÁTICO (1º AO 4º)",
    "DIDÁTICO (5º)",
    "DIDÁTICO (6º)",
    "DIDÁTICO (7º)",
    "DIDÁTICO (8º)",
    "DIDÁTICO (9º)",
    "DE REFERÊNCIA",
    "CLÁSSICOS & REGIONAIS",
    "POESIA"
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
        window.location.href = 'login.html';
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async checkAuth() {
        const session = await this.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        return session;
    },

    async redirectIfLoggedIn() {
        const session = await this.getSession();
        if (session) {
            window.location.href = 'admin.html';
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
                .select("*")
                .order("id", { ascending: true });
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

    async getProximoIdDisponivel() {
        const { data, error } = await supabase.from("livros").select("id").order("id", { ascending: true });
        if (error) throw error;
        
        const ids = data.map(l => l.id);
        let proximoId = 1;
        while (ids.includes(proximoId)) {
            proximoId++;
        }
        return proximoId;
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
                        sinopse: livro.sinopse || existente.sinopse
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

            const { data, error } = await supabase
                .from("livros")
                .update(livro)
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
            // Verificar se existem empréstimos ativos para este livro
            const { data: emprestimos, error: empError } = await supabase
                .from("emprestimos")
                .select("*")
                .eq("livro_id", id)
                .eq("status", "emprestado");
            
            if (empError) throw empError;
            
            if (emprestimos && emprestimos.length > 0) {
                throw new Error("IMPOSSÍVEL EXCLUIR: EXISTEM EMPRÉSTIMOS ATIVOS PARA ESTE LIVRO");
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
                const dataPrevista = new Date();
                dataPrevista.setDate(dataPrevista.getDate() + parseInt(emprestimo.dias_emprestimo));
                emprestimo.data_prevista_devolucao = dataPrevista.toISOString();
            }

            const { data: emprestimoData, error: emprestimoError } = await supabase
                .from("emprestimos")
                .insert([emprestimo])
                .select()
                .single();

            if (emprestimoError) throw emprestimoError;

            // Atualizar disponibilidade
            await supabase
                .from("livros")
                .update({ quantidade_disponivel: livro.quantidade_disponivel - 1 })
                .eq("id", livro.id);

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

            if (emprestimo.status === "emprestado") {
                const { data: livro } = await supabase.from("livros").select("*").eq("id", emprestimo.livro_id).single();
                if (livro) {
                    await supabase.from("livros").update({ quantidade_disponivel: livro.quantidade_disponivel + 1 }).eq("id", livro.id);
                }
            }

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

            // Atualizar disponibilidade do livro
            const { data: livro } = await supabase.from("livros").select("*").eq("id", emprestimo.livro_id).single();
            if (livro) {
                await supabase.from("livros").update({
                    quantidade_disponivel: livro.quantidade_disponivel + 1
                }).eq("id", livro.id);
            }

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

    onEmprestimosChange(callback) {
        return supabase
            .channel('emprestimos-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emprestimos' }, callback)
            .subscribe();
    }
};

// Tornar DB global para acesso nos scripts das páginas
window.DB = DB;
export default DB;
