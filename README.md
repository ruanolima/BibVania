# BibVania Online v1.2

**Sistema de Biblioteca Escolar Digital**
EMTI Professora Maria Vânia Farias Linhares

> Desenvolvido por [Ruan Oliveira Lima](https://github.com/ruanolima) · Licença [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

---

## Sobre

BibVania Online é um sistema web para gerenciamento de biblioteca escolar, com acervo público, painel administrativo, controle de empréstimos, cadastro de pessoas, relatórios e cadastro rápido de livros com inteligência artificial. Roda 100% no navegador, sem servidor próprio.

---

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript vanilla (sem frameworks, sem build tools)
- **Banco de dados / Auth / Realtime:** [Supabase](https://supabase.com) (PostgreSQL)
- **IA — análise visual:** [Groq](https://groq.com) com modelo Llama 4 Scout (chave gratuita)
- **IA — metadados:** Google Books API (sem chave, uso público)
- **Tradução automática:** Google Translate (sem chave, uso público)
- **Hospedagem sugerida:** GitHub Pages

---

## Funcionalidades

### Acervo público (`index.html`)
- Busca por título, ISBN, autor, editora, sinopse e palavras-chave (com suporte a `#tag`)
- Tags de palavras-chave clicáveis — filtram o acervo automaticamente
- Capas dos livros com lightbox em tela cheia
- Indicação visual de disponibilidade em tempo real
- Acessibilidade: busca por voz, A+/A−, modo escuro, VLibras

### Painel administrativo (`admin.html`)
- Cadastro, edição e exclusão de livros com upload de capa (câmera ou galeria)
- Controle de empréstimos: registrar, editar, renovar, devolver, excluir
- Aba de devoluções com indicador de urgência por cor (🔴🟡🟢⚪⚫) na aba e nos cards
- Cadastro de alunos e funcionários com suporte a Ensino Médio (checkbox EM → salva como ano 10/11/12)
- Lista de pessoas por turma com histórico de empréstimos por acordeão
- Realtime: atualiza automaticamente sem recarregar

### Cadastro rápido com IA (`cadastro_rapido.html`)
- **Foto da capa → IA identifica:** título, autor, editora, acabamento, categoria, palavras-chave e descrição de acessibilidade
- **Groq (Llama 4 Scout):** análise visual da capa
- **Google Books:** complementa ISBN, sinopse e editora — com validação de relevância (descarta resultados de livros errados)
- **Tradução automática:** sinopses em inglês são traduzidas automaticamente para português
- Detecta livros já cadastrados e permite atualizar quantidade com um toque
- Aba de acervo integrada para edição rápida de qualquer livro com IA
- Colaboradores validados (só aceita funções reconhecidas: TRADUTOR, ILUSTRADOR, etc.)
- Histórico de cadastros da sessão

### Relatórios (`relatorios.html`)
- Relatório anual ou mensal
- Top livros mais lidos por número de salas
- Aluno e aluna destaque por sala
- Download em `.txt`
- Realtime: regenera automaticamente ao detectar novos dados

### Login (`login.html`)
- Autenticação por e-mail e senha via Supabase Auth
- Redirecionamento automático se já autenticado

---

## Estrutura de arquivos

```
BibVania/
├── index.html              — Acervo público
├── admin.html              — Painel do bibliotecário
├── cadastro_rapido.html    — Cadastro rápido com IA
├── relatorios.html         — Gerador de relatórios
├── login.html              — Autenticação
├── database.js             — Conexão Supabase e todas as queries
├── bibvania-utils.js       — Utilitários: busca por voz, dropdown de prateleira
├── bibvania-transition.js  — Tela de transição animada entre páginas
├── style.css               — Estilos globais (dark/light mode, responsivo)
├── logo.png                — Logo do sistema
├── favicon.png             — Favicon
├── og-image.png            — Imagem de compartilhamento
├── supabase_setup.sql      — Configuração inicial do banco (executar no Supabase)
└── README.md               — Este arquivo
```

---

## Configuração inicial

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project**, escolha um nome e uma senha forte para o banco
3. Aguarde o projeto ser criado (pode levar 1–2 minutos)
4. Acesse **Project Settings → General** para ver o nome e região do projeto

### 2. Ativar o RLS (Row Level Security)

> ⚠️ Obrigatório — sem isso qualquer pessoa pode modificar o banco pela URL da API.

O arquivo `supabase_setup.sql` já contém os comandos para ativar o RLS em todas as tabelas. Para confirmar manualmente:

1. No menu lateral, vá em **Table Editor**
2. Para cada tabela, clique nos três pontinhos → **Edit Table** → certifique-se de que **Row Level Security (RLS)** está ativado
3. As políticas de acesso são criadas automaticamente pelo `supabase_setup.sql`

### 3. Executar o SQL de configuração

1. No menu lateral, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo completo do arquivo `supabase_setup.sql`
4. Clique em **Run** — todas as tabelas, índices, RLS e políticas serão criados automaticamente

### 4. Encontrar as chaves do Supabase

Você vai precisar de dois valores para inserir em `database.js`:

1. No menu lateral, vá em **Project Settings → API**
2. **URL do projeto** — copie o campo **Project URL**
   - Formato: `https://xxxxxxxxxxxx.supabase.co`
3. **Chave anon/public** — em **Project API Keys**, copie a chave **anon public**
   - Começa com `eyJ...`

> A chave `anon` é pública e segura para o frontend — o RLS garante que ela só acessa o que foi permitido pelas políticas.

### 5. Inserir as credenciais no código

Abra `database.js` e substitua nas linhas 15–16:

```js
const supabaseUrl = "https://SEU_PROJETO.supabase.co";
const supabaseKey = "SUA_CHAVE_ANON_PUBLIC";
```

### 6. Criar o usuário bibliotecário

1. No Supabase, vá em **Authentication → Users**
2. Clique em **Invite user** (ou **Add user**)
3. Informe o e-mail e senha do bibliotecário
4. Esse login será usado na tela `login.html` para acessar o painel admin

### 7. Obter a chave Groq (IA)

1. Acesse [console.groq.com](https://console.groq.com) e crie uma conta gratuita
2. Vá em **API Keys → Create API Key**
3. Copie a chave gerada (começa com `gsk_...`)
4. Abra `cadastro_rapido.html` e substitua o valor de `GROQ_KEY` na linha correspondente

> A chave Groq gratuita tem limite generoso — suficiente para uma biblioteca escolar.

### 8. Publicar no GitHub Pages

1. Suba todos os arquivos em um repositório público no GitHub
2. Vá em **Settings → Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Escolha o branch `main` e a pasta `/ (root)`
5. Clique em **Save** — em alguns minutos o site estará disponível em `https://seu-usuario.github.io/BibVania/`

---

## Histórico de versões

| Funcionalidade | v1.0 | v1.1 | v1.2 |
|---|:---:|:---:|:---:|
| Acervo público com busca | ✅ | ✅ | ✅ |
| Painel administrativo | ✅ | ✅ | ✅ |
| Controle de empréstimos | ✅ | ✅ | ✅ |
| Modo escuro / A+/A− / VLibras | ✅ | ✅ | ✅ |
| Capas dos livros | ❌ | ✅ | ✅ |
| Busca por voz | ❌ | ✅ | ✅ |
| Cadastro de pessoas | ❌ | ✅ | ✅ |
| Lista de pessoas por turma | ❌ | ✅ | ✅ |
| Relatórios anual e mensal | ❌ | ❌ | ✅ |
| Tela de transição animada | ❌ | ❌ | ✅ |
| Palavras-chave com busca por #tag | ❌ | ❌ | ✅ |
| Cadastro rápido com IA (Groq + Google Books) | ❌ | ❌ | ✅ |
| Análise visual de capa (Llama 4 Scout) | ❌ | ❌ | ✅ |
| Tradução automática de sinopse | ❌ | ❌ | ✅ |
| Validação de relevância do Google Books | ❌ | ❌ | ✅ |
| Edição de livro com IA pelo acervo | ❌ | ❌ | ✅ |
| Histórico de empréstimos por pessoa | ❌ | ❌ | ✅ |
| Upload de capa: câmera ou galeria | ❌ | ❌ | ✅ |
| Indicadores de urgência nas devoluções | ❌ | ❌ | ✅ |
| Suporte a Ensino Médio (ano 10/11/12) | ❌ | ❌ | ✅ |
| Categorias didáticas EM 1º/2º/3º | ❌ | ❌ | ✅ |
| Renderização incremental do acervo | ❌ | ❌ | ✅ |

---

## Licença

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) — Livre para usar, adaptar e distribuir com atribuição ao autor.
