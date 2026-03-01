# BibVania - Biblioteca Escolar da EMTI Professora Maria Vânia Farias Linhares

**BibVania** não é apenas um sistema, é a identidade digital da Biblioteca Escolar da EMTI Professora Maria Vânia Farias Linhares. Desenvolvido para modernizar a gestão do acervo e facilitar o acesso à leitura para alunos e professores.

🌐 **Acesse o portal:** [BibVania Online](https://ruanolima.github.io/BibVania/)

---

## 📑 Sumário
1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Acessibilidade](#acessibilidade)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Novidades da Versão 1.1](#novidades-da-versão-11)
6. [Guia de Instalação e Configuração](#guia-de-instalação-e-configuração)
7. [Estrutura do Banco de Dados (Supabase)](#estrutura-do-banco-de-dados-supabase)
8. [Manutenção e Atualização](#manutenção-e-atualização)
9. [Licença e Créditos](#licença-e-créditos)

---

## 🌟 Visão Geral
O BibVania foi concebido para ser uma ferramenta leve, rápida e eficiente. Ele elimina a necessidade de fichas de papel, permitindo que o bibliotecário tenha controle total sobre o acervo, empréstimos e devoluções em tempo real.

---

## 🚀 Funcionalidades

### 🔍 Para Leitores (Alunos e Professores)
- **Consulta ao Acervo:** Busca instantânea por título, autor, ISBN ou sinopse.
- **Categorização:** Filtros por nível de ensino e gênero literário.
- **Disponibilidade:** Verificação em tempo real de quantos exemplares estão nas estantes.
- **Transparência:** Visualização de quem está com o livro e a data prevista de devolução.

### 🛠️ Para o Bibliotecário (Painel Administrativo)
- **Gestão de Acervo:** Cadastro, edição e exclusão de livros com suporte a ISBN e sinopses.
- **Controle de Fluxo:** Registro de saídas (empréstimos) e entradas (devoluções).
- **Regras de Negócio:** 
  - Alunos: Limite de 1 empréstimo ativo por vez.
  - Professores/Funcionários: Múltiplos empréstimos permitidos.
- **Alertas de Atraso:** Identificação automática de livros com prazo vencido.
- **Relatórios:** Geração de documentos .txt detalhados com estatísticas anuais ou mensais, rankings de leitura por sala e destaques individuais.

---

## ♿ Acessibilidade
O BibVania está comprometido com a inclusão:
- **VLibras:** Integração com o widget de tradução para Língua Brasileira de Sinais.
- **Leitura de Texto (TTS):** Botão de áudio que lê o conteúdo da página para pessoas com deficiência visual.
- **Controle de Fonte:** Ajuste dinâmico do tamanho do texto (A+ / A-).
- **Modo Escuro:** Interface otimizada para reduzir a fadiga visual.

---

## 🛠️ Tecnologias Utilizadas
- **Frontend:** HTML5, CSS3 (Variáveis, Flexbox, Grid) e JavaScript Moderno (ES6+).
- **Backend/DB:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime).
- **Acessibilidade:** VLibras API e Web Speech API.
- **Hospedagem Recomendada:** GitHub Pages.

---

## ✨ Novidades da Versão 1.1

Esta versão traz uma série de melhorias significativas, focando na experiência do usuário, acessibilidade e organização interna do sistema:

- **Novo Cabeçalho e Identidade Visual:** Implementação de um cabeçalho modernizado e centralizado em todas as páginas (`index.html`, `login.html`, `admin.html`, `relatorios.html`). Inclui a logo da BibVania, o título "BibVania" em destaque e o subtítulo "Biblioteca Escolar da EMTI Professora Maria Vânia Farias Linhares." alinhado à esquerda da logo, tudo dentro de um contêiner centralizado. A imagem enviada foi convertida e configurada como `favicon.ico` em todas as páginas do site para melhor identificação nas abas do navegador.
- **Melhorias na Interface de Leitores (`index.html`):**
  - **Organização do Acervo:** Os livros agora são exibidos em ordem alfabética por título, facilitando a busca e navegação. Os IDs internos dos livros não são mais exibidos diretamente na interface para o leitor, focando na experiência de uso.
- **Aprimoramentos na Área do Bibliotecário (`admin.html`):**
  - **Visualização do Acervo:** Na aba "Acervo", o último livro cadastrado agora aparece no topo da lista, agilizando a visualização dos itens mais recentes.
  - **Nomenclatura:** O texto "Painel Administrativo" foi alterado para "Área do Bibliotecário" para maior clareza e padronização.
- **Segurança no Login (`login.html`):**
  - **Case-Sensitive:** O sistema de login agora permite e diferencia letras maiúsculas e minúsculas na senha, aumentando a segurança das credenciais de acesso.
- **Acessibilidade Aprimorada em Todos os Sites:**
  - **Botão de Leitura (Texto para Áudio):** Adicionado um botão de leitura do site (texto para áudio) na barra de acessibilidade, permitindo que usuários com deficiência visual ou dificuldades de leitura possam ouvir o conteúdo das páginas.
  - **Integração VLibras:** A API VLibras foi integrada em todas as páginas, oferecendo tradução para a Língua Brasileira de Sinais, reforçando o compromisso com a inclusão.
  - **Botão "Repositório" Aprimorado:** O botão "GitHub" na barra de acessibilidade foi renomeado para "Repositório" e sua estilização foi ajustada para que ocupe o espaço de forma mais harmoniosa e visualmente agradável.
- **Padronização do Nome da Biblioteca:** O nome "BibVania" agora é oficialmente adotado como o nome da biblioteca, e não apenas do sistema, refletindo a identidade completa da "BibVania - Biblioteca Escolar da EMTI Professora Maria Vânia Farias Linhares" em todo o projeto.

---

## ⚙️ Guia de Instalação e Configuração

### 1. Preparação do Banco de Dados (Supabase)
1. Crie um projeto no [Supabase](https://supabase.com/).
2. No **SQL Editor**, execute o script contido em `supabase_schema.sql` para criar as tabelas `livros` e `emprestimos`.
3. Em **Authentication -> Users**, crie o usuário do bibliotecário (E-mail e Senha).

### 2. Configuração do Código
1. No arquivo `database.js`, insira suas credenciais:
   ```javascript
   const supabaseUrl = "SUA_URL_DO_SUPABASE";
   const supabaseKey = "SUA_CHAVE_ANON_KEY";
   ```

### 3. Ativação do Realtime
Para que as mudanças apareçam instantaneamente em todos os dispositivos:
1. Vá em **Database -> Replication**.
2. No item `supabase_realtime`, selecione as tabelas `livros` e `emprestimos`.

---

## 📊 Estrutura do Banco de Dados (Supabase)

### Tabela: `livros`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int8 (PK) | Identificador único do livro |
| `titulo` | text | Nome da obra (Obrigatório) |
| `autor` | text | Nome do autor |
| `isbn` | text | Código internacional do livro |
| `categoria` | text | Categoria (Educação, Infantil, etc) |
| `quantidade_total` | int4 | Total de exemplares físicos |
| `quantidade_disponivel`| int4 | Exemplares na estante |
| `sinopse` | text | Breve resumo da obra |

### Tabela: `emprestimos`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int8 (PK) | Identificador do empréstimo |
| `livro_id` | int8 (FK) | ID do livro emprestado |
| `nome_aluno` | text | Nome do responsável |
| `turma_aluno` | text | Turma ou "PROF/FUNC" |
| `ano_aluno` | int4 | Ano escolar (0 para professores) |
| `sexo` | char(1) | M/F para tratamento (Aluno/Aluna) |
| `data_emprestimo` | timestamp | Data da retirada |
| `data_prevista_devolucao`| timestamp | Prazo final |
| `status` | text | 'emprestado' ou 'devolvido' |

---

## 🔄 Manutenção e Atualização

### No GitHub
1. Sempre que fizer alterações nos arquivos `.html`, `.css` ou `.js`, faça o **Commit** e **Push** para o repositório.
2. O GitHub Pages atualizará o site automaticamente em alguns minutos.

### No Supabase
1. **Backups:** O Supabase faz backups automáticos, mas você pode exportar os dados das tabelas em formato CSV na aba **Table Editor**.
2. **Novos Usuários:** Para adicionar mais bibliotecários, basta criar novos usuários na aba **Authentication**.

---

## 📜 Licença e Créditos

Este projeto é de código aberto e está licenciado sob a [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

**Desenvolvido por:** Ruan Oliveira Lima  
**Instituição:** EMTI Professora Maria Vânia Farias Linhares  
**Ano:** 2026

---
*Criado com ❤️ para transformar a educação através da leitura.*

**Versão:** 1.1
