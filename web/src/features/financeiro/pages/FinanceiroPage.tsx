import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { fetchFinanceiro } from '@/mocks/services'
import { CreateTransacaoForm } from '@/features/financeiro/CreateTransacaoForm'
import type { FinanceiroResumo, Transacao } from '@/types/domain'
import { formatBRL, formatDateBR } from '@/lib/format'
import { Landmark, Percent, Wallet } from 'lucide-react'

export function FinanceiroPage() {
  const [resumo, setResumo] = useState<FinanceiroResumo | null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    void fetchFinanceiro().then(({ resumo: r, transacoes: t }) => {
      if (alive) {
        setResumo(r)
        setTransacoes(t)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  if (loading || !resumo) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-56 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Resumo de repasses, taxa da plataforma e extrato de transações. Crie e gerencie pagamentos."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Repasses pendentes"
          value={formatBRL(resumo.repassesPendentes)}
          icon={Wallet}
        />
        <StatCard
          label="Taxa plataforma (mês)"
          value={formatBRL(resumo.taxaPlataformaMes)}
          hint="Taxa de operação"
          icon={Percent}
        />
        <StatCard
          label="Próximos pagamentos"
          value={String(resumo.proximosPagamentos.length)}
          hint="Itens agendados"
          icon={Landmark}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h3 className="font-semibold text-brand-navy">
              Próximos pagamentos
            </h3>
            <ul className="mt-4 space-y-3">
              {resumo.proximosPagamentos.map((p, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {p.descricao}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateBR(`${p.data}T12:00:00.000Z`)}
                  </p>
                  <p className="mt-1 font-semibold text-brand-navy">
                    {formatBRL(p.valor)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-5 lg:col-span-3 lg:order-last">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-brand-navy">Transações recentes</h3>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Referência</th>
                  <th className="px-3 py-2 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoes.map((t) => (
                  <tr key={t.id} className="bg-white hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-slate-600">
                      {formatDateBR(t.data)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {t.tipo}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-slate-600">
                      {t.referencia}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${t.valor < 0 ? 'text-red-700' : 'text-brand-navy'}`}
                    >
                      {formatBRL(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-1 lg:row-span-2">
          <CreateTransacaoForm
            onSuccess={() => {
              // Reload the list
              void fetchFinanceiro().then(({ resumo: r, transacoes: t }) => {
                setResumo(r)
                setTransacoes(t)
              })
            }}
          />
        </Card>
      </div>
    </div>
  )
}
