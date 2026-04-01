import type {
  AnalyticsDataset,
  ChamadoStatus,
  ChamadoTipo,
  ReportFilters,
  ReportModel,
  TransacaoCategoria,
} from '@/types/domain'
import { endOfDay, eachDayInclusive, parseISODateOnly, startOfDay } from '@/lib/dates'

const STATUS_LABEL: Record<ChamadoStatus, string> = {
  aberto: 'Aberto',
  em_selecao: 'Em seleção',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const CAT_LABEL: Record<TransacaoCategoria, string> = {
  taxa_plataforma: 'Taxa plataforma',
  repasse_profissional: 'Repasse profissional',
  repasse_locadora: 'Repasse locadora',
  venda_produto: 'Venda produto',
  desconto_habilitacao: 'Desconto habilitação',
  outro: 'Outros',
}

export function defaultReportFilters(dataset: AnalyticsDataset): ReportFilters {
  const times = [
    ...dataset.chamados.map((c) => new Date(c.criadoEm).getTime()),
    ...dataset.transacoes.map((t) => new Date(t.data).getTime()),
    ...dataset.pedidos.map((p) => new Date(p.data).getTime()),
  ]
  const maxT = Math.max(...times)
  const to = new Date(maxT)
  const from = new Date(maxT)
  from.setDate(from.getDate() - 89)
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
    regioes: [],
    tiposChamado: [],
    statusChamado: [],
    locadoraIds: [],
    categoriasFinanceiras: [],
  }
}

