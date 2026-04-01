import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { CreateClienteForm } from '@/features/clientes/CreateClienteForm'

export function ClientesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastre funcionários com login direto no sistema."
      />

      <Card className="p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-brand-navy">
          Novo cliente
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          O cadastro cria automaticamente o acesso de login para o funcionário.
        </p>
        <CreateClienteForm />
      </Card>
    </div>
  )
}
