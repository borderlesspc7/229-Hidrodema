# HIDRODEMA — notas internas (equipa)

## Papéis e dados

- Perfis: `admin`, `gestor`, `vendedor`, `user` (ver `src/types/user.ts`).
- Regras de visão e edição: `src/lib/rbac.ts` (visitas) e `src/lib/reportPermissions.ts` (relatórios de obra finalizados).
- Campos `sellerCode` e `sellerExternalId` no perfil alinham o vendedor às linhas agregadas nos formulários.

## Variáveis de ambiente

- Firebase: `VITE_FIREBASE_*` (obrigatórias para a app).
- Feature flags: `VITE_FEATURE_MEETING`, `VITE_FEATURE_MARKETING`, `VITE_FEATURE_GESTAO_VENDEDORES` (`true`/`false`; ver `src/lib/features.ts`).
- API de vendedores (sincronização server-side): `SELLER_API_BASE_URL`, `SELLER_API_TOKEN` (opcional; variáveis do ambiente das Functions).
- Erros (opcional): `VITE_SENTRY_DSN` — só carrega Sentry se o DSN estiver definido.

## Firestore

- Ficheiro de regras na raiz: `firestore.rules`; `firebase.json` aponta para o mesmo.
- Deploy: `firebase deploy --only firestore:rules` (com Firebase CLI e projeto configurado).
- As regras atuais exigem **utilizador autenticado** nas coleções listadas; o documento `users/{uid}` só é legível/atualizável pelo próprio `uid`. A filtragem fina por vendedor continua na app; endurecer no servidor pode exigir queries com `where("createdBy", "==", uid)` ou Cloud Functions — ver comentário no topo de `firestore.rules`.

## Impressão / PDF (HTML)

- Estilos e rodapé partilhados: `src/lib/printPdfBranding.ts`.
- PDF de obras (jsPDF): `src/lib/obrasReportPdf.ts`.

## Testes

- `npm run test` — Vitest; inclui `src/lib/rbac.test.ts`, `src/lib/visitWorkflow.test.ts`, etc.
