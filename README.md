# BibVania Online v1.2

**Sistema de Biblioteca Escolar Digital**
EMTI Professora Maria Vânia Farias Linhares

> Desenvolvido por [Ruan Oliveira Lima](https://github.com/ruanolima) · Licença [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

🌐 **[Site dos Leitores](https://ruanolima.github.io/BibVania/)**

---

## Sobre

BibVania Online é um sistema web para gerenciamento de biblioteca escolar, com acervo público, painel administrativo, controle de empréstimos, cadastro de pessoas e geração de relatórios em tempo real.

---

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Banco de dados / Auth / Realtime:** [Supabase](https://supabase.com) (PostgreSQL)
- **Hospedagem sugerida:** GitHub Pages

---

## Funcionalidades

### Acervo público (`index.html`)
- Busca por título, ISBN, autor, sinopse, editora e colaboradores
- Filtro por categoria com dropdown pesquisável
- Capas dos livros com lightbox em tela cheia
- Indicação visual de disponibilidade e devoluções em atraso
- Acessibilidade: busca por voz, A+/A−, modo escuro, VLibras
- Aviso automático de internet instável

### Painel administrativo (`admin.html`)
- Cadastro, edição e exclusão de livros com upload de capa
- Controle de empréstimos: registrar, devolver, renovar, editar
- Cadastro de alunos e funcionários
- Lista de pessoas por turma com busca por voz
- Busca de devoluções por nome ou título com voz
- Filtro de acervo por categoria com dropdown pesquisável
- Restauração automática da última aba visitada (sem piscar)
- Realtime: atualiza automaticamente sem recarregar
- Aviso automático de internet instável

### Relatórios (`relatorios.html`)
- Relatório anual ou mensal
- Seção 1: N livros mais lidos (N = número de salas cadastradas)
- Seção 2: Aluno e aluna destaque por sala com livros lidos
- Download em `.txt` com acentos corretos
- Botão com animação pulsante durante o download
- Realtime: regenera automaticamente ao detectar novos dados
- Aviso automático de internet instável

### Login (`login.html`)
- Autenticação por e-mail e senha via Supabase Auth
- Redirecionamento automático se já autenticado
- Aviso de internet instável ao tentar entrar sem conexão

### Transição entre páginas
- Tela animada com logo pulsando e pontos saltando
- Sem flash branco entre navegações

---

## Estrutura de arquivos

```
BibVania/
├── index.html              — Acervo público
├── admin.html              — Painel do bibliotecário
├── relatorios.html         — Gerador de relatórios
├── login.html              — Autenticação
├── database.js             — Conexão Supabase e todas as queries
├── bibvania-utils.js       — Utilitários: busca por voz, dropdown de categoria
├── bibvania-transition.js  — Tela de transição animada entre páginas
├── style.css               — Estilos globais (dark/light mode, responsivo)
├── logo.png                — Logo do sistema
├── favicon.png             — Favicon
├── supabase_setup.sql      — Configuração inicial do banco (executar no Supabase)
└── README.md               — Este arquivo
```

> O arquivo `limpeza_banco.sql` é distribuído **fora do zip** — use-o no SQL Editor do Supabase quando necessário para diagnóstico, limpeza de dados de teste ou reset do relatório.

---

## Categorias do acervo (20)

| Categoria |
|-----------|
| EDUCAÇÃO INCLUSIVA |
| INFANTIL (1º AO 4º) |
| INFANTOJUVENIL (5º E 6º) |
| JUVENIL (7º AO 9º) |
| JOVEM ADULTO (10º AO 12º) |
| DIDÁTICO (1º) ao DIDÁTICO (12º) — 12 categorias |
| DE REFERÊNCIA |
| CLÁSSICOS & REGIONAIS |
| POESIA |

---

## Configuração inicial

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse o **SQL Editor** e execute `supabase_setup.sql`
3. Em **Authentication → Providers**, confirme que Email está ativo
4. Crie o usuário bibliotecário em **Authentication → Users → Invite user**
5. Insira suas credenciais em `database.js` nas linhas 15–16:
   ```js
   const supabaseUrl = "https://SEU_PROJETO.supabase.co";
   const supabaseKey = "SUA_CHAVE_ANON_PUBLIC";
   ```
6. Suba os arquivos no GitHub e ative o **GitHub Pages** (Settings → Pages → Deploy from branch `main`)

---

## Histórico de versões

| Funcionalidade | v1.0 | v1.1 | v1.2 |
|---|:---:|:---:|:---:|
| Acervo público com busca | ✅ | ✅ | ✅ |
| Painel administrativo | ✅ | ✅ | ✅ |
| Controle de empréstimos | ✅ | ✅ | ✅ |
| Modo escuro / A+/A− / VLibras | ✅ | ✅ | ✅ |
| Capas dos livros (Supabase Storage) | ❌ | ✅ | ✅ |
| Busca por voz | ❌ | ✅ | ✅ |
| Cadastro de pessoas | ❌ | ✅ | ✅ |
| Lista de pessoas por turma | ❌ | ✅ | ✅ |
| Relatórios anual e mensal | ❌ | ❌ | ✅ |
| Download de relatório em TXT | ❌ | ❌ | ✅ |
| Top livros dinâmico por salas | ❌ | ❌ | ✅ |
| Tela de transição animada | ❌ | ❌ | ✅ |
| Dropdown de categoria pesquisável | ❌ | ❌ | ✅ |
| Categorias expandidas (20 categorias) | ❌ | ❌ | ✅ |
| Resolução de capas em lote | ❌ | ❌ | ✅ |
| Realtime em relatórios | ❌ | ❌ | ✅ |
| Restauração de aba sem flash | ❌ | ❌ | ✅ |
| Avisos de internet instável | ❌ | ❌ | ✅ |
| Animação no botão de download | ❌ | ❌ | ✅ |

---

## Licença

[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) — Livre para usar, adaptar e distribuir com atribuição ao autor.
