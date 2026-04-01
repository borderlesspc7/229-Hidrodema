import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'
import { Filter, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ChartCard } from '@/components/charts/ChartCard'
import { CHART_AXIS, CHART_COLORS } from '@/components/charts/chartTheme'
import { fetchAnalyticsDataset } from '@/mocks/services'
import type {
  AnalyticsDataset,
  ChamadoStatus,
  ChamadoTipo,
  TransacaoCategoria,
} from '@/types/domain'
import {
  buildReportModel,
  defaultReportFilters,
} from '@/features/relatorios/lib/buildReportModel'
import { formatBRL } from '@/lib/format'

const TIPOS_CHAMADO: { v: ChamadoTipo; l: string }[] = [
  { v: 'lance', l: 'Com lance' },
  { v: 'direto', l: 'Direto' },
]

const STATUS_OPTS: { v: ChamadoStatus; l: string }[] = [
  { v: 'aberto', l: 'Aberto' },
  { v: 'em_selecao', l: 'Em seleção' },
  { v: 'em_andamento', l: 'Em andamento' },
  { v: 'concluido', l: 'Concluído' },
  { v: 'cancelado', l: 'Cancelado' },
]

const CAT_OPTS: { v: TransacaoCategoria; l: string }[] = [
  { v: 'taxa_plataforma', l: 'Taxa plataforma' },
  { v: 'repasse_profissional', l: 'Repasse profissional' },
  { v: 'repasse_locadora', l: 'Repasse locadora' },
  { v: 'venda_produto', l: 'Venda produto' },
  { v: 'desconto_habilitacao', l: 'Desconto habilitação' },
  { v: 'outro', l: 'Outros' },
]

