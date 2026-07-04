# vagas.tec.br 🚀

Quadro de vagas de tecnologia da comunidade brasileira.

Este projeto agrega vagas postadas como issues em repositórios da comunidade brasileira de tecnologia e exibe em um quadro de vagas moderno e fácil de usar.

## 🌐 Acesse

**[vagas.tec.br](https://vagas.tec.br)**

## 📋 Fontes de Vagas

As vagas são coletadas automaticamente dos seguintes repositórios:

- 🔧 **DevOps**: [DevOps-Brasil/Vagas](https://github.com/DevOps-Brasil/Vagas)
- ⚙️ **Backend**: [backend-br/vagas](https://github.com/backend-br/vagas)
- 🎨 **Frontend**: [frontendbr/vagas](https://github.com/frontendbr/vagas)
- ⚛️ **React**: [react-brasil/vagas](https://github.com/react-brasil/vagas)
- 📱 **Android**: [androiddevbr/vagas](https://github.com/androiddevbr/vagas)
- 🐘 **PHP**: [phpdevbr/vagas](https://github.com/phpdevbr/vagas)
- ☕ **Java**: [soujava/vagas-java](https://github.com/soujava/vagas-java)
- 📊 **Dados**: [datascience-br/vagas](https://github.com/datascience-br/vagas)

## ✨ Features

- 🔍 **Busca**: Pesquise vagas por título, descrição ou labels
- 🏷️ **Filtros por categoria**: DevOps, Backend, Frontend, React, Android, PHP, Java e Dados
- 📝 **Markdown**: Descrições das vagas renderizadas em Markdown
- 📡 **RSS**: Feed de vagas disponível em `/feed.xml`
- 🌙 **Dark mode**: Suporte automático a tema claro/escuro
- 📱 **Responsivo**: Funciona bem em desktop e mobile
- ⚡ **Rápido**: Cache de dados com Supabase
- 🔄 **Atualização diária**: Cron job para buscar novas vagas

## 🛠️ Stack

- **Framework**: [Next.js 16](https://nextjs.org/) com App Router e React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) com `remark-gfm` e `rehype-sanitize`
- **Cache**: [Supabase](https://supabase.com/)
- **Testes**: [Vitest](https://vitest.dev/) e Testing Library
- **Deploy**: [Vercel](https://vercel.com/)
- **Linguagem**: TypeScript

## 🚀 Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/youhide/vagas.tec.br.git
cd vagas.tec.br

# Instale as dependências
pnpm install

# Rode o projeto
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Outros comandos úteis:

```bash
pnpm build      # Build de produção
pnpm lint       # Lint com ESLint
pnpm typecheck  # Checagem de tipos com TypeScript
pnpm test       # Roda os testes com Vitest
```

## ⚙️ Variáveis de Ambiente

Para desenvolvimento local, você pode criar um arquivo `.env.local`:

```env
# Opcional: Token do GitHub para maior rate limit
GITHUB_TOKEN=your_github_token

# Supabase (configurado automaticamente pelo Vercel Marketplace)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Opcional: Secret para proteger o endpoint de cron
CRON_SECRET=your_cron_secret
```

## 💜 Apoie o projeto

Este projeto é mantido de forma gratuita. Se você acha útil, considere apoiar:

- ⭐ Dê uma estrela no repositório
- 💖 [Sponsor no GitHub](https://github.com/sponsors/youhide)

## 📄 Licença

MIT © [youhide](https://github.com/youhide)

