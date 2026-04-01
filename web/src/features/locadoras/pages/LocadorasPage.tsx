import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { listLocadoras } from '@/mocks/services'
import { CreateLocadoraForm } from '@/features/locadoras/CreateLocadoraForm'
import type { Locadora } from '@/types/domain'

export function LocadorasPage() {
  const [rows, setRows] = useState<Locadora[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    void listLocadoras().then((r) => {
      if (alive) {
        setRows(r)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (l) =>
        l.nomeFantasia.toLowerCase().includes(s) ||
        l.cnpj.includes(s) ||
        l.cidade.toLowerCase().includes(s),
    )
  }, [q, rows])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locadoras"
        description="Lojas parceiras com máquinas e estoque — cadastro e acompanhamento."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar por nome, CNPJ ou cidade…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none ring-brand-accent/30 focus:ring-2"
                />
              </div>
              <p className="text-sm text-slate-500">
                {loading ? 'Carregando…' : `${filtered.length} locadora(s)`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nome fantasia</th>
                    <th className="px-5 py-3 font-medium">CNPJ</th>
                    <th className="px-5 py-3 font-medium">Cidade</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((l) => (
                    <tr key={l.id} className="bg-white hover:bg-slate-50/80">
                      <td className="px-5 py-3 font-medium text-brand-navy">
                        {l.nomeFantasia}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-600">
                        {l.cnpj}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {l.cidade} / {l.estado}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            l.status === 'ativa' ? 'success' : 'default'
                          }
                        >
                          {l.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/locadoras/${l.id}`}
                          className="text-sm font-medium text-brand-accent-dark hover:underline"
                        >
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4">
            <CreateLocadoraForm
              onSuccess={() => {
                // Reload the list
                setRows([])
                setLoading(true)
                void listLocadoras().then((r) => {
                  setRows(r)
                  setLoading(false)
                })
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
