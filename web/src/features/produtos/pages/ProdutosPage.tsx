import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { listProdutos } from '@/mocks/services'
import { CreateProdutoForm } from '@/features/produtos/CreateProdutoForm'
import type { Produto } from '@/types/domain'
import { formatBRL } from '@/lib/format'

export function ProdutosPage() {
  const [rows, setRows] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    void listProdutos().then((r) => {
      if (alive) {
        setRows(r)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos — Marketplace"
        description="Catálogo ClearCarpet Solution e linhas associadas. Crie e gerencie seus produtos."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Carregando…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">SKU</th>
                      <th className="px-5 py-3 font-medium">Nome</th>
                      <th className="px-5 py-3 font-medium">Linha</th>
                      <th className="px-5 py-3 font-medium">Preço</th>
                      <th className="px-5 py-3 font-medium">Estoque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => (
                      <tr
                        key={p.id}
                        className="bg-white hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">
                          {p.sku}
                        </td>
                        <td className="px-5 py-3 font-medium text-brand-navy">
                          {p.nome}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="accent">{p.linha}</Badge>
                        </td>
                        <td className="px-5 py-3 font-medium text-brand-navy">
                          {formatBRL(p.preco)}
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {p.estoqueAgregado}
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
            <CreateProdutoForm
              onSuccess={() => {
                // Reload the list
                setRows([])
                setLoading(true)
                void listProdutos().then((r) => {
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
