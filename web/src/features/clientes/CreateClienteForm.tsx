import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { isValidCpf, onlyDigits } from '@/lib/brDocuments'
import {
  createClienteUsuario,
  getCreateClienteErrorMessage,
} from '@/features/clientes/createClienteUser'

export function CreateClienteForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    celular: '',
    funcao: '',
    localizacao: '',
    cidade: '',
    estado: '',
    password: '',
    confirmPassword: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isValidCpf(form.cpf)) {
      setError('CPF inválido.')
      return
    }
    if (form.password.length < 6) {
      setError('A senha inicial deve ter no mínimo 6 caracteres.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    try {
      await createClienteUsuario({
        nome: form.nome.trim(),
        cpf: onlyDigits(form.cpf),
        email: form.email.trim().toLowerCase(),
        celular: onlyDigits(form.celular),
        funcao: form.funcao.trim(),
        localizacao: form.localizacao.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
        password: form.password,
      })

      setForm({
        nome: '',
        cpf: '',
        email: '',
        celular: '',
        funcao: '',
        localizacao: '',
        cidade: '',
        estado: '',
        password: '',
        confirmPassword: '',
      })
      setSuccess('Cliente criado com sucesso. Login liberado com e-mail e senha.')
    } catch (err) {
      setError(getCreateClienteErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
        />
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          pattern="[\d.\-]*"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="tel"
          name="celular"
          placeholder="Celular"
          value={form.celular}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="funcao"
          placeholder="Função"
          value={form.funcao}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="text"
          name="localizacao"
          placeholder="Localização"
          value={form.localizacao}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:col-span-2"
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
          value={form.estado}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, estado: e.target.value.toUpperCase() }))
          }
          maxLength={2}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="password"
          name="password"
          placeholder="Senha inicial"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar senha"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Criando…' : 'Criar cliente'}
      </Button>
    </form>
  )
}
