-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - BIBLIOTECA ESCOLAR v13
-- Execute este script no SQL Editor do seu projeto Supabase para garantir compatibilidade total.

-- 1. TABELA DE LIVROS
CREATE TABLE IF NOT EXISTS livros (
    id BIGINT PRIMARY KEY,
    isbn TEXT,
    titulo TEXT NOT NULL,
    autor TEXT,
    categoria TEXT NOT NULL,
    sinopse TEXT,
    quantidade_total INTEGER NOT NULL DEFAULT 1,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 1,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE EMPRÉSTIMOS
CREATE TABLE IF NOT EXISTS emprestimos (
    id BIGSERIAL PRIMARY KEY,
    livro_id BIGINT REFERENCES livros(id) ON DELETE CASCADE,
    nome_aluno TEXT NOT NULL,
    sexo CHAR(1), -- M, F ou P (Professor)
    ano_aluno INTEGER,
    turma_aluno TEXT,
    data_emprestimo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_prevista_devolucao TIMESTAMP WITH TIME ZONE,
    data_devolucao TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'emprestado', -- 'emprestado' ou 'devolvido'
    dias_emprestimo INTEGER,
    sem_data_definida BOOLEAN DEFAULT FALSE
);

-- 3. TABELA DE HISTÓRICO DE EXCLUSÃO
CREATE TABLE IF NOT EXISTS livros_excluidos (
    id BIGSERIAL PRIMARY KEY,
    livro_id BIGINT,
    titulo TEXT,
    autor TEXT,
    isbn TEXT,
    categoria TEXT,
    data_exclusao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.1 TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- Habilitar RLS
ALTER TABLE livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros_excluidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para LIVROS (Leitura pública, Escrita autenticada)
DROP POLICY IF EXISTS "Leitura pública de livros" ON livros;
DROP POLICY IF EXISTS "Escrita autenticada de livros" ON livros;
CREATE POLICY "Leitura pública de livros" ON livros FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de livros" ON livros FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para EMPRÉSTIMOS (Leitura pública, Escrita autenticada)
DROP POLICY IF EXISTS "Leitura pública de emprestimos" ON emprestimos;
DROP POLICY IF EXISTS "Escrita autenticada de emprestimos" ON emprestimos;
CREATE POLICY "Leitura pública de emprestimos" ON emprestimos FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de emprestimos" ON emprestimos FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para CONFIGURAÇÕES (Leitura pública, Escrita autenticada)
DROP POLICY IF EXISTS "Leitura pública de configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Escrita autenticada de configuracoes" ON configuracoes;
CREATE POLICY "Leitura pública de configuracoes" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de configuracoes" ON configuracoes FOR ALL USING (auth.role() = 'authenticated');

-- 5. HABILITAR REALTIME
-- Nota: Certifique-se de habilitar o Realtime para as tabelas 'livros' e 'emprestimos' no painel do Supabase (Database -> Replication).
