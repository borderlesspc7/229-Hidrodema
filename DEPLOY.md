## Deploy (Firebase)

### Pré-requisitos
- Node.js LTS 20.x para Cloud Functions (`functions/package.json` usa `engines.node=20`)
- Firebase CLI instalado: `npm i -g firebase-tools`
- Projeto Firebase criado e selecionado: `firebase login` + `firebase use <alias>`

### 1) Build do front-end (Vite)
No root do projeto:

```bash
npm ci
npm run build
```

### 2) Regras Firestore/Storage
Arquivos:
- `firestore.rules`
- `storage.rules`

Aplicar:

```bash
firebase deploy --only firestore:rules,storage
```

Script equivalente:

```bash
npm run firebase:rules
```

### 3) Hosting (SPA)
Configurado em `firebase.json` para publicar `dist/` e fazer rewrite SPA para `index.html`.

Deploy:

```bash
firebase deploy --only hosting
```

### 4) Cloud Functions (e-mail automático, exportação CSV e integrações)
As funções ficam em `functions/`.

Instalar deps e build:

```bash
cd functions
npm ci
npm run build
```

#### Segredos/variáveis de ambiente
Configure no ambiente de Functions antes do deploy:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (opcional; default = `SMTP_USER`)
- `SELLER_API_BASE_URL`
- `SELLER_API_TOKEN` (opcional)
- `CRM_WEBHOOK_SECRET`
- `ALERT_EMAIL` (opcional)
- `CORP_EMAIL_DOMAIN` ou `CORP_EMAIL_DOMAINS` (opcional)

Exemplo com Firebase CLI:

```bash
firebase functions:secrets:set SMTP_PASS
firebase functions:secrets:set SELLER_API_TOKEN
firebase functions:secrets:set CRM_WEBHOOK_SECRET
```

Depois deploy:

```bash
firebase deploy --only functions
```

Script equivalente:

```bash
npm run firebase:functions
```

### Observações
- A Function `emailVisitReportOnCreate` dispara em `visitReports/{id}` e tenta enviar para o e-mail do usuário em `users/{uid}` usando `createdBy`.
- A Function `emailServiceRequestOnCompleted` dispara quando `serviceRequests/{id}.status` muda para `completed`.
- A callable `exportServiceRequestsCsv` gera CSV em `exports/` no Storage e devolve URL assinada para admin/gestor.
- Se SMTP não estiver configurado, a função não falha o deploy — ela apenas faz log e não envia e-mail.
