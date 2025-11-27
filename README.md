# CCPlay Grupos (repo: `galeria-jogos`)

Aplicacao web para compartilhamento de assinaturas via grupos: lista grupos de assinatura com busca, abre modal de orientacao de pagamento e redireciona para WhatsApp. Ha login com Google (NextAuth), cadastro complementar, verificacao de conta por e-mail, edicao de perfil e area administrativa para criar, editar e excluir grupos armazenados em MongoDB.

## Stack
- Next.js 14 (Pages Router) + React 18
- Tailwind CSS 3
- NextAuth (OAuth Google + JWT)
- MongoDB (driver oficial) e SWR para revalidacao no cliente
    - Painel MongoDB: https://cloud.mongodb.com/v2/683f2cb1941e50655caee2e1#/overview
- Nodemailer para envio de codigos de verificacao
- Cloudflare R2 (armazenamento de imagens)
    - Painel: https://dash.cloudflare.com/6fbd40e3eacc44868f91366faa20bc4d
- React Icons para os botoes e chamadas de acao

## Principais fluxos
- Home (`/`): lista grupos vindos de `/api/grupos`, busca em tempo real e CTA de entrada via WhatsApp com modal de orientacao.
- Autenticacao: `/auth/signin` faz login com Google; novos usuarios seguem para `/cadastro` e validam e-mail em `/verificacao`.
- Perfil: `/perfil` edita nome, sobrenome, telefone e username; atualiza os dados do MongoDB.
- Admin: `/admin` (senha fixa em `pages/admin/index.js`) libera `/admin/grupos` para CRUD de grupos (`/api/grupos` e `/api/grupos/[id]`).

## Requisitos
- Node.js 18+ e npm
- Banco MongoDB (URI e nome do database)
- Credenciais OAuth do Google e conta SMTP (ex.: Gmail) para envio de codigos

## Configuracao
1) Na raiz `galeria-jogos`, instale dependencias:
```bash
npm install
```
2) Crie `.env.local` com as variaveis (sem aspas):
```bash
MONGODB_URI=
MONGODB_DB=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EMAIL_USER=
EMAIL_PASS=
```
3) Configuracao de storage (Cloudflare R2)
   - Crie um bucket R2 com acesso publico via URL de base (ex.: `https://pub-xxxx.r2.dev`).
   - Adicione as variaveis no `.env.local` (nomes de exemplo, ajuste aos usados no projeto/API):
```
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev
```
   - O upload de imagens de grupo usa `/api/upload/group-image` e `/api/upload/remove-group-image`, que dependem das variaveis acima para gerar a URL (`imageUrl`) e chave (`imageKey`) gravadas no grupo.
4) Opcional: ajuste a senha administrativa em `pages/admin/index.js` (const `SENHA`).
   - Aviso: senha fixa e compartilhada nao e segura em producao. Recomenda-se trocar por controle de acesso baseado no usuario autenticado (roles no Mongo + NextAuth) e remover a senha hardcoded.

## Executar
- Desenvolvimento: `npm run dev` e acesse http://localhost:3000
- Producao local: `npm run build` seguido de `npm start`
- Lint: `npm run lint`

## Deploy
- Vercel (sugestao):
  - Build: `npm run build` (framework Next.js, Pages Router).
  - Start: gerenciado pela Vercel (nao precisa comando manual).
  - Variaveis obrigatorias: Mongo (`MONGODB_URI`, `MONGODB_DB`), NextAuth (`GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`), SMTP (`EMAIL_USER`, `EMAIL_PASS`), Cloudflare R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`), `NEXT_PUBLIC_SITE_URL` (URL publica).
  - Imagens: `next.config.mjs` ja permite `pub-495151c8fd334e6981386bd8a4e6f1c0.r2.dev`; ajuste se mudar o dominio publico da R2.

## Testes
- Disponivel: `npm run lint`.
- Pendente: suites de testes (unitarios, integracao de API, e2e). Quando adicionar, documente comandos e requisitos (ex.: Playwright/Cypress).

## Debug
- Next.js dev com inspector:
  - Windows/PowerShell: `$env:NODE_OPTIONS="--inspect"; npm run dev`
  - Bash: `NODE_OPTIONS="--inspect" npm run dev`
- Imagens quebrando: valide o dominio configurado em `next.config.mjs` (secao `images.remotePatterns`) e se a URL publica da R2 mudou.
- API routes: use `console.log` ou breakpoints com o inspector ativo.
- UI: React/Next DevTools no navegador; hot reload do `next dev`.

## Proximos passos
- Enriquecer card do grupo com descricao, contagem de membros, contagem de vagas/fila.
- Permitir entrada direta ou fila de espera com verificacao de vagas e previsao de liberacao.
- Publicar em producao (ex.: Vercel) com secrets configuradas e variaveis de ambiente separadas por stage.
- Trocar a senha fixa de `/admin` por controle de acesso baseado no usuario autenticado e roles no banco.
- Adicionar testes automatizados: unitarios (regras de negocio), integracao (API routes) e e2e (Playwright/Cypress) para fluxos de compra, login e admin.
- Refinar UX de pagamento: CTA com deep link direto para WhatsApp com mensagem pre-preenchida e validacao de dados antes do envio.
- Monitorar erros e analytics (ex.: Sentry + Vercel Analytics) para acompanhar falhas de API, conversao e engajamento.
- Melhorar entregabilidade de e-mails: templates HTML, remetente autenticado (SPF/DKIM) e fallback de provedor SMTP.

## Debug
- Inspecionar Next.js em modo dev: `$env:NODE_OPTIONS="--inspect"; npm run dev` (PowerShell) e conecte o inspector do VS Code/Chrome em `localhost:9229`.
- API routes (`pages/api/*`): use breakpoints no VS Code com o inspector ativo ou adicione `console.log`.
- UI: use React/Next DevTools no navegador; o hot reload do `next dev` reflete mudancas em tempo real.
- Problemas com e-mail: valide `EMAIL_USER`/`EMAIL_PASS` e, em ambiente de testes, considere provedores como Ethereal/SMTP de sandbox.

## Instruçoes GPT
- Pergunte o que for necessário para iniciar uma tarefa
