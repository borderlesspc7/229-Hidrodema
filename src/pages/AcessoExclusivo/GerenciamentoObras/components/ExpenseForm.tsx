import { useMemo, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import type { ExpenseReport, Project } from "../../../../types/obrasGerenciamentoModule";
import ProjectSelector from "./ProjectSelector";
import {
  sanitizeForDatabase,
  validateMoney,
  validateObraReportInput,
  validateRequiredText,
} from "../../../../lib/validation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

type Props = {
  projects: Project[];
  initialProjectId?: string;
  initialReport?: ExpenseReport;
  onCancel: () => void;
  onSubmit: (report: ExpenseReport) => void | Promise<void>;
};

export default function ExpenseForm({
  projects,
  initialProjectId = "",
  initialReport,
  onCancel,
  onSubmit,
}: Props) {
  const defaultProjectId = useMemo(
    () => initialReport?.projectId ?? initialProjectId ?? "",
    [initialProjectId, initialReport?.projectId]
  );

  const [projectId, setProjectId] = useState(defaultProjectId);
  const [date, setDate] = useState(initialReport?.date ?? new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(initialReport?.description ?? "");
  const [category, setCategory] = useState(initialReport?.category ?? "");
  const [amount, setAmount] = useState(String(initialReport?.amount ?? 0));
  const [notes, setNotes] = useState(initialReport?.notes ?? "");

  const handleSave = async () => {
    const base: ExpenseReport = {
      id: initialReport?.id ?? Date.now().toString(),
      type: "expense",
      projectId,
      date,
      description,
      category,
      amount: Number(amount),
      notes,
      createdAt: initialReport?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const v = validateObraReportInput(base);
    if (!v.ok) return alert(v.errors.join("\n"));

    const desc = validateRequiredText(description, "Descrição", { minLen: 3, maxLen: 500 });
    const cat = validateRequiredText(category, "Categoria", { minLen: 2, maxLen: 80 });
    const money = validateMoney(amount, "Valor (R$)", { decimals: 2 });
    if (!desc.ok || !cat.ok || !money.ok) {
      alert([...(!desc.ok ? desc.errors : []), ...(!cat.ok ? cat.errors : []), ...(!money.ok ? money.errors : [])].join("\n"));
      return;
    }

    await onSubmit(
      sanitizeForDatabase({
        ...base,
        description: desc.value,
        category: cat.value,
        amount: money.value,
      })
    );
  };

  return (
    <div className="obras-form-container">
      <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
        <div className="obras-form-header">
          <h2 className="obras-form-title">{initialReport ? "EDITAR DESPESA" : "NOVA DESPESA"}</h2>
          <p className="obras-form-subtitle">Despesa vinculada à obra</p>
        </div>

        <div className="obras-form-content">
          <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} required />

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Data *</label>
              <Input type="date" value={date} onChange={setDate} required placeholder="Selecione a data" />
            </div>
            <div className="obras-form-field">
              <label>Valor (R$) *</label>
              <Input type="number" value={amount} onChange={setAmount} required placeholder="0,00" />
            </div>
          </div>

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Categoria *</label>
              <Input type="text" value={category} onChange={setCategory} placeholder="Ex: Material, Mão de obra" required />
            </div>
            <div className="obras-form-field">
              <label>Descrição *</label>
              <Input type="text" value={description} onChange={setDescription} placeholder="Ex: Compra de conexões" required />
            </div>
          </div>

          <div className="obras-form-field">
            <label>Observações</label>
            <textarea className="obras-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>

          <div className="obras-form-actions">
            <Button variant="secondary" onClick={onCancel} className="obras-action-btn">
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void handleSave()} className="obras-action-btn obras-submit-btn">
              <FiCheckCircle size={16} />
              {initialReport ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

