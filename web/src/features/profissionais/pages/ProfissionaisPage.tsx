import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { listProfissionais } from '@/mocks/services'
import type { Profissional, ProfissionalStatus } from '@/types/domain'
import { formatBRL, maskCpf } from '@/lib/format'
import { CreateProfissionalForm } from '@/features/profissionais/CreateProfissionalForm'

function statusBadge(status: ProfissionalStatus) {
  if (status === 'aprovado')
    return <Badge variant="success">Aprovado</Badge>
  if (status === 'pendente')
    return <Badge variant="warning">Pendente</Badge>
  return <Badge variant="danger">Reprovado</Badge>
}

export function ProfissionaisPage() {
  const [rows, setRows] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)

  function loadRows() {
    setLoading(true)
    void listProfissionais().then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(() => {
    let alive = true
    void listProfissionais().then((r) => {
      if (alive) {
        setRows(r)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  function setStatus(id: string, status: ProfissionalStatus) {
    setRows((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description="Cadastro e aprovação pela gerenciadora."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Carregando…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Nome</th>
                      <th className="px-5 py-3 font-medium">CPF</th>
                      <th className="px-5 py-3 font-medium">E-mail</th>
                      <th className="px-5 py-3 font-medium">Taxa habilitação</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => (
                      <tr key={p.id} className="bg-white hover:bg-slate-50/80">
                        <td className="px-5 py-3 font-medium text-brand-navy">
                          {p.nome}
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-600">
                          {maskCpf(p.cpf)}
                        </td>
                        <td className="px-5 py-3 text-slate-700">{p.email}</td>
                        <td className="px-5 py-3">
                          {p.saldoTaxaHabilitacao > 0 ? (
                            <span className="font-medium text-amber-800">
                              {formatBRL(p.saldoTaxaHabilitacao)} a quitar
                            </span>
                          ) : (
                            <span className="text-slate-500">Quitada</span>
                          )}
                        </td>
                        <td className="px-5 py-3">{statusBadge(p.status)}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="primary"
                              className="!py-1.5 !text-xs"
                              disabled={p.status === 'aprovado'}
                              onClick={() => setStatus(p.id, 'aprovado')}
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="secondary"
                              className="!py-1.5 !text-xs"
                              disabled={p.status === 'reprovado'}
                              onClick={() => setStatus(p.id, 'reprovado')}
                            >
                              Reprovar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4">
            <CreateProfissionalForm onSuccess={loadRows} />
          </Card>
        </div>
      </div>
    </div>
  )
}
