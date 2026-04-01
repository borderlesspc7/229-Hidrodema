import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { createLocadora } from '@/mocks/services'
import type { Locadora, LocadoraStatus } from '@/types/domain'
import { Button } from '@/components/ui/Button'

interface CreateLocadoraFormProps {
  onSuccess?: (id: string) => void
}

export function CreateLocadoraForm({ onSuccess }: CreateLocadoraFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    cidade: '',
    estado: '',
    responsavel: '',
    email: '',
    telefone: '',
    endereco: '',
    status: 'ativa' as LocadoraStatus,
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
      const newLocadora = form as Omit<Locadora, 'id'>
      await createLocadora(user.uid, newLocadora)

      // Reset form
      setForm({
        nomeFantasia: '',
        razaoSocial: '',
        cnpj: '',
        cidade: '',
        estado: '',
        responsavel: '',
        email: '',
        telefone: '',
        endereco: '',
        status: 'ativa',
      })

      onSuccess?.(user.uid)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar locadora',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-navy">Nova Locadora</h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="nomeFantasia"
          placeholder="Nome fantasia"
          value={form.nomeFantasia}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="razaoSocial"
          placeholder="Razão social"
          value={form.razaoSocial}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="cnpj"
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={handleChange}
          pattern="[\d.\-/]*"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="responsavel"
          placeholder="Responsável"
          value={form.responsavel}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={form.cidade}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="estado"
          placeholder="Estado (UF)"
          maxLength={2}
          value={form.estado}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={form.endereco}
          onChange={handleChange}
          required
          className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        >
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Criando…' : 'Criar Locadora'}
      </Button>
    </form>
  )
}
