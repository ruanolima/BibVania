-- ============================================================================
-- BIBVANIA ONLINE — CONFIGURAÇÃO DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase para configuração inicial.
-- ============================================================================

-- 1. TABELA DE LIVROS
CREATE TABLE IF NOT EXISTS livros (
    id BIGINT PRIMARY KEY,
    isbn TEXT,
    acabamento TEXT,
    imagem_url TEXT,
    titulo TEXT NOT NULL,
    autor TEXT,
    colaboradores JSONB DEFAULT '[]',
    editora TEXT,
    pub_independente BOOLEAN DEFAULT FALSE,
    prateleira TEXT,
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
    categoria TEXT,
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
ALTER TABLE livros ADD COLUMN IF NOT EXISTS colaboradores JSONB DEFAULT '[]';
ALTER TABLE livros ADD COLUMN IF NOT EXISTS acabamento TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS editora TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS pub_independente BOOLEAN DEFAULT FALSE;
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
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de pessoas" ON pessoas;
DROP POLICY IF EXISTS "Escrita autenticada de pessoas" ON pessoas;
CREATE POLICY "Leitura pública de pessoas" ON pessoas FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada de pessoas" ON pessoas FOR ALL USING (auth.role() = 'authenticated');

-- 8. REALTIME
-- Após executar este script, acesse Database → Replication no painel do Supabase
-- e habilite o Realtime para as tabelas: 'livros', 'emprestimos' e 'pessoas'.
-- Alternativamente, execute os comandos abaixo:
ALTER PUBLICATION supabase_realtime ADD TABLE livros;
ALTER PUBLICATION supabase_realtime ADD TABLE emprestimos;
ALTER PUBLICATION supabase_realtime ADD TABLE pessoas;
