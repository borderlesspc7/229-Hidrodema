import { useEffect, useMemo, useState } from 'react'
import { Gavel, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { listChamados } from '@/mocks/services'
import type { Chamado, ChamadoStatus, ChamadoTipo } from '@/types/domain'
import { formatBRL, formatDateBR } from '@/lib/format'
import { cn } from '@/lib/cn'

const CHAMADO_STATUS_PT: Record<ChamadoStatus, string> = {
  aberto: 'Aberto',
  em_selecao: 'Em seleção',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const tabs: { id: ChamadoTipo | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'lance', label: 'Com lance' },
  { id: 'direto', label: 'Direto' },
]

function menorLance(chamado: Chamado) {
  if (!chamado.lances?.length) return null
  return chamado.lances.reduce((a, b) => (a.valor <= b.valor ? a : b))
}

export function ChamadosPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('todos')
  const [rows, setRows] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void listChamados().then((r) => {
      if (alive) {
        setRows(r)
        setLoading(false)
        if (r[0]) setSelectedId(r[0].id)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    if (tab === 'todos') return rows
    return rows.filter((c) => c.tipo === tab)
  }, [rows, tab])

  const selected = visible.find((c) => c.id === selectedId) ?? visible[0]

  return (
    <div>
      <PageHeader
        title="Chamados"
        description="Chamados com lance (gerenciadora) e diretos (comprador). Dados estáticos mockados."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-brand-accent text-brand-navy shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando…</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-slate-50',
                      selected?.id === c.id && 'bg-brand-accent/10',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">
                        #{c.id}
                      </span>
                      <Badge variant={c.tipo === 'lance' ? 'accent' : 'default'}>
                        {c.tipo === 'lance' ? 'Lance' : 'Direto'}
                      </Badge>
                      <Badge variant="navy" className="!bg-slate-100 !text-slate-700">
                        {CHAMADO_STATUS_PT[c.status]}
                      </Badge>
                    </div>
                    <p className="flex items-start gap-2 text-sm text-slate-800">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent-dark" />
                      <span className="line-clamp-2">{c.localizacao}</span>
                    </p>
                    <p className="text-sm font-semibold text-brand-navy">
                      {formatBRL(c.valorTotal)} · {c.metragemM2} m²
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Gavel className="h-5 w-5 text-brand-accent-dark" />
                <h3 className="text-lg font-semibold text-brand-navy">
                  Detalhe do chamado
                </h3>
              </div>
              <p className="text-sm text-slate-600">
                Criado em {formatDateBR(selected.criadoEm)}
              </p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-slate-500">Local</dt>
                  <dd className="mt-1">{selected.localizacao}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Valor total</dt>
                  <dd className="mt-1 font-semibold text-brand-navy">
                    {formatBRL(selected.valorTotal)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">m²</dt>
                  <dd className="mt-1">{selected.metragemM2}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Base R$/m²</dt>
                  <dd className="mt-1">
                    {formatBRL(selected.valorBaseM2)}
                  </dd>
                </div>
              </dl>
              {selected.tipo === 'direto' && selected.profissionalAtribuido ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Profissional
                  </p>
                  <p className="mt-1 font-medium text-brand-navy">
                    {selected.profissionalAtribuido}
                  </p>
                </div>
              ) : null}
              {selected.tipo === 'lance' ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-brand-navy">
                    Lances recebidos
                  </p>
                  {!selected.lances?.length ? (
                    <p className="text-sm text-slate-500">
                      Nenhum lance ainda (mock).
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {[...selected.lances]
                        .sort((a, b) => a.valor - b.valor)
                        .map((l, idx) => (
                          <li
                            key={`${l.profissionalId}-${idx}`}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                          >
                            <span className="text-sm text-slate-800">
                              {l.profissionalNome}
                            </span>
                            <span className="font-medium text-brand-navy">
                              {formatBRL(l.valor)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                  {menorLance(selected) ? (
                    <p className="mt-3 text-sm text-slate-600">
                      Menor lance (simulação):{' '}
                      <strong className="text-brand-navy">
                        {formatBRL(menorLance(selected)!.valor)}
                      </strong>{' '}
                      — {menorLance(selected)!.profissionalNome}
                    </p>
                  ) : null}
                  <Button variant="secondary" className="mt-4" disabled>
                    Fechar com menor lance (API)
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Selecione um chamado.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
