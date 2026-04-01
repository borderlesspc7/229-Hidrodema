import type { DashboardSummary } from '@/types/domain'
import type {
  Chamado,
  Locadora,
  Profissional,
  Transacao,
} from '@/types/domain'

const ATIVOS = new Set(['aberto', 'em_selecao', 'em_andamento'])

export function computeDashboardSummary(data: {
  chamados: Chamado[]
  transacoes: Transacao[]
  locadoras: Locadora[]
  profissionais: Profissional[]
}): DashboardSummary {
  const { chamados, transacoes, locadoras, profissionais } = data
  const refMs = Math.max(
    ...chamados.map((c) => new Date(c.criadoEm).getTime()),
    ...transacoes.map((t) => new Date(t.data).getTime()),
  )
  const ref = new Date(refMs)
  const y = ref.getFullYear()
  const mo = ref.getMonth()

  const faturamentoMes = transacoes
    .filter((t) => {
      const d = new Date(t.data)
      return d.getFullYear() === y && d.getMonth() === mo && t.valor > 0
    })
    .reduce((s, t) => s + t.valor, 0)

  const chamadosAtivos = chamados.filter((c) => ATIVOS.has(c.status)).length
  const profissionaisPendentes = profissionais.filter(
    (p) => p.status === 'pendente',
  ).length
  const locadorasAtivas = locadoras.filter((l) => l.status === 'ativa').length

  const chamadosRecentes = [...chamados]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 8)

  const serieChamadosDiaria: DashboardSummary['serieChamadosDiaria'] = []
  const serieReceitaDiaria: DashboardSummary['serieReceitaDiaria'] = []

  for (let i = 13; i >= 0; i--) {
    const day = new Date(ref)
    day.setDate(day.getDate() - i)
    day.setHours(0, 0, 0, 0)
    const next = new Date(day)
    next.setDate(next.getDate() + 1)

    const criados = chamados.filter((c) => {
      const dc = new Date(c.criadoEm)
      return dc >= day && dc < next
    }).length

    const receita = transacoes
      .filter((t) => {
        const dt = new Date(t.data)
        return dt >= day && dt < next && t.valor > 0
      })
      .reduce((s, t) => s + t.valor, 0)

    const key = day.toISOString().slice(0, 10)
    const label = day.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })

    serieChamadosDiaria.push({ data: key, criados, label })
    serieReceitaDiaria.push({ data: key, receita, label })
  }

  return {
    faturamentoMes,
    chamadosAtivos,
    profissionaisPendentes,
    locadorasAtivas,
    chamadosRecentes,
    serieChamadosDiaria,
    serieReceitaDiaria,
  }
}
