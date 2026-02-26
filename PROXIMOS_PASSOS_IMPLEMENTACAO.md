    # Próximos passos de implementação – Hidrodema

Documento gerado com base no estado atual do código e na estimativa do cliente (MVP 58h / Robusta 96h).

---

## Resumo do que já está no projeto

| Módulo (estimativa cliente) | Status atual | Observação |
|-----------------------------|-------------|------------|
| 1 – Autenticação | ✅ Implementado | Login, registro, recuperação de senha |
| 2 – Estrutura básica | ✅ Implementado | Painel, menu lateral, layout responsivo |
| 3–4 – Tabelas e consultas técnicas | ✅ Implementado | Resistência química, espaçamento suportes, peso tubos, filtros |
| 5 – Formulários de entrada | ✅ Implementado | Validações em `validation.ts`, formulários nas telas |
| 6 – Cálculos automatizados | ✅ Implementado | Consumo adesivo, peso tubos, RDO, gastos, etc. |
| 7 – Exportação | ⚠️ Parcial | PDF por impressão em várias telas; **Equalizador só alert, sem PDF** |
| 8 – Refinamentos | ⚠️ Parcial | Responsivo ok; falta usabilidade/mobile documentado e alguns TODOs |
| 9 – Catálogo Hidroservice | ✅ Implementado | Grid de serviços e subpáginas |
| 10 – Solicitações de visita | ✅ Implementado | Formulário, Firestore, listagem, status |
| 11 – Relatórios de visita | ✅ Implementado | Relatórios, protocolos, exportação impressão |
| 12 – Módulo Hidromeet | ❌ Não iniciado | Rota `/meeting` existe com placeholder `<div>Meeting</div>` |
| 13 – Planos e assinaturas | ❌ Não iniciado | Nenhuma tela de planos/pricing |

---

## Próximos passos priorizados (com horas)

Ordem sugerida: fechar lacunas rápidas primeiro, depois módulos novos, por fim refinamentos.

---

### 1) Completar exportação PDF no Equalizador (MVP)

**O que falta:** Em `EqualizadorServicos.tsx`, `handleExportPDF` hoje só abre um `alert("Exportando MDS...")`. Implementar o mesmo padrão de exportação por impressão já usado em SolicitacaoServicos, RelatorioVisitas e GerenciamentoObras (janela de impressão com HTML + `print()`).

**Horas sugeridas:** **2–3 h** (MVP).

**Arquivo:** `src/pages/AcessoExclusivo/EqualizadorServicos/EqualizadorServicos.tsx` (por volta das linhas 855–865).

---

### 2) Resolver TODOs de "author" (contexto de autenticação)

**O que falta:** Em três telas, o autor de comentários está fixo como `"Usuário"`. Trocar para o usuário logado vindo do contexto de autenticação.

- `SolicitacaoServicos.tsx` (~linha 1213)
- `RelatorioVisitas.tsx` (~linha 1005)
- `EqualizadorServicos.tsx` (~linha 810)

**Horas sugeridas:** **1 h**.

**Como:** Usar `useAuth()` (ou equivalente) para obter `user.displayName` ou `user.email` e preencher `author` ao criar comentários.

---

### 3) Módulo Hidromeet (evento)

**O que falta (escopo cliente):** Página dedicada ao evento, lista de especialistas, conteúdos exclusivos para usuários logados.

**Estado atual:** Rota `/meeting` existe e está protegida; componente `Meeting` em `AppRoutes.tsx` é apenas `<div>Meeting</div>`.

**Horas sugeridas (conforme estimativa do cliente):**
- **MVP:** **6 h**
- **Robusta:** **10 h**

**Sugestão de implementação:**
- Página `Hidromeet` (ou `Meeting`) com layout alinhado ao restante do app.
- Seção pública: informações do evento, data, local.
- Seção "Especialistas": lista (dados podem vir de Firestore ou JSON estático no MVP).
- Seção "Conteúdos exclusivos": visível apenas para usuários logados (já está em rota protegida; pode ter blocos condicionais por auth se necessário).
- Opcional robusta: CRUD de especialistas/conteúdos no Firestore e painel admin.

---

### 4) Planos e assinaturas

**O que falta (escopo cliente):** Cadastro de planos (Starter, Business, Enterprise), limites por plano, tela de comparação.

**Estado atual:** Nenhuma página ou serviço de planos; "assinatura" no código refere-se apenas a assinaturas em documentos de obras.

**Horas sugeridas (conforme estimativa do cliente):**
- **MVP:** **4 h**
- **Robusta:** **6 h**

**Sugestão de implementação MVP:**
- Página "Planos" (rota nova, ex.: `/planos` ou dentro de Acesso Exclusivo).
- Dados dos planos em constante ou Firestore (nome, limites, preço se aplicável).
- Tela de comparação (cards ou tabela).
- Opcional: restrição de uso por plano (checagem de limites nas telas que precisarem).

**Robusta:** limites aplicados de fato nas funcionalidades (ex.: número de visitas/solicitações por plano), possivelmente campo `plan` no perfil do usuário no Firestore.

---

### 5) Refinamentos (usabilidade, mobile, ajustes visuais)

**O que falta:** Ajustes de usabilidade, melhorias visuais e otimização mobile além do que já existe. Responsividade já está implementada em várias telas; falta consolidar e documentar.

**Horas sugeridas (conforme estimativa do cliente, parte já "gasta" no que está feito):**
- **MVP:** **4–6 h** (revisão de fluxos, pequenos ajustes de UX, testes em mobile).
- **Robusta:** **6–10 h** (testes mais profundos, polish visual, acessibilidade, performance).

**Sugestão:** Fazer após Hidromeet e Planos para refinar com o escopo completo.

---

### 6) (Opcional) Envio de e-mail com PDF no Equalizador

**O que falta:** Em `EqualizadorServicos.tsx` há comentário "Implementação futura de envio de email com PDF". Não faz parte do escopo resumido do cliente; pode ficar para uma fase posterior (ex.: Cloud Functions + SendGrid/Mailgun ou outro serviço).

**Horas sugeridas:** **4–6 h** se for implementado (backend de e-mail + integração no front).

---

## Visão geral das horas nos próximos passos

| Passo | MVP (h) | Robusta (h) |
|-------|---------|--------------|
| 1 – PDF Equalizador | 2–3 | 2–3 |
| 2 – Author no contexto de auth | 1 | 1 |
| 3 – Módulo Hidromeet | 6 | 10 |
| 4 – Planos e assinaturas | 4 | 6 |
| 5 – Refinamentos | 4–6 | 6–10 |
| **Total sugerido** | **17–20** | **25–30** |

*(As 58h MVP e 96h Robusta do cliente cobrem o projeto inteiro; aqui estão apenas as horas que ainda fazem sentido para o que falta.)*

---

## Ordem recomendada de execução

1. **2–3 h** – Completar PDF no Equalizador (entrega rápida e alinha o módulo às outras exportações).
2. **1 h** – Resolver os 3 TODOs de `author` com o contexto de autenticação.
3. **6 h (MVP) ou 10 h (Robusta)** – Implementar o módulo Hidromeet (página evento, especialistas, conteúdos exclusivos).
4. **4 h (MVP) ou 6 h (Robusta)** – Implementar planos e assinaturas (telas + comparação; opcionalmente limites por plano na robusta).
5. **4–6 h (MVP) ou 6–10 h (Robusta)** – Refinamentos (usabilidade, mobile, testes, ajustes visuais).

Se quiser, na próxima etapa podemos detalhar tarefas técnicas (componentes, rotas e estruturas de dados) para o passo 3 (Hidromeet) ou 4 (Planos).
