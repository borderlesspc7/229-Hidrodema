# Deploy – Plataforma de Gestão de Obras (Hidrodema)

## Pré-requisitos

- Node.js 18+
- Conta Firebase e projeto criado em [Firebase Console](https://console.firebase.google.com)
- Firebase CLI: `npm install -g firebase-tools` (ou use `npx firebase` via dependência `firebase-tools`) e `firebase login`

## 1. Variáveis de ambiente (frontend)

Crie um arquivo `.env` na raiz do projeto (e `.env.production` para produção) com as chaves do Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Não commite `.env` (já deve estar no `.gitignore`). No Firebase Hosting ou em CI, configure essas variáveis no ambiente de build.

## 2. Build de produção

```bash
npm install
npm run build
```

A saída fica em `dist/`.

## 3. Inicializar Firebase no projeto (uma vez)

Na raiz do repositório:

```bash
firebase init
```

- Selecione **Hosting** e **Functions** (use a pasta `functions` existente).
- Para Hosting, defina o diretório de publicação como `dist`.
- Conecte ao projeto Firebase desejado.

Ou use o `firebase.json` já presente e apenas associe o projeto:

```bash
firebase use --add
```

## 4. Publicar (Hosting, Functions, Regras)

O projeto usa **Firebase CLI** para subir tudo a partir da raiz. Regras de Firestore e Storage ficam em `firestore.rules` e `storage.rules` e são publicadas junto ou separadamente.

**Deploy completo (hosting + functions + regras):**

```bash
npm run deploy
# ou
firebase deploy
```

**Deploy apenas regras (Firestore + Storage):**

```bash
npm run deploy:rules
# ou
firebase deploy --only firestore:rules,storage
```

**Deploy só Hosting:**

```bash
npm run deploy:hosting
# ou
firebase deploy --only hosting
```

**Deploy só Cloud Functions:**

```bash
cd functions && npm install && cd ..
npm run deploy:functions
# ou
firebase deploy --only functions
```

## 5. Regras de segurança (Firestore e Storage)

As regras estão versionadas no repositório:

- **Firestore:** `firestore.rules` – usuários autenticados; coleção `users` só leitura/escrita do próprio documento.
- **Storage:** `storage.rules` – pasta `obras/**` apenas para usuários autenticados.

Para alterar, edite os arquivos e rode `npm run deploy:rules` (ou `firebase deploy --only firestore:rules,storage`). Não é necessário configurar regras manualmente no Console para uso normal.

## 6. Cloud Functions (Relatório de Visitas – e-mail)

Para o envio automático de e-mail ao criar um relatório de visita, configure:

- `visitreport.email_to`: e-mail de destino.
- SMTP (ex.: Gmail): `smtp.user`, `smtp.pass` e, se necessário, `smtp.host`, `smtp.port`, `smtp.from`.

Detalhes em [functions/README.md](functions/README.md).

## 7. Firebase Admin SDK (chave de serviço)

O arquivo `*firebase-adminsdk*.json` (ou `hidrodema-315be-firebase-adminsdk-....json`) é a **chave da conta de serviço** do Firebase Admin. Ela **não deve ser commitada** (já está no `.gitignore`).

- **Uso:** em scripts Node que usam `firebase-admin` (ex.: emulador com credenciais, migrações, seeds). Nas Cloud Functions em produção o Firebase usa a conta padrão automaticamente; não é preciso enviar o JSON.
- **Onde usar:** por exemplo, `admin.initializeApp({ credential: admin.credential.cert(require('./caminho-do-json')) })` em um script local.
- **Firebase CLI:** o `firebase deploy` usa a conta do `firebase login`, não esse JSON. O JSON é só para o Admin SDK (backend/scripts).

## Resumo dos comandos

| Ação                | Comando |
|---------------------|--------|
| Build               | `npm run build` |
| Deploy completo     | `npm run deploy` ou `firebase deploy` |
| Deploy só regras    | `npm run deploy:rules` |
| Deploy só Hosting   | `npm run deploy:hosting` |
| Deploy só Functions | `npm run deploy:functions` |
