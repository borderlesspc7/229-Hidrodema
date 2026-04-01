export type LocadoraStatus = 'ativa' | 'inativa'

export interface Locadora {
  id: string
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  cidade: string
  estado: string
  responsavel: string
  email: string
  telefone: string
  endereco: string
  status: LocadoraStatus
}

export type ProfissionalStatus = 'pendente' | 'aprovado' | 'reprovado'

export interface Profissional {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  status: ProfissionalStatus
  saldoTaxaHabilitacao: number
}

export type ChamadoTipo = 'lance' | 'direto'
export type ChamadoStatus =
  | 'aberto'
  | 'em_selecao'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'

export interface Lance {
  profissionalId: string
  profissionalNome: string
  valor: number
}

export interface Chamado {
  id: string
  tipo: ChamadoTipo
  status: ChamadoStatus
  localizacao: string
  metragemM2: number
  valorBaseM2: number
  valorTotal: number
  criadoEm: string
  locadoraId: string
  regiao: string
  lances?: Lance[]
  profissionalAtribuido?: string
}

export type TransacaoCategoria =
  | 'taxa_plataforma'
  | 'repasse_profissional'
  | 'repasse_locadora'
  | 'venda_produto'
  | 'desconto_habilitacao'
  | 'outro'

export interface Transacao {
  id: string
  data: string
  tipo: string
  valor: number
  referencia: string
  categoria: TransacaoCategoria
  locadoraId?: string
  profissionalId?: string
}

export interface PedidoVenda {
  id: string
  data: string
  valorTotal: number
  quantidade: number
  locadoraId: string
  produtoSku: string
  produtoNome: string
}

export interface AnalyticsDataset {
  chamados: Chamado[]
  transacoes: Transacao[]
  pedidos: PedidoVenda[]
  locadoras: Locadora[]
  profissionais: Profissional[]
}

export interface FinanceiroResumo {
  repassesPendentes: number
  taxaPlataformaMes: number
  proximosPagamentos: { descricao: string; data: string; valor: number }[]
}

export interface Produto {
  id: string
  sku: string
  nome: string
  preco: number
  estoqueAgregado: number
  linha: string
}

export interface DashboardSummary {
  faturamentoMes: number
  chamadosAtivos: number
  profissionaisPendentes: number
  locadorasAtivas: number
  chamadosRecentes: Chamado[]
  /** Últimos 14 dias — contagem de chamados criados */
  serieChamadosDiaria: { data: string; criados: number; label: string }[]
  /** Últimos 14 dias — soma transações positivas (R$) */
  serieReceitaDiaria: { data: string; receita: number; label: string }[]
}

export interface ReportModel {
  filtrosAplicados: ReportFilters
  kpis: {
    receitaTotal: number
    receitaServicos: number
    receitaProdutos: number
    chamadosCount: number
    valorChamados: number
    ticketMedio: number
    pedidosCount: number
  }
  serieDiaria: { data: string; label: string; receita: number; servicos: number; produtos: number }[]
  chamadosPorRegiao: { regiao: string; qtd: number; valor: number }[]
  chamadosPorTipo: { tipo: string; qtd: number; valor: number }[]
  chamadosPorStatus: { status: string; qtd: number }[]
  locadorasRank: { locadoraId: string; nome: string; receita: number; chamados: number }[]
  profissionaisRank: { profissionalId: string; nome: string; repasses: number }[]
  mixCategoriasFinanceiras: { categoria: string; valor: number }[]
}

export interface ReportFilters {
  dateFrom: string
  dateTo: string
  regioes: string[]
  tiposChamado: ChamadoTipo[]
  statusChamado: ChamadoStatus[]
  locadoraIds: string[]
  categoriasFinanceiras: TransacaoCategoria[]
}