function TooltipBRL({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-medium text-brand-navy">{label}</p> : null}
      {payload.map((p) => (
        <p key={p.name} className="text-slate-600">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: p.color }} />
          {p.name}:{' '}
          <span className="font-semibold text-brand-navy">
            {typeof p.value === 'number' ? formatBRL(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function TooltipCount({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-medium text-brand-navy">{label}</p> : null}
      {payload.map((p) => (
        <p key={p.name} className="text-slate-600">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function SlicerSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      {children}
    </div>
  )
}

function toggleList<T>(list: T[], val: T): T[] {
  return list.includes(val) ? list.filter((x) => x !== val) : [...list, val]
}

export function RelatoriosPage() {
  const [dataset, setDataset] = useState<AnalyticsDataset | null>(null)
  const [filters, setFilters] = useState<ReturnType<typeof defaultReportFilters> | null>(null)

  useEffect(() => {
    let alive = true
    void fetchAnalyticsDataset().then((d) => {
      if (!alive) return
      setDataset(d)
      setFilters(defaultReportFilters(d))
    })
    return () => {
      alive = false
    }
  }, [])

  const model = useMemo(() => {
    if (!dataset || !filters) return null
    return buildReportModel(dataset, filters)
  }, [dataset, filters])

  const ufs = useMemo(() => {
    if (!dataset) return []
    return [...new Set(dataset.locadoras.map((l) => l.estado))].sort()
  }, [dataset])

  function applyPreset(preset: '7d' | '30d' | '90d' | 'all') {
    if (!dataset) return
    const times = [
      ...dataset.chamados.map((c) => new Date(c.criadoEm).getTime()),
      ...dataset.transacoes.map((t) => new Date(t.data).getTime()),
    ]
    const maxT = Math.max(...times)
    const minT = Math.min(...times)
    const to = new Date(maxT)
    const from = new Date(maxT)
    if (preset === 'all') {
      from.setTime(minT)
    } else {
      const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89
      from.setDate(from.getDate() - days)
    }
    setFilters((f) =>
      f
        ? {
            ...f,
            dateFrom: from.toISOString().slice(0, 10),
            dateTo: to.toISOString().slice(0, 10),
          }
        : f,
    )
  }

  function resetFilters() {
    if (!dataset) return
    setFilters(defaultReportFilters(dataset))
  }

  if (!dataset || !filters || !model) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios analíticos" description="Carregando base mock..." />
        <div className="grid animate-pulse gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Relatórios analíticos"
        description="Painel estilo Power BI: combina filtros (slicers), cartões de KPI e visuais interativos — tudo calculado no cliente a partir dos mocks."
      />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4 xl:w-80">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Filter className="h-4 w-4 text-brand-accent-dark" />
            <h2 className="text-sm font-semibold text-brand-navy">Filtros</h2>
          </div>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
            <SlicerSection title="Período">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(
                  [
                    ['7d', '7 dias'],
                    ['30d', '30 dias'],
                    ['90d', '90 dias'],
                    ['all', 'Tudo'],
                  ] as const
                ).map(([k, lab]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => applyPreset(k)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-brand-navy hover:bg-brand-accent/20"
                  >
                    {lab}
                  </button>
                ))}
              </div>
              <label className="mb-2 block text-xs text-slate-600">
                De
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((f) => (f ? { ...f, dateFrom: e.target.value } : f))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs text-slate-600">
                Até
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((f) => (f ? { ...f, dateTo: e.target.value } : f))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
            </SlicerSection>

            <SlicerSection title="Região (UF)">
              <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                {ufs.map((uf) => (
                  <label key={uf} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.regioes.includes(uf)}
                      onChange={() =>
                        setFilters((f) =>
                          f
                            ? { ...f, regioes: toggleList(f.regioes, uf) }
                            : f,
                        )
                      }
                      className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                    />
                    {uf}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Vazio = todas</p>
            </SlicerSection>

            <SlicerSection title="Locadora">
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                {dataset.locadoras.map((l) => (
                  <label key={l.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.locadoraIds.includes(l.id)}
                      onChange={() =>
                        setFilters((f) =>
                          f
                            ? {
                                ...f,
                                locadoraIds: toggleList(f.locadoraIds, l.id),
                              }
                            : f,
                        )
                      }
                      className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                    />
                    <span className="truncate">{l.nomeFantasia}</span>
                  </label>
                ))}
              </div>
            </SlicerSection>

            <SlicerSection title="Tipo de chamado">
              {TIPOS_CHAMADO.map(({ v, l }) => (
                <label key={v} className="mb-1 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.tiposChamado.includes(v)}
                    onChange={() =>
                      setFilters((f) =>
                        f
                          ? {
                              ...f,
                              tiposChamado: toggleList(f.tiposChamado, v),
                            }
                          : f,
                      )
                    }
                    className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                  />
                  {l}
                </label>
              ))}
            </SlicerSection>

            <SlicerSection title="Status do chamado">
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {STATUS_OPTS.map(({ v, l }) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.statusChamado.includes(v)}
                      onChange={() =>
                        setFilters((f) =>
                          f
                            ? {
                                ...f,
                                statusChamado: toggleList(f.statusChamado, v),
                              }
                            : f,
                        )
                      }
                      className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                    />
                    {l}
                  </label>
                ))}
              </div>
            </SlicerSection>

            <SlicerSection title="Categoria financeira">
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {CAT_OPTS.map(({ v, l }) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.categoriasFinanceiras.includes(v)}
                      onChange={() =>
                        setFilters((f) =>
                          f
                            ? {
                                ...f,
                                categoriasFinanceiras: toggleList(
                                  f.categoriasFinanceiras,
                                  v,
                                ),
                              }
                            : f,
                        )
                      }
                      className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                    />
                    {l}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Afeta transações e séries de receita
              </p>
            </SlicerSection>

            <Button variant="secondary" className="w-full gap-2" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Redefinir filtros
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {[
              {
                t: 'Receita total',
                v: formatBRL(model.kpis.receitaTotal),
                s: 'Serviços + produtos (período)',
              },
              {
                t: 'Receita serviços',
                v: formatBRL(model.kpis.receitaServicos),
                s: 'Transações (exceto marketplace)',
              },
              {
                t: 'Receita produtos',
                v: formatBRL(model.kpis.receitaProdutos),
                s: 'Pedidos + vendas no extrato',
              },
              {
                t: 'Chamados / ticket',
                v: `${model.kpis.chamadosCount} · ${formatBRL(model.kpis.ticketMedio)}`,
                s: 'Volume e ticket médio',
              },
            ].map((k) => (
              <div
                key={k.t}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-slate-500">{k.t}</p>
                <p className="mt-1 text-lg font-semibold text-brand-navy">{k.v}</p>
                <p className="mt-1 text-xs text-slate-500">{k.s}</p>
              </div>
            ))}
          </div>

          <ChartCard
            title="Receita diária (empilhado)"
            subtitle="Serviços vs produtos — use o brush para focar no tempo"
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={model.serieDiaria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  {...CHART_AXIS}
                />
                <Tooltip content={<TooltipBRL />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="servicos"
                  name="Serviços"
                  stackId="1"
                  stroke={CHART_COLORS[1]}
                  fill={CHART_COLORS[1]}
                  fillOpacity={0.45}
                />
                <Area
                  type="monotone"
                  dataKey="produtos"
                  name="Produtos"
                  stackId="1"
                  stroke={CHART_COLORS[0]}
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.55}
                />
                {model.serieDiaria.length > 10 ? (
                  <Brush dataKey="label" height={22} stroke="#5bc0de" travellerWidth={8} />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Chamados por região" subtitle="Valor agregado (passe o mouse para ver quantidade)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={model.chamadosPorRegiao}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" {...CHART_AXIS} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                  <YAxis type="category" dataKey="regiao" width={36} {...CHART_AXIS} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0].payload as {
                        regiao: string
                        valor: number
                        qtd: number
                      }
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-semibold text-brand-navy">{row.regiao}</p>
                          <p className="text-slate-600">Valor: {formatBRL(row.valor)}</p>
                          <p className="text-slate-600">Chamados: {row.qtd}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="valor" name="Valor R$" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Mix de status" subtitle="Distribuição filtrada">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={model.chamadosPorStatus}
                    dataKey="qtd"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {model.chamadosPorStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipCount />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Tipo de chamado">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={model.chamadosPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tipo" {...CHART_AXIS} />
                  <YAxis {...CHART_AXIS} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0].payload as {
                        tipo: string
                        valor: number
                        qtd: number
                      }
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-semibold text-brand-navy">{row.tipo}</p>
                          <p className="text-slate-600">Valor: {formatBRL(row.valor)}</p>
                          <p className="text-slate-600">Qtd: {row.qtd}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="valor" name="Valor R$" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Volume financeiro por categoria" subtitle="|valor| agregado">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={model.mixCategoriasFinanceiras} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} {...CHART_AXIS} />
                  <YAxis type="category" dataKey="categoria" width={120} {...CHART_AXIS} />
                  <Tooltip content={<TooltipBRL />} />
                  <Bar dataKey="valor" name="Volume" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Locadoras — receita" subtitle="Chamados no detalhe ao passar o mouse">
            <ResponsiveContainer width="100%" height={Math.min(420, 40 + model.locadorasRank.length * 36)}>
              <BarChart
                data={model.locadorasRank.slice(0, 10)}
                layout="vertical"
                margin={{ left: 12, right: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" {...CHART_AXIS} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={130}
                  {...CHART_AXIS}
                  tick={{ ...CHART_AXIS.tick, fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const row = payload[0].payload as {
                      nome: string
                      receita: number
                      chamados: number
                    }
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-brand-navy">{row.nome}</p>
                        <p className="text-slate-600">Receita: {formatBRL(row.receita)}</p>
                        <p className="text-slate-600">Chamados: {row.chamados}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="receita" name="Receita R$" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {model.profissionaisRank.length > 0 ? (
            <ChartCard title="Repasses a profissionais (top)" subtitle="Soma no período filtrado">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={model.profissionaisRank}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="nome" angle={-20} textAnchor="end" height={70} interval={0} {...CHART_AXIS} />
                  <YAxis {...CHART_AXIS} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                  <Tooltip content={<TooltipBRL />} />
                  <Line
                    type="monotone"
                    dataKey="repasses"
                    name="Repasse"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS[1] }}
                    activeDot={{ r: 6 }}
                  />
                  {model.profissionaisRank.length > 6 ? (
                    <Brush dataKey="nome" height={22} stroke="#5bc0de" />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
