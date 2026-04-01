import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { createProduto } from '@/mocks/services'
import type { Produto } from '@/types/domain'
import { Button } from '@/components/ui/Button'

interface CreateProdutoFormProps {
  onSuccess?: (id: string) => void
}

export function CreateProdutoForm({ onSuccess }: CreateProdutoFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    sku: '',
    nome: '',
    preco: '',
    estoqueAgregado: '',
    linha: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const newProduto: Omit<Produto, 'id'> = {
        sku: form.sku,
        nome: form.nome,
        preco: parseFloat(form.preco),
        estoqueAgregado: parseInt(form.estoqueAgregado, 10),
        linha: form.linha,
      }
      await createProduto(user.uid, newProduto)

      // Reset form
      setForm({
        sku: '',
        nome: '',
        preco: '',
        estoqueAgregado: '',
        linha: '',
      })

      onSuccess?.(user.uid)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar produto',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-navy">Novo Produto</h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="nome"
          placeholder="Nome do produto"
          value={form.nome}
          onChange={handleChange}
          required
          className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
        />
        <input
          type="number"
          name="preco"
          placeholder="Preço (R$)"
          step="0.01"
          value={form.preco}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="number"
          name="estoqueAgregado"
          placeholder="Estoque agregado"
          value={form.estoqueAgregado}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="linha"
          placeholder="Linha / Categoria"
          value={form.linha}
          onChange={handleChange}
          required
          className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Criando…' : 'Criar Produto'}
      </Button>
    </form>
  )
}