export function buildReportModel(
  dataset: AnalyticsDataset,
  filters: ReportFilters,
): ReportModel {
  let from = startOfDay(parseISODateOnly(filters.dateFrom))
  let to = endOfDay(parseISODateOnly(filters.dateTo))
  if (from > to) {
    from = startOfDay(parseISODateOnly(filters.dateTo))
    to = endOfDay(parseISODateOnly(filters.dateFrom))
  }

  const pickRegiao = (r: string) =>
    filters.regioes.length === 0 || filters.regioes.includes(r)
  const pickTipo = (t: ChamadoTipo) =>
    filters.tiposChamado.length === 0 || filters.tiposChamado.includes(t)
  const pickStatus = (s: ChamadoStatus) =>
    filters.statusChamado.length === 0 || filters.statusChamado.includes(s)
  const pickLoc = (id: string) =>
    filters.locadoraIds.length === 0 || filters.locadoraIds.includes(id)

  const chamadosFiltrados = dataset.chamados.filter((c) => {
    const dt = new Date(c.criadoEm)
    if (dt < from || dt > to) return false
    if (!pickRegiao(c.regiao)) return false
    if (!pickTipo(c.tipo)) return false
    if (!pickStatus(c.status)) return false
    if (!pickLoc(c.locadoraId)) return false
    return true
  })

  const transFiltradas = dataset.transacoes.filter((t) => {
    const dt = new Date(t.data)
    if (dt < from || dt > to) return false
    if (
      filters.categoriasFinanceiras.length > 0 &&
      !filters.categoriasFinanceiras.includes(t.categoria)
    )
      return false
    if (t.locadoraId && !pickLoc(t.locadoraId)) return false
    return true
  })

  const pedidosFiltrados = dataset.pedidos.filter((p) => {
    const dt = new Date(p.data)
    if (dt < from || dt > to) return false
    if (!pickLoc(p.locadoraId)) return false
    return pickRegiao(
      dataset.locadoras.find((l) => l.id === p.locadoraId)?.estado ?? '',
    )
  })

  const receitaProdutos =
    pedidosFiltrados.reduce((s, p) => s + p.valorTotal, 0) +
    transFiltradas
      .filter((t) => t.categoria === 'venda_produto' && t.valor > 0)
      .reduce((s, t) => s + t.valor, 0)

  const receitaServicos = transFiltradas
    .filter(
      (t) =>
        t.valor > 0 &&
        t.categoria !== 'venda_produto' &&
        t.categoria !== 'outro',
    )
    .reduce((s, t) => s + t.valor, 0)

  const receitaTotal = receitaServicos + receitaProdutos

  const valorChamados = chamadosFiltrados.reduce((s, c) => s + c.valorTotal, 0)
  const chamadosCount = chamadosFiltrados.length
  const ticketMedio = chamadosCount > 0 ? valorChamados / chamadosCount : 0

  const days = eachDayInclusive(from, to)
  const serieDiaria = days.map((day) => {
    const d0 = startOfDay(day)
    const d1 = new Date(d0)
    d1.setDate(d1.getDate() + 1)
    const servicos = transFiltradas
      .filter((t) => {
        const dt = new Date(t.data)
        return dt >= d0 && dt < d1 && t.valor > 0 && t.categoria !== 'venda_produto'
      })
      .reduce((s, t) => s + t.valor, 0)
    const produtosDia =
      pedidosFiltrados
        .filter((p) => {
          const dt = new Date(p.data)
          return dt >= d0 && dt < d1
        })
        .reduce((s, p) => s + p.valorTotal, 0) +
      transFiltradas
        .filter((t) => {
          const dt = new Date(t.data)
          return (
            dt >= d0 &&
            dt < d1 &&
            t.categoria === 'venda_produto' &&
            t.valor > 0
          )
        })
        .reduce((s, t) => s + t.valor, 0)

    return {
      data: d0.toISOString().slice(0, 10),
      label: d0.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      receita: servicos + produtosDia,
      servicos,
      produtos: produtosDia,
    }
  })

  const regioesMap = new Map<string, { qtd: number; valor: number }>()
  for (const c of chamadosFiltrados) {
    const cur = regioesMap.get(c.regiao) ?? { qtd: 0, valor: 0 }
    cur.qtd += 1
    cur.valor += c.valorTotal
    regioesMap.set(c.regiao, cur)
  }
  const chamadosPorRegiao = [...regioesMap.entries()]
    .map(([regiao, v]) => ({ regiao, ...v }))
    .sort((a, b) => b.valor - a.valor)

  const tiposMap = new Map<string, { qtd: number; valor: number }>()
  for (const c of chamadosFiltrados) {
    const key = c.tipo === 'lance' ? 'Com lance' : 'Direto'
    const cur = tiposMap.get(key) ?? { qtd: 0, valor: 0 }
    cur.qtd += 1
    cur.valor += c.valorTotal
    tiposMap.set(key, cur)
  }
  const chamadosPorTipo = [...tiposMap.entries()].map(([tipo, v]) => ({
    tipo,
    ...v,
  }))

  const stMap = new Map<string, number>()
  for (const c of chamadosFiltrados) {
    const lb = STATUS_LABEL[c.status]
    stMap.set(lb, (stMap.get(lb) ?? 0) + 1)
  }
  const chamadosPorStatus = [...stMap.entries()].map(([status, qtd]) => ({
    status,
    qtd,
  }))

  const locCh = new Map<string, number>()
  const locV = new Map<string, number>()
  for (const c of chamadosFiltrados) {
    locCh.set(c.locadoraId, (locCh.get(c.locadoraId) ?? 0) + 1)
    locV.set(
      c.locadoraId,
      (locV.get(c.locadoraId) ?? 0) + c.valorTotal,
    )
  }
  for (const t of transFiltradas) {
    if (!t.locadoraId || t.valor <= 0) continue
    locV.set(
      t.locadoraId,
      (locV.get(t.locadoraId) ?? 0) + t.valor,
    )
  }
  for (const p of pedidosFiltrados) {
    locV.set(
      p.locadoraId,
      (locV.get(p.locadoraId) ?? 0) + p.valorTotal,
    )
  }

  const locadorasRank = dataset.locadoras
    .map((l) => ({
      locadoraId: l.id,
      nome: l.nomeFantasia,
      receita: locV.get(l.id) ?? 0,
      chamados: locCh.get(l.id) ?? 0,
    }))
    .filter((x) => x.receita > 0 || x.chamados > 0)
    .sort((a, b) => b.receita - a.receita)

  const profMap = new Map<string, number>()
  for (const t of transFiltradas) {
    if (t.categoria !== 'repasse_profissional' || !t.profissionalId) continue
    if (t.valor <= 0) continue
    profMap.set(
      t.profissionalId,
      (profMap.get(t.profissionalId) ?? 0) + t.valor,
    )
  }
  const profissionaisRank = dataset.profissionais
    .map((p) => ({
      profissionalId: p.id,
      nome: p.nome,
      repasses: profMap.get(p.id) ?? 0,
    }))
    .filter((x) => x.repasses > 0)
    .sort((a, b) => b.repasses - a.repasses)
    .slice(0, 12)

  const catMap = new Map<string, number>()
  for (const t of transFiltradas) {
    const lb = CAT_LABEL[t.categoria]
    catMap.set(lb, (catMap.get(lb) ?? 0) + Math.abs(t.valor))
  }
  const mixCategoriasFinanceiras = [...catMap.entries()]
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor)

  return {
    filtrosAplicados: { ...filters },
    kpis: {
      receitaTotal,
      receitaServicos,
      receitaProdutos,
      chamadosCount,
      valorChamados,
      ticketMedio,
      pedidosCount: pedidosFiltrados.length,
    },
    serieDiaria,
    chamadosPorRegiao,
    chamadosPorTipo,
    chamadosPorStatus,
    locadorasRank,
    profissionaisRank,
    mixCategoriasFinanceiras,
  }
}
