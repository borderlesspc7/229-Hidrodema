# HIDRODEMA

App web (React + TypeScript + Vite) com Firebase (Auth, Firestore, Storage, Functions) e deploy no GitHub Pages.

## Rodar localmente

Pré-requisitos:
- Node 20+
- Projeto Firebase configurado (Console) e credenciais do SDK do Web App

Instalação:
```bash
npm ci
cp .env.example .env
```

Depois preencha no `.env` as variáveis `VITE_FIREBASE_*` e rode:
```bash
npm run dev
```

## Scripts

- `npm run dev`: servidor local (Vite)
- `npm run build`: build de produção
- `npm run lint`: ESLint
- `npm test`: Vitest

## Variáveis de ambiente (frontend)

Definidas em `.env` (não commitar; use `.env.example`):
- `VITE_FIREBASE_*`: config do Firebase Web App
- `VITE_FEATURE_*`: feature flags do menu
- `VITE_SENTRY_DSN` (opcional): monitorização de erros

## Cloud Functions (`functions/`)

Há funções para:
- sincronizar `custom claims` a partir de `users/{uid}`
- auditoria de alterações sensíveis
- webhooks/integrações e sincronizações de vendedores para `sellerDirectory`

Config de integração externa (server-side):
- `SELLER_API_BASE_URL`
- `SELLER_API_TOKEN` (opcional)

## Deploy

- **GitHub Pages**: workflow em `.github/workflows/deploy-pages.yml`
- **Firebase (rules/functions/hosting)**: config em `firebase.json`, `firestore.rules`, `storage.rules`

## Notas internas

Ver `docs/DESENVOLVIMENTO_INTERNO.md`.
