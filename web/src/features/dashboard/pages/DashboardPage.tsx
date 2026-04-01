import { useMemo, useEffect, useState } from 'react'
import {
  Activity,
  Building2,
  ClipboardList,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChartCard } from '@/components/charts/ChartCard'
import { CHART_AXIS, CHART_COLORS } from '@/components/charts/chartTheme'
import { fetchDashboard, listChamados } from '@/mocks/services'
import type { Chamado, DashboardSummary } from '@/types/domain'
import { formatBRL, formatDateBR } from '@/lib/format'

const STATUS_PT: Record<Chamado['status'], string> = {
  aberto: 'Aberto',
  em_selecao: 'Em seleção',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

function chamadoStatusBadge(status: Chamado['status']) {
  const map: Record<
    Chamado['status'],
    { variant: 'accent' | 'warning' | 'success' | 'default' | 'danger' }
  > = {
    aberto: { variant: 'accent' },
    em_selecao: { variant: 'warning' },
    em_andamento: { variant: 'accent' },
    concluido: { variant: 'success' },
    cancelado: { variant: 'danger' },
  }
  const m = map[status]
  return <Badge variant={m.variant}>{STATUS_PT[status]}</Badge>
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([fetchDashboard(), listChamados()]).then(([d, c]) => {
      if (alive) {
        setData(d)
        setChamados(c)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const mergedTrend = useMemo(() => {
    if (!data) return []
    return data.serieChamadosDiaria.map((row, i) => ({
      label: row.label,
      criados: row.criados,
      receita: data.serieReceitaDiaria[i]?.receita ?? 0,
    }))
  }, [data])

  const statusMix = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of chamados) {
      const lb = STATUS_PT[c.status]
      m.set(lb, (m.get(lb) ?? 0) + 1)
    }
    return [...m.entries()].map(([name, value]) => ({ name, value }))
  }, [chamados])

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Indicadores operacionais e financeiros — séries e pizza interativas (Recharts)."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento (mês)"
          value={formatBRL(data.faturamentoMes)}
          hint="Soma transações positivas no mês de referência"
          icon={TrendingUp}
        />
        <StatCard
          label="Chamados ativos"
          value={String(data.chamadosAtivos)}
          hint="Abertos + em andamento + em seleção"
          icon={Activity}
        />
        <StatCard
          label="Profissionais pendentes"
          value={String(data.profissionaisPendentes)}
          hint="Aguardando aprovação"
          icon={Users}
        />
        <StatCard
          label="Locadoras ativas"
          value={String(data.locadorasAtivas)}
          hint="Parceiros com máquinas"
          icon={Building2}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title="Tendência (14 dias)"
          subtitle="Barras: chamados criados · Linha: receita do dia (brushing abaixo)"
        >
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={mergedTrend} margin={{ top: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" {...CHART_AXIS} />
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                {...CHART_AXIS}
                label={{ value: 'Chamados', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                {...CHART_AXIS}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                label={{ value: 'R$', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const c = payload.find((p) => p.dataKey === 'criados')?.value
                  const r = payload.find((p) => p.dataKey === 'receita')?.value
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-brand-navy">{label}</p>
                <p className="text-slate-600">Chamados: {String(c)}</p>
                <p className="text-slate-600">Receita: {formatBRL(Number(r))}</p>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="criados"
                name="Chamados criados"
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS[1] }}
                activeDot={{ r: 5 }}
              />
              <Brush dataKey="label" height={24} stroke="#5bc0de" travellerWidth={8} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Mix de status"
          subtitle="Base completa de chamados (mock)"
        >
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={statusMix}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={96}
                paddingAngle={2}
              >
                {statusMix.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0]
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-brand-navy">{String(p.name)}</p>
                      <p className="text-slate-600">Quantidade: {String(p.value)}</p>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <ClipboardList className="h-4 w-4 text-brand-accent-dark" />
          <h3 className="font-semibold text-brand-navy">Chamados recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">UF</th>
                <th className="px-5 py-3 font-medium">Local</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.chamadosRecentes.map((c) => (
                <tr key={c.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    #{c.id}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={c.tipo === 'lance' ? 'accent' : 'default'}>
                      {c.tipo === 'lance' ? 'Com lance' : 'Direto'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{c.regiao}</td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-slate-700">
                    {c.localizacao}
                  </td>
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    {formatBRL(c.valorTotal)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDateBR(c.criadoEm)}
                  </td>
                  <td className="px-5 py-3">{chamadoStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
