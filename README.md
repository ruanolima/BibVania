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

## 🖥️ O que o sistema faz

### Para os leitores — `index.html` (público)
- 🔍 **Busca o acervo** por título, autor, ISBN, sinopse, editora ou colaborador
- 🗂️ **Filtra por categoria** com abas deslizantes
- 📖 Exibe disponibilidade em tempo real de cada livro
- 🖼️ Mostra capa do livro com carregamento otimizado (textos primeiro, imagens depois)
- ⚠️ Destaque automático para livros com devolução atrasada
- 🌙 Modo escuro, ajuste de fonte e acessibilidade em Libras (VLibras)
- ⚡ Atualização em tempo real via Supabase Realtime

### Para o bibliotecário — `admin.html` (acesso com senha)

**Aba CADASTRO** — Cadastra livros com ISBN, acabamento, título, autor, colaboradores, editora, prateleira, categoria, quantidade, sinopse e capa com pré-visualização

**Aba EMPRÉSTIMO** — Registra saída para alunos (limite 1 ativo) e professores/funcionários; prazo em dias ou sem data

**Aba ACERVO** — Edita e exclui livros; lista empréstimos ativos por livro; detecta atrasos

**Aba DEVOLUÇÕES** — Empréstimos agrupados por turma; badge "DEVOLVER HOJE!"; ações de devolver, editar, renovar e excluir

### Relatórios — `relatorios.html`
Exporta `.txt` anual ou mensal com acervo, histórico, ranking de leitores, livros mais lidos, atrasados e pendências

---

## 🚀 Instalação em 15 minutos

### 1. Banco de dados (Supabase — gratuito)
1. Crie conta em [supabase.com](https://supabase.com/) e inicie um projeto
2. Copie a **URL** e a **Chave Anon** em *Project Settings → API*
3. Execute `supabase_setup.sql` no *SQL Editor*
4. Habilite Realtime em *Database → Replication* para `livros` e `emprestimos`
5. Cadastre a bibliotecária em *Authentication → Users → Add User*

### 2. Conectar ao banco
Em `database.js`, linhas 4–5:
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
| `style.css` | ✅ | Estilos globais |
| `logo.png` | ✅ | Logo |
| `favicon.png` | ✅ | Ícone |
| `supabase_setup.sql` | ⬜ | Script do banco |
| `README.md` | ⬜ | Esta documentação |

---

## 🛠️ Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github&logoColor=white)

HTML5 · CSS3 · JavaScript puro (sem frameworks) · Supabase (PostgreSQL) · GitHub Pages

---

## 🔧 Resolução de problemas

| Problema | Solução |
|---|---|
| Acervo não carrega | Verifique credenciais em `database.js` e recarregue |
| Login não funciona | Confirme e-mail em Authentication → Users (senha case-sensitive) |
| Disponibilidade incorreta | Execute `supabase_setup.sql` para reinstalar o trigger |
| Dados não atualizam | Habilite Realtime no Supabase (Database → Replication) |

```sql
-- Atualização de banco existente
ALTER TABLE livros ADD COLUMN IF NOT EXISTS colaboradores JSONB DEFAULT '[]';
ALTER TABLE livros ADD COLUMN IF NOT EXISTS editora TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS pub_independente BOOLEAN DEFAULT FALSE;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS prateleira TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS acabamento TEXT;
ALTER TABLE livros ADD COLUMN IF NOT EXISTS imagem_url TEXT;
```

---

## 📄 Licença

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) · **Ruan Oliveira Lima** · [github.com/ruanolima](https://github.com/ruanolima)

Use, copie, modifique e distribua — desde que dê crédito ao autor.

---

*sistema de biblioteca escolar gratuito · open source · sem instalação · gerenciamento de acervo · controle de empréstimos · escola pública · HTML CSS JavaScript Supabase GitHub Pages*
