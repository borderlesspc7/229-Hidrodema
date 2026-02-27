# Cloud Functions – Hidrodema

## Função: Envio de email ao criar Relatório de Visita

Quando um documento é criado na coleção `visitReports`, a função `onVisitReportCreated` envia um email para o endereço configurado com os dados do relatório (em texto). Para anexar PDF, é possível integrar uma lib como `jspdf` ou `pdfkit` e anexar o buffer ao `sendMail`.

### Configuração

1. **Email de destino**

   ```bash
   firebase functions:config:set visitreport.email_to="empresa@hidrodema.com"
   ```

2. **SMTP (ex.: Gmail)**

   ```bash
   firebase functions:config:set smtp.user="seu@gmail.com" smtp.pass="senha-de-app"
   firebase functions:config:set smtp.from="noreply@hidrodema.com"
   ```

   Ou use variáveis de ambiente no deploy (Firebase Console > Functions > Configuração).

### Deploy

Na raiz do projeto (onde está o `firebase.json`):

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Se ainda não existir, crie o projeto Firebase e inicialize:

```bash
firebase init functions
```

 (selecione o projeto e a pasta `functions` existente).
