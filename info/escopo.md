ESCOPO DO PROJETO
PLATAFORMA CRISTAL DRY NEXT

1. OBJETIVO DO PROJETO
Desenvolver uma plataforma digital completa (painel administrativo web) para gestão do ecossistema de locação de máquinas de limpeza de carpetes, prestação de serviços e comercialização de produtos.
A solução deve integrar de forma centralizada:
Gestão de locadoras
Gestão de profissionais qualificados
Gestão de chamados com e sem lance
Controle de máquinas e estoque
Gestão financeira com repasses automáticos
Marketplace de produtos (ClearCarpet Solution)

2. PERFIS DE USUÁRIOS
2.1 GERENCIADORA (CRISTAL DRYNEXIS)
Responsável por toda a operação do sistema.
Funcionalidades:
Dashboard com indicadores (KPIs, faturamento, chamados ativos)
Cadastro e gestão de locadoras
Cadastro, aprovação e controle de profissionais
Criação e gerenciamento de chamados
Definição de valor mínimo por m²
Gestão financeira (pagamentos e repasses)
Cadastro e gestão de produtos
Relatórios operacionais e financeiros

2.2 LOJAS LOCADORAS
Responsáveis pelo armazenamento e controle das máquinas e produtos.
Cadastro:
Nome fantasia
Razão social
CNPJ
Endereço completo
Responsável
Contato e e-mail
Funcionalidades:
Gestão de máquinas (cadastro, status e manutenção)
Controle de estoque de produtos
Visualização de receitas (locação + venda de produtos)
Histórico de movimentações

2.3 PROFISSIONAIS QUALIFICADOS
Responsáveis pela execução dos serviços.
Cadastro feito pelo admin apenas:
Nome, CPF
Endereço
E-mail e telefone
Dados bancários (PIX/conta)	
Senha
Regras de negócio:
Taxa de habilitação: R$ 1.800,00
Desconto por serviço (ex: 25% até quitar)
Funcionalidades:
Agenda de disponibilidade
Visualização de chamados disponíveis
Participação em lances (1 lance por chamado)
Aceite de chamados diretos
Acompanhamento de ganhos
Controle do saldo da taxa de habilitação

2.4 EMPRESAS COMPRADORAS
Clientes que possuem máquinas e contratam serviços.
Cadastro feito apenas pelo admin:
Empresa ou pessoa física
CNPJ/CPF
Endereço
Responsável
Contato
Senha
Funcionalidades:
Abrir chamados de serviço
Contratar profissionais (sem lance)
Comprar produtos
Histórico de serviços e pedidos

3. FLUXOS OPERACIONAIS
3.1 CHAMADOS COM LANCE (GERENCIADORA)
Gerenciadora abre chamado com:
Localização
Metragem (m²)
Valor base por m²
Profissionais enviam 1 lance
Sistema seleciona automaticamente o menor lance
Profissional vencedor é notificado

3.2 CHAMADOS DIRETOS (COMPRADOR)
Cliente abre chamado
Sistema aplica valor mínimo definido
Profissional aceita ou recusa
Cliente paga para a plataforma
Repasse:
80% para o profissional
20% para a gerenciadora

3.3 FLUXO FINANCEIRO
Pagamentos realizados dentro da plataforma
Repasse automático para:
Profissionais
Locadoras
Desconto automático da taxa de habilitação

3.4 VENDA DE PRODUTOS
Compradores realizam pedidos
Produtos saem do estoque das locadoras
Plataforma intermedia pagamento

4. MÓDULOS DO SISTEMA
4.1 USUÁRIOS
Autenticação
Controle de acesso por perfil
Cadastro e validação
4.2 MÁQUINAS
Cadastro por locadora
Controle de status
Histórico de uso e manutenção
4.3 ESTOQUE
Controle de produtos por loja
Entrada e saída de produtos
Integração com pedidos
4.4 CHAMADOS
Criação e gerenciamento
Lances
Aceite direto
Controle de status
4.5 FINANCEIRO
Transações
Repasses
Descontos automáticos
Relatórios
4.6 AGENDA
Disponibilidade dos profissionais
Controle de horários
Alocação de serviços
4.7 MARKETPLACE
Catálogo de produtos
Pedidos
Histórico de compras

5. PLATAFORMAS
Web

6. REQUISITOS TÉCNICOS
API REST para comunicação
Banco de dados relacional
Controle de permissões por perfil
Processamento de lances em tempo real
Integrações:

7. FUNCIONALIDADES AVANÇADAS
Notificações em tempo real
Ranking de profissionais
Geolocalização de serviços
Logs e auditoria
Monitoramento financeiro

8. RELATÓRIOS
Faturamento por período
Ganho por profissional
Performance de locadoras
Volume de serviços
Venda de produtos

9. FASES DO PROJETO
FASE 1 – MVP
Cadastro de usuários
Chamados básicos
Lances simples
Controle de profissionais
Financeiro básico
FASE 2 – OPERACIONAL
Estoque
Máquinas
Marketplace
Agenda completa
FASE 3 – ESCALA
Automação financeira
BI e dashboards
Otimização de distribuição de chamados

10. OBSERVAÇÕES
Sistema com características de marketplace + operação logística
Necessário suporte a tempo real (lances)
Forte dependência de controle financeiro automatizado
Arquitetura deve ser escalável desde o início

