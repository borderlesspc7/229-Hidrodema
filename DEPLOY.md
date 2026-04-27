## Deploy (Firebase)

### Pré-requisitos
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

### 3) Hosting (SPA)
Configurado em `firebase.json` para publicar `dist/` e fazer rewrite SPA para `index.html`.

Deploy:

```bash
firebase deploy --only hosting
```

### 4) Cloud Functions (e-mail automático com PDF)
As funções ficam em `functions/`.

Instalar deps e build:

```bash
cd functions
npm ci
npm run build
```

#### Variáveis de ambiente (SMTP)
Configure no ambiente de Functions (recomendado via secrets/vars do Firebase):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (opcional; default = `SMTP_USER`)

Depois deploy:

```bash
firebase deploy --only functions
```

### Observações
- A Function `emailVisitReportOnCreate` dispara em `visitReports/{id}` e tenta enviar para o e-mail do usuário em `users/{uid}` usando `createdBy`.
- Se SMTP não estiver configurado, a função não falha o deploy — ela apenas faz log e não envia e-mail.

