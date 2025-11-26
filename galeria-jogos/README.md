# CCPlay Grupos

Aplicacao web para compartilhamento de assinaturas via grupos: lista grupos de assinatura com busca, abre modal de orientacao de pagamento e redireciona para WhatsApp. Ha login com Google (NextAuth), cadastro complementar, verificacao de conta por e-mail, edicao de perfil e area administrativa para criar, editar e excluir grupos armazenados em MongoDB.

## Stack
- Next.js 14 (Pages Router) + React 18
- Tailwind CSS 3
- NextAuth (OAuth Google + JWT)
- MongoDB (driver oficial) e SWR para revalidacao no cliente
- Nodemailer para envio de codigos de verificacao
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
3) Opcional: ajuste a senha administrativa em `pages/admin/index.js` (const `SENHA`).

## Executar
- Desenvolvimento: `npm run dev` e acesse http://localhost:3000
- Producao local: `npm run build` seguido de `npm start`
- Lint: `npm run lint`

## Proximos passos
- Enriquecer card do grupo com descricao, contagem de membros e status de vagas/fila.
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
