import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getLocadoraById } from '@/mocks/services'
import type { Locadora } from '@/types/domain'

export function LocadoraDetalhePage() {
  const { id } = useParams()
  const [loc, setLoc] = useState<Locadora | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    let alive = true
    void getLocadoraById(id).then((r) => {
      if (alive) setLoc(r)
    })
    return () => {
      alive = false
    }
  }, [id])

  if (loc === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-40 rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (!loc) {
    return (
      <div>
        <PageHeader title="Locadora não encontrada" />
        <Link
          to="/locadoras"
          className="text-sm font-medium text-brand-accent-dark hover:underline"
        >
          Voltar à lista
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={loc.nomeFantasia}
        description="Detalhes cadastrais (mock)."
      >
        <Link
          to="/locadoras"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-navy shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </PageHeader>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant={loc.status === 'ativa' ? 'success' : 'default'}>
            {loc.status === 'ativa' ? 'Ativa' : 'Inativa'}
          </Badge>
          <span className="font-mono text-sm text-slate-600">{loc.cnpj}</span>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              Razão social
            </dt>
            <dd className="mt-1 text-slate-800">{loc.razaoSocial}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              Responsável
            </dt>
            <dd className="mt-1 text-slate-800">{loc.responsavel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-slate-500">
              Endereço
            </dt>
            <dd className="mt-1 text-slate-800">{loc.endereco}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              E-mail
            </dt>
            <dd className="mt-1 text-slate-800">{loc.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">
              Telefone
            </dt>
            <dd className="mt-1 text-slate-800">{loc.telefone}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
