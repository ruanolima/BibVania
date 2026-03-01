<p align="center">
  <img src="logo.png" alt="BibVania Logo" width="200">
</p>

# BibVania 1.0 - Sistema de Biblioteca Escolar

**BibVania** é um sistema de gerenciamento de biblioteca escolar desenvolvido com HTML, CSS e JavaScript, utilizando **Supabase** como banco de dados online. O sistema oferece funcionalidades completas para alunos, professores e bibliotecários.

🌐 Acessar o [Site dos Leitores](https://ruanolima.github.io/BibVania/).

## Características

- 📚 **Acervo Digital**: Consulta de livros por título, autor, ISBN e sinopse
- 📖 **Gerenciamento de Empréstimos**: Registro e controle de saídas e devoluções
- 📊 **Relatórios Detalhados**: Geração de relatórios em texto com estatísticas de uso
- 👥 **Controle de Acesso**: Autenticação segura para bibliotecários
- 🎨 **Design Responsivo**: Interface acessível e intuitiva
- 🌙 **Modo Escuro**: Suporte a tema claro/escuro
- ♿ **Acessibilidade**: Controles de tamanho de fonte

## Instalação e Configuração

### 1. Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com/) e crie uma conta
2. Crie um novo projeto
3. Copie a **URL do Projeto** e a **Chave Anon** (encontradas em Project Settings → API)

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Crie uma nova query e copie o conteúdo do arquivo `supabase_schema.sql`
3. Execute a query para criar as tabelas e configurações

### 3. Atualizar Credenciais no Projeto

1. Abra o arquivo `database.js`
2. Localize as linhas 4 e 5:
   ```javascript
   const supabaseUrl = "YOUR_SUPABASE_URL";
   const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
   ```
3. Substitua pelos valores copiados do Supabase:
   ```javascript
   const supabaseUrl = "https://seu-projeto.supabase.co";
   const supabaseKey = "sua-chave-anon-aqui";
   ```

### 4. Configurar Autenticação (Login)

1. No painel do Supabase, vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Digite o e-mail e a senha do bibliotecário
4. **Importante**: Desmarque "Send lookup email" para que o usuário possa logar imediatamente, ou confirme o e-mail manualmente se necessário

### 5. Ativar Realtime (Atualizações em Tempo Real)

1. Vá em **Database** → **Replication**
2. Na linha `supabase_realtime`, clique em 'tables'
3. Ative para as tabelas `livros` e `emprestimos`

### 6. Configurar Row Level Security (RLS)

O arquivo `supabase_schema.sql` já configura o RLS com políticas abertas por padrão. Para aumentar a segurança:

1. Vá em **Database** → **Policies**
2. Configure as políticas conforme necessário para restringir acesso

## Publicação

Faça o upload dos seguintes arquivos para sua hospedagem (GitHub Pages, Netlify, Vercel, etc):

- `index.html` - Site dos Leitores
- `login.html` - Página de Login
- `admin.html` - Painel Administrativo
- `relatorios.html` - Gerador de Relatórios
- `database.js` - Conexão com Supabase
- `style.css` - Estilos CSS

## Uso

### Para Leitores (Alunos)
- Acesse `index.html`
- Consulte o acervo por categoria ou busca
- Visualize informações dos livros disponíveis

### Para Bibliotecários
- Acesse `login.html` com suas credenciais
- No painel admin, gerencie:
  - **Acervo**: Adicione, edite ou remova livros
  - **Empréstimos**: Registre saídas, devoluções e renovações
  - **Relatórios**: Gere estatísticas de uso

## Estrutura de Arquivos

```
BibVania/
├── index.html              # Site dos leitores
├── login.html              # Página de autenticação
├── admin.html              # Painel administrativo
├── relatorios.html         # Gerador de relatórios
├── database.js             # Conexão com Supabase
├── style.css               # Estilos globais
├── supabase_schema.sql     # Script de criação do banco
├── logo.png                # Logo do projeto
├── favicon.ico             # Favicon (Desktop)
├── favicon-192.png         # Favicon (Android)
├── apple-touch-icon.png    # Favicon (iOS)
└── README.md               # Este arquivo
```

## Categorias de Livros

- EDUCAÇÃO INCLUSIVA
- INFANTIL (1º AO 4º)
- INFANTOJUVENIL (5º E 6º)
- JUVENIL (7º AO 9º)
- DIDÁTICO (1º AO 4º)
- DIDÁTICO (5º)
- DIDÁTICO (6º)
- DIDÁTICO (7º)
- DIDÁTICO (8º)
- DIDÁTICO (9º)
- DE REFERÊNCIA
- CLÁSSICOS & REGIONAIS
- POESIA

## Funcionalidades Principais

### Acervo
- Busca avançada por ID, ISBN, título, autor e sinopse
- Filtro por categoria
- Visualização de disponibilidade
- Destaque de livros com devolução atrasada

### Empréstimos
- Registro de saídas para alunos e professores
- Alunos: máximo 1 empréstimo ativo
- Professores/Funcionários: múltiplos empréstimos ativos
- Renovação de prazos
- Registro de devoluções

### Relatórios
- Livros cadastrados
- Histórico de empréstimos
- Rankings por sala e livros mais lidos
- Livros com devolução atrasada
- Livros sem prazo de entrega
- Pendências

## Suporte e Contribuições

Para reportar problemas ou sugerir melhorias, visite o [Repositório GitHub](https://github.com/ruanolima/BibVania).

## Licença

Este projeto está licenciado sob [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Desenvolvido com ❤️ por Ruan Oliveira Lima**

**Versão**: 1.1  
**Data**: 2026

