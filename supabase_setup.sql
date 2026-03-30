-- ============================================================================
-- BIBVANIA ONLINE — CONFIGURAÇÃO DO BANCO DE DADOS v1.2
-- Execute este script no SQL Editor do Supabase para configuração inicial.
-- Seguro executar em bancos já existentes — todos os comandos usam IF NOT EXISTS.
-- ============================================================================

-- 0. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS unaccent; -- busca sem acento (usada no script de limpeza)

-- 1. TABELA DE LIVROS
CREATE TABLE IF NOT EXISTS livros (
    id BIGINT PRIMARY KEY,
    isbn TEXT,
    imagem_url TEXT,
    pdf_url TEXT,
    titulo TEXT NOT NULL,
    autor TEXT,
    prateleira TEXT,
    categoria TEXT,
    palavras_chave TEXT[] DEFAULT '{}',
    alt_text TEXT,
    quantidade_total INTEGER NOT NULL DEFAULT 1,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 1,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE EMPRÉSTIMOS
CREATE TABLE IF NOT EXISTS emprestimos (
    id BIGSERIAL PRIMARY KEY,
    livro_id BIGINT REFERENCES livros(id) ON DELETE CASCADE,
    nome_aluno TEXT NOT NULL,
    sexo CHAR(1),
    ano_aluno INTEGER,
    turma_aluno TEXT,
    data_emprestimo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_prevista_devolucao TIMESTAMP WITH TIME ZONE,
    data_devolucao TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'emprestado',
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
    data_exclusao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SEGURANÇA (RLS)
ALTER TABLE livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros_excluidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura autenticada de livros_excluidos" ON livros_excluidos;
DROP POLICY IF EXISTS "Escrita autenticada de livros_excluidos" ON livros_excluidos;
CREATE POLICY "Leitura autenticada de livros_excluidos" ON livros_excluidos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Escrita autenticada de livros_excluidos" ON livros_excluidos FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura pública de livros" ON livros;
DROP POLICY IF EXISTS "Escrita autenticada de livros" ON livros;
CREATE POLICY "Leitura pública de livros" ON livros FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de livros" ON livros FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura pública de emprestimos" ON emprestimos;
DROP POLICY IF EXISTS "Escrita autenticada de emprestimos" ON emprestimos;
CREATE POLICY "Leitura pública de emprestimos" ON emprestimos FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de emprestimos" ON emprestimos FOR ALL USING (auth.role() = 'authenticated');

-- 5. TRIGGER DE DISPONIBILIDADE
-- Recalcula quantidade_disponivel automaticamente a cada mudança nos empréstimos.
CREATE OR REPLACE FUNCTION recalcular_disponivel()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE livros SET quantidade_disponivel = quantidade_total - (
            SELECT COUNT(*) FROM emprestimos
            WHERE livro_id = OLD.livro_id AND status = 'emprestado'
        ) WHERE id = OLD.livro_id;
        RETURN OLD;
    ELSE
        UPDATE livros SET quantidade_disponivel = quantidade_total - (
            SELECT COUNT(*) FROM emprestimos
            WHERE livro_id = NEW.livro_id AND status = 'emprestado'
        ) WHERE id = NEW.livro_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_atualizar_disponivel ON emprestimos;
CREATE TRIGGER trigger_atualizar_disponivel
AFTER INSERT OR UPDATE OR DELETE ON emprestimos
FOR EACH ROW EXECUTE FUNCTION recalcular_disponivel();

-- 6. COLUNAS ADICIONAIS
-- Seguro executar mesmo se o banco já existia — IF NOT EXISTS evita erros.
ALTER TABLE livros ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS prateleira TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- 7. TABELA DE PESSOAS (alunos e funcionários)
CREATE TABLE IF NOT EXISTS pessoas (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    sexo CHAR(1) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('aluno', 'funcionario')),
    ano_aluno INTEGER,
    turma_aluno TEXT,
    pcd BOOLEAN DEFAULT FALSE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS pcd BOOLEAN DEFAULT FALSE;
DROP POLICY IF EXISTS "Leitura pública de pessoas" ON pessoas;
DROP POLICY IF EXISTS "Escrita autenticada de pessoas" ON pessoas;
CREATE POLICY "Leitura pública de pessoas" ON pessoas FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de pessoas" ON pessoas FOR ALL USING (auth.role() = 'authenticated');

-- 8. REALTIME
-- Habilita atualizações em tempo real para todas as tabelas.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'livros'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE livros;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'emprestimos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE emprestimos;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'pessoas'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE pessoas;
    END IF;
END $$;

-- 9. VERIFICAR REALTIME ATIVO
-- Execute para confirmar que as 3 tabelas estão com Realtime habilitado:
-- SELECT schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
