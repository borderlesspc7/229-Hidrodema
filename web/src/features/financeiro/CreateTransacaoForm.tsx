import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { createTransacao } from '@/mocks/services'
import type { Transacao, TransacaoCategoria } from '@/types/domain'
import { Button } from '@/components/ui/Button'

interface CreateTransacaoFormProps {
  onSuccess?: (id: string) => void
}

const CATEGORIAS: TransacaoCategoria[] = [
  'taxa_plataforma',
  'repasse_profissional',
  'repasse_locadora',
  'venda_produto',
  'desconto_habilitacao',
  'outro',
]

const CATEGORIA_LABELS: Record<TransacaoCategoria, string> = {
  taxa_plataforma: 'Taxa da Plataforma',
  repasse_profissional: 'Repasse Profissional',
  repasse_locadora: 'Repasse Locadora',
  venda_produto: 'Venda de Produto',
  desconto_habilitacao: 'Desconto Habilitação',
  outro: 'Outro',
}

export function CreateTransacaoForm({ onSuccess }: CreateTransacaoFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'Pagamento',
    valor: '',
    referencia: '',
    categoria: 'outro' as TransacaoCategoria,
    locadoraId: '',
    profissionalId: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const newTransacao: Omit<Transacao, 'id'> = {
        data: form.data,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        referencia: form.referencia,
        categoria: form.categoria,
        locadoraId: form.locadoraId || undefined,
        profissionalId: form.profissionalId || undefined,
      }
      await createTransacao(user.uid, newTransacao)

      // Reset form
      setForm({
        data: new Date().toISOString().split('T')[0],
        tipo: 'Pagamento',
        valor: '',
        referencia: '',
        categoria: 'outro',
        locadoraId: '',
        profissionalId: '',
      })

      onSuccess?.(user.uid)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar transação',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-navy">
        Nova Transação / Pagamento
      </h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="date"
          name="data"
          value={form.data}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_LABELS[cat]}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="tipo"
          placeholder="Tipo de transação"
          value={form.tipo}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="number"
          name="valor"
          placeholder="Valor (R$)"
          step="0.01"
          value={form.valor}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="referencia"
          placeholder="Referência (ex: Chamado #123)"
          value={form.referencia}
          onChange={handleChange}
          required
          className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
        />
        <input
          type="text"
          name="locadoraId"
          placeholder="ID da Locadora (opcional)"
          value={form.locadoraId}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="profissionalId"
          placeholder="ID do Profissional (opcional)"
          value={form.profissionalId}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Criando…' : 'Criar Transação / Pagamento'}
      </Button>
    </form>
  )
}
