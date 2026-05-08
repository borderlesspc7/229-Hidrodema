import { useMemo, useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import Card from "../../../../components/ui/Card/Card";
import Input from "../../../../components/ui/Input/Input";
import type {
  InventoryItem,
  Project,
  Supplier,
} from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import ProjectSelector from "./ProjectSelector";

type Props = {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  projects: Project[];
  projectFilterId: string;
  onSubmit: (entry: {
    projectId?: string;
    itemId: string;
    receivedAt: string;
    quantity: number;
    supplier?: string;
    category?: string;
    notes?: string;
  }) => void | Promise<void>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function InventoryEntryForm({
  inventory,
  suppliers,
  projects,
  projectFilterId,
  onSubmit,
  setViewMode,
}: Props) {
  const [projectId, setProjectId] = useState<string>(projectFilterId || "");
  const [itemId, setItemId] = useState<string>("");
  const [receivedAt, setReceivedAt] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [quantity, setQuantity] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const scopedItems = useMemo(() => {
    if (!projectId) return inventory;
    return inventory.filter((i) => i.projectId === projectId);
  }, [inventory, projectId]);

  const selectedItem = useMemo(
    () => inventory.find((i) => i.id === itemId) || null,
    [inventory, itemId]
  );

  return (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">ENTRADA DE MATERIAIS</h2>
          <p className="obras-form-subtitle">
            Registrar recebimento e atualizar saldo automaticamente
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTrendingUp /> Dados da Entrada
            </h3>

            <ProjectSelector
              projects={projects}
              value={projectId}
              onChange={(v) => setProjectId(v)}
              allowEmpty
            />

            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Item de Estoque *</label>
                <select
                  className="obras-select"
                  value={itemId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setItemId(nextId);
                    const it = inventory.find((x) => x.id === nextId);
                    if (it) {
                      if (!category) setCategory(it.category);
                      if (!supplier) setSupplier(it.supplier);
                    }
                  }}
                >
                  <option value="">Selecione…</option>
                  {scopedItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.quantity} {i.unit})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <div className="obras-helper-text">
                    Saldo atual: <strong>{selectedItem.quantity}</strong>{" "}
                    {selectedItem.unit} · Mínimo:{" "}
                    <strong>{selectedItem.minStock}</strong>
                  </div>
                )}
              </div>
              <div className="obras-form-field">
                <label>Data de Recebimento *</label>
                <Input
                  type="date"
                  placeholder="Selecione a data"
                  value={receivedAt}
                  onChange={(v) => setReceivedAt(v)}
                  required
                />
              </div>
            </div>

            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Quantidade Recebida *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(v) => setQuantity(v)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Categoria</label>
                <Input
                  type="text"
                  placeholder="Categoria"
                  value={category}
                  onChange={(v) => setCategory(v)}
                />
              </div>
            </div>

            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Fornecedor</label>
                <select
                  className="obras-select"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                >
                  <option value="">(não informado)</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="obras-form-field">
                <label>Observações</label>
                <Input
                  type="text"
                  placeholder="NF, lote, observações…"
                  value={notes}
                  onChange={(v) => setNotes(v)}
                />
              </div>
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("inventory")}
              className="obras-action-btn"
              disabled={submitting}
            >
              <FiArrowLeft size={16} />
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                void (async () => {
                  try {
                    setSubmitting(true);
                    await onSubmit({
                      projectId: projectId || undefined,
                      itemId,
                      receivedAt,
                      quantity: Number(quantity || 0),
                      supplier: supplier || undefined,
                      category: category || undefined,
                      notes: notes || undefined,
                    });
                    setQuantity("");
                    setNotes("");
                  } finally {
                    setSubmitting(false);
                  }
                })();
              }}
              className="obras-action-btn obras-submit-btn"
              disabled={submitting || !itemId || !receivedAt || Number(quantity || 0) <= 0}
            >
              <FiCheckCircle size={16} />
              {submitting ? "Salvando..." : "Registrar Entrada"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

