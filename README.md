# BibVania Online

Sistema de gerenciamento de biblioteca escolar da **EMTI Professora Maria Vânia Farias Linhares**, desenvolvido com HTML, CSS e JavaScript puro, usando **Supabase** como banco de dados em nuvem e hospedado via **GitHub Pages**.

🌐 [Acessar o site](https://ruanolima.github.io/BibVania/) · **Versão 1.1** · © 2026 Ruan Oliveira Lima · [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

---

## Funcionalidades

### Site dos Leitores (`index.html`)
- Consulta ao acervo completo com busca por título, autor, ISBN, sinopse, editora e nome de colaborador
- Filtro por categoria com abas deslizantes
- Capa do livro exibida à esquerda de cada card (logo da biblioteca como placeholder quando não há capa); clique na capa para ampliar
- Cada livro exibe: autor, colaboradores, editora (ou "Publicação Independente"), ISBN, acabamento, categoria, prateleira e disponibilidade
- Empréstimos ativos visíveis com nome do leitor e prazo de devolução
- Destaque visual para livros com devolução atrasada (⚠️)
- Atualização automática via Supabase Realtime + refresh periódico a cada 30 segundos como segurança
- Modo escuro, ajuste de tamanho de fonte e acessibilidade via VLibras (Libras)

### Área do Bibliotecário (`admin.html`)
Acesso restrito por login. Organizada em três abas:

**CADASTRO**
- Campos: ISBN, acabamento (Grampeado / Espiral / Brochura / Capa Dura), título, autor, colaboradores ilimitados (função + nome), editora ou checkbox de Publicação Independente, prateleira (obrigatório), categoria, quantidade total e sinopse
- Detecção automática de título duplicado — permite somar quantidade ao exemplar existente
- IDs atribuídos automaticamente pelo menor número disponível

**EMPRÉSTIMO**
- Busca de livro por título ou ID
- Suporte a alunos (máximo 1 empréstimo ativo por vez) e professores/funcionários (ilimitado)
- Campos: nome, sexo, ano e turma (aluno) ou nome e sexo (professor/funcionário)
- Prazo em dias ou opção "Sem data definida"
- Ações nos empréstimos ativos: Devolver, Editar, Renovar, Excluir

**ACERVO**
- Busca e filtro por categoria
- Livros ordenados do mais recente para o mais antigo (por data de cadastro)
- Capa do livro: no cadastro e na edição há um retângulo de pré-visualização com opções de escolher, trocar ou excluir a imagem antes de salvar; se não houver capa, exibe a logo da biblioteca; clique na capa para ampliar em lightbox
- Ações por livro: editar todos os campos ou excluir (bloqueado se houver empréstimos ativos)
- Lista de empréstimos ativos por livro, com identificação de atrasos
- Atualização imediata do acervo após cada ação (empréstimo, devolução, edição, exclusão)
- Feedback visual "SALVANDO..." em todos os botões de confirmação

### Relatórios (`relatorios.html`)
- Acesso direto do painel do bibliotecário
- Geração de relatório geral (anual) ou mensal exportado em arquivo `.txt`
- Inclui: acervo completo, histórico de empréstimos, rankings por sala e livros mais lidos, livros atrasados, livros sem prazo e pendências

---

## Arquivos do Projeto

| Arquivo | Publicar no GitHub | Descrição |
|---|---|---|
| `index.html` | ✅ | Site público dos leitores |
| `login.html` | ✅ | Página de autenticação da bibliotecária |
| `admin.html` | ✅ | Área do bibliotecário |
| `relatorios.html` | ✅ | Gerador de relatórios |
| `database.js` | ✅ | Todas as funções de comunicação com o Supabase |
| `style.css` | ✅ | Estilos globais (tema claro/escuro, responsividade) |
| `logo.png` | ✅ | Logotipo exibido no cabeçalho |
| `favicon.png` | ✅ | Ícone da aba do navegador |
| `supabase_setup.sql` | ⬜ opcional | Script de configuração completa do banco |
| `README.md` | ⬜ opcional | Documentação do projeto |
| `LICENCE.md` | ⬜ opcional | Licença do projeto |

---

## Banco de Dados (Supabase)

### Tabela `livros`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT | Identificador único (menor disponível) |
| `isbn` | TEXT | Código ISBN (opcional) |
| `acabamento` | TEXT | Grampeado / Espiral / Brochura / Capa Dura (opcional) |
| `titulo` | TEXT | Título do livro (obrigatório) |
| `autor` | TEXT | Autor principal (opcional) |
| `colaboradores` | JSONB | Array de `{ funcao, nome }` |
| `editora` | TEXT | Nome da editora (opcional) |
| `pub_independente` | BOOLEAN | Publicação sem editora comercial |
| `prateleira` | TEXT | Localização física — 1 letra + 1 número, ex: C3 (obrigatório) |
| `categoria` | TEXT | Uma das 13 categorias fixas |
| `sinopse` | TEXT | Resumo do livro (opcional) |
| `quantidade_total` | INTEGER | Total de exemplares |
| `quantidade_disponivel` | INTEGER | Exemplares disponíveis (calculado automaticamente por trigger) |
| `imagem_url` | TEXT | Capa do livro em Base64 (opcional, salvo diretamente no banco) |
| `data_cadastro` | TIMESTAMP | Data/hora do cadastro (automático) |

### Tabela `emprestimos`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGSERIAL | Identificador único |
| `livro_id` | BIGINT | Referência ao livro |
| `nome_aluno` | TEXT | Nome do leitor |
| `sexo` | CHAR(1) | M ou F |
| `ano_aluno` | INTEGER | Ano escolar (0 = professor/funcionário) |
| `turma_aluno` | TEXT | Turma ou `PROF/FUNC` |
| `status` | TEXT | `emprestado` ou `devolvido` |
| `dias_emprestimo` | INTEGER | Dias concedidos |
| `sem_data_definida` | BOOLEAN | Empréstimo sem prazo |
| `data_emprestimo` | TIMESTAMP | Data/hora do empréstimo (automático) |
| `data_prevista_devolucao` | TIMESTAMP | Prazo de devolução |
| `data_devolucao` | TIMESTAMP | Data efetiva da devolução |

### Trigger automático
O `supabase_setup.sql` instala um trigger que recalcula `quantidade_disponivel` automaticamente após qualquer inserção, atualização ou exclusão de empréstimo — garantindo que a disponibilidade nunca fique incorreta.

---

## Categorias de Livros

| Categoria |
|---|
| EDUCAÇÃO INCLUSIVA |
| INFANTIL (1º AO 4º) |
| INFANTOJUVENIL (5º E 6º) |
| JUVENIL (7º AO 9º) |
| DIDÁTICO (1º AO 4º) |
| DIDÁTICO (5º) |
| DIDÁTICO (6º) |
| DIDÁTICO (7º) |
| DIDÁTICO (8º) |
| DIDÁTICO (9º) |
| DE REFERÊNCIA |
| CLÁSSICOS & REGIONAIS |
| POESIA |

---

## Instalação do Zero

### 1. Baixar o projeto
Clone ou baixe os arquivos do repositório.

### 2. Configurar o Supabase
1. Crie uma conta em [supabase.com](https://supabase.com/) e inicie um novo projeto
2. Em **Project Settings → API**, copie a **URL do Projeto** e a **Chave Anon**
3. Vá em **SQL Editor**, cole o conteúdo de `supabase_setup.sql` e execute — cria tabelas, segurança e triggers em uma única execução
4. Vá em **Database → Replication** e habilite o Realtime para `livros` e `emprestimos`
5. Vá em **Authentication → Users → Add User → Create new user** e cadastre e-mail e senha da bibliotecária
   > A senha é **case-sensitive**

### 3. Conectar ao Supabase
Abra `database.js` e substitua as linhas 4–5:
```javascript
const supabaseUrl = "https://seu-projeto.supabase.co";
const supabaseKey = "sua-chave-anon-aqui";
```

### 4. Publicar no GitHub Pages
1. Suba os arquivos marcados com ✅ na tabela acima para um repositório no GitHub
2. Vá em **Settings → Pages** e defina a source para o branch principal
3. O site ficará disponível em `https://seu-usuario.github.io/nome-do-repositorio/`

