# 📚 BibVania — Sistema de Biblioteca Escolar Gratuito

**BibVania** é um sistema de gerenciamento de biblioteca escolar **gratuito, open source, rápido e fácil de usar** — funciona direto no navegador, sem instalar nada, sem servidor próprio e sem custo.

🌐 **[Site dos Leitores](https://ruanolima.github.io/BibVania/)**
&nbsp;·&nbsp; 📥 [Baixar projeto](https://github.com/ruanolima/BibVania/archive/refs/heads/main.zip)
&nbsp;·&nbsp; ⭐ Gostou? Deixe uma estrela!

> Desenvolvido para a **EMTI Professora Maria Vânia Farias Linhares** · Versão 1.1 · © 2026 Ruan Oliveira Lima · [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

---

## ✨ Por que usar o BibVania?

| | BibVania | Sistemas pagos |
|---|---|---|
| **Custo** | 🟢 Gratuito | 🔴 Mensalidade |
| **Instalação** | 🟢 Nenhuma | 🔴 Servidor ou download |
| **Hospedagem** | 🟢 GitHub Pages (grátis) | 🔴 Paga |
| **Banco de dados** | 🟢 Supabase (grátis) | 🔴 Pago |
| **Acesso** | 🟢 Qualquer dispositivo | 🟡 Depende do sistema |
| **Código** | 🟢 Aberto e modificável | 🔴 Fechado |

---

## 🆕 O que mudou da versão 1.0 para a 1.1

| Área | Versão 1.0 | Versão 1.1 |
|---|---|---|
| **Cadastro de livros** | Campos básicos (título, autor, ISBN, categoria, quantidade, sinopse) | + Editora, prateleira, acabamento, colaboradores, capa com pré-visualização, publicação independente |
| **Busca no acervo** | ID, título, autor, ISBN, sinopse | + Editora e colaboradores |
| **Pessoas** | Sem cadastro de pessoas | ✅ Aba "Cadastrar Pessoas" e "Lista de Pessoas" com editar e excluir |
| **Empréstimos** | Registro livre por nome digitado | Só para **pessoas cadastradas**; autocomplete com sugestão de nome, ano, turma e sexo |
| **Validação de empréstimo** | Verifica duplicidade de aluno | + Verifica se a pessoa está cadastrada; + verifica se o livro existe |
| **Relatórios** | Anual com 6 seções detalhadas | Anual e **mensal**; 3 seções objetivas: acervo por categoria, top 15 livros mais lidos com leitores, destaque de leitura por sala |
| **Tempo real** | Realtime na página de leitores | Realtime em **todas as páginas**, incluindo relatórios |
| **Acervo — carregamento** | Cards e capas em lote | Cards e capas **1 por 1**, capa junto com o card, sem piscar |
| **Navegação** | Sem restauração de aba | Restaura a aba aberta ao recarregar; recarrega ao voltar de outra página (bfcache) |
| **Acessibilidade** | Controle de fonte, modo escuro, VLibras | + Skip links, ARIA tabpanel, aria-live, focus trap em modais, lightbox com foco gerenciado |
| **SEO** | Metas básicas em index.html | JSON-LD Schema.org em todas as páginas, keywords, canonical, Open Graph e Twitter Card completos |
| **Arquivo SQL** | `supabase_schema.sql` | Renomeado para `supabase_setup.sql`; inclui tabela `pessoas` e coluna `alt_text` |

---

## 🖥️ O que o sistema faz

### Para os leitores — `index.html` (público)
- 🔍 **Busca o acervo** por título, autor, ISBN, sinopse, editora ou colaborador
- 🗂️ **Filtra por categoria** com abas deslizantes
- 📖 Exibe disponibilidade em tempo real de cada livro
- 🖼️ Mostra capa do livro — carregamento 1 por 1, capa junto com o card
- ⚠️ Destaque automático para livros com devolução atrasada
- 🌙 Modo escuro, ajuste de fonte e acessibilidade em Libras (VLibras)
- ⚡ Atualização em tempo real via Supabase Realtime

### Para o bibliotecário — `admin.html` (acesso com senha)

**Aba CADASTRO** — Cadastra livros com ISBN, acabamento, título, autor, colaboradores, editora, prateleira, categoria, quantidade, sinopse e capa com pré-visualização

**Aba EMPRÉSTIMO** — Registra saída para alunos (limite 1 ativo) e professores/funcionários; prazo em dias ou sem data; autocomplete de pessoas cadastradas; valida existência do livro e da pessoa

**Aba ACERVO** — Edita e exclui livros; lista empréstimos ativos por livro; detecta atrasos

**Aba DEVOLUÇÕES** — Empréstimos agrupados por turma; badge "DEVOLVER HOJE!"; ações de devolver, editar, renovar e excluir

**Aba CADASTRAR PESSOAS** — Cadastra alunos (nome, sexo, ano, turma) e funcionários/professores (nome, sexo)

**Aba LISTA DE PESSOAS** — Lista alunos agrupados por turma e funcionários; permite editar e excluir

### Relatórios — `relatorios.html`
- Geração automática ao abrir a página e ao mudar os filtros
- Atualização em tempo real — reflete sempre o estado atual do banco
- Exporta `.txt` **anual** ou **mensal** com:
  1. Livros cadastrados por categoria
  2. Os 15 livros mais lidos (por alunos), com lista de quem pegou cada um
  3. Destaque de leitura por sala — aluno e aluna que mais levaram livros, com títulos

---

## 🚀 Instalação em 15 minutos

### 1. Banco de dados (Supabase — gratuito)
1. Crie conta em [supabase.com](https://supabase.com/) e inicie um projeto
2. Copie a **URL** e a **Chave Anon** em *Project Settings → API*
3. Execute `supabase_setup.sql` no *SQL Editor*
4. Habilite Realtime em *Database → Replication* para `livros`, `emprestimos` e `pessoas`
5. Cadastre a bibliotecária em *Authentication → Users → Add User*

### 2. Conectar ao banco
Em `database.js`, linhas 12–13:
```javascript
const supabaseUrl = "https://seu-projeto.supabase.co";
const supabaseKey = "sua-chave-anon-aqui";
```

### 3. Publicar no GitHub Pages (gratuito)
1. Suba os arquivos para um repositório no GitHub
2. *Settings → Pages* → source: branch principal
3. Site disponível em `https://seu-usuario.github.io/nome-do-repo/`

---

## 📁 Arquivos

| Arquivo | Publicar | Descrição |
|---|---|---|
| `index.html` | ✅ | Site público dos leitores |
| `login.html` | ✅ | Autenticação |
| `admin.html` | ✅ | Painel do bibliotecário |
| `relatorios.html` | ✅ | Relatórios |
| `database.js` | ✅ | Funções Supabase |
| `bibvania-utils.js` | ✅ | Utilitários (busca por voz) |
| `style.css` | ✅ | Estilos globais |
| `logo.png` | ✅ | Logo |
| `favicon.png` | ✅ | Ícone |
| `og-image.png` | ✅ | Imagem Open Graph |
| `supabase_setup.sql` | ⬜ | Script do banco |
| `sitemap.xml` | ✅ | Mapa do site |
| `robots.txt` | ✅ | Diretivas de indexação |
| `README.md` | ⬜ | Esta documentação |

---

## 📚 Categorias de Livros

EDUCAÇÃO INCLUSIVA · INFANTIL (1º AO 4º) · INFANTOJUVENIL (5º E 6º) · JUVENIL (7º AO 9º) · DIDÁTICO (1º AO 4º) · DIDÁTICO (5º) · DIDÁTICO (6º) · DIDÁTICO (7º) · DIDÁTICO (8º) · DIDÁTICO (9º) · DE REFERÊNCIA · CLÁSSICOS & REGIONAIS · POESIA

---

## 🛠️ Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github&logoColor=white)

HTML5 · CSS3 · JavaScript puro (sem frameworks) · Supabase (PostgreSQL + Realtime) · GitHub Pages

---

## 🔧 Resolução de problemas

| Problema | Solução |
|---|---|
| Acervo não carrega | Verifique credenciais em `database.js` e recarregue |
| Login não funciona | Confirme e-mail em *Authentication → Users* (senha é case-sensitive) |
| Disponibilidade incorreta | Execute `supabase_setup.sql` para reinstalar o trigger |
| Dados não atualizam | Habilite Realtime (*Database → Replication*) para `livros`, `emprestimos` e `pessoas` |
| Empréstimo bloqueado | Certifique-se de que a pessoa está cadastrada na aba "Cadastrar Pessoas" |

### Atualização do banco (versão 1.0 → 1.1)

```sql
-- Novas colunas da tabela livros
ALTER TABLE livros ADD COLUMN IF NOT EXISTS colaboradores JSONB DEFAULT '[]';
ALTER TABLE livros ADD COLUMN IF NOT EXISTS editora TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS pub_independente BOOLEAN DEFAULT FALSE;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS prateleira TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS acabamento TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Nova tabela de pessoas (alunos e funcionários)
CREATE TABLE IF NOT EXISTS pessoas (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    sexo CHAR(1) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('aluno', 'funcionario')),
    ano_aluno INTEGER,
    turma_aluno TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📄 Licença

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) · **Ruan Oliveira Lima** · [github.com/ruanolima](https://github.com/ruanolima)

Use, copie, modifique e distribua — desde que dê crédito ao autor.

---

*sistema de biblioteca escolar gratuito · open source · sem instalação · gerenciamento de acervo · controle de empréstimos · escola pública · HTML CSS JavaScript Supabase GitHub Pages*
