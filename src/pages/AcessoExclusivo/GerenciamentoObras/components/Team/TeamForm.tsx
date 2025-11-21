import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { TeamMember } from "../../../../../services/obrasService";

interface TeamFormProps {
  formData: {
    name: string;
    role: string;
    cpf: string;
    phone: string;
    workHours: number;
    hourlyRate: number;
    attendance: boolean;
    checkInTime: string;
    checkOutTime: string;
  };
  editingItem: TeamMember | null;
  onChange: (field: string, value: string | number | boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function TeamForm({
  formData,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: TeamFormProps) {
  return (
    <div className="obras-form-container">
      <Button variant="secondary" onClick={onBack} className="obras-back-btn">
        <FiArrowLeft size={16} />
        Voltar
      </Button>
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {editingItem ? "EDITAR MEMBRO" : "NOVO MEMBRO"}
          </h2>
          <p className="obras-form-subtitle">
            Cadastro de membros da equipe
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiUsers /> Informações do Membro
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome Completo *</label>
                <Input
                  type="text"
                  placeholder="Nome do membro"
                  value={formData.name}
                  onChange={(value) => onChange("name", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Função *</label>
                <Input
                  type="text"
                  placeholder="Ex: Pedreiro, Eletricista"
                  value={formData.role}
                  onChange={(value) => onChange("role", value)}
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>CPF</label>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(value) => onChange("cpf", value)}
                  mask="cpf"
                />
              </div>
              <div className="obras-form-field">
                <label>Telefone</label>
                <Input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(value) => onChange("phone", value)}
                  mask="phone"
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Horas Trabalhadas</label>
                <Input
                  type="text"
                  placeholder="Horas"
                  value={formData.workHours.toString()}
                  onChange={(value) =>
                    onChange("workHours", parseInt(value) || 0)
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Valor por Hora (R$)</label>
                <Input
                  type="text"
                  placeholder="Valor/hora"
                  value={(formData.hourlyRate * 100).toString()}
                  onChange={(value) =>
                    onChange("hourlyRate", (parseFloat(value) || 0) / 100)
                  }
                  mask="currency"
                  min={0}
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Horário de Entrada</label>
                <Input
                  type="time"
                  placeholder=""
                  value={formData.checkInTime}
                  onChange={(value) => onChange("checkInTime", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Horário de Saída</label>
                <Input
                  type="time"
                  placeholder=""
                  value={formData.checkOutTime}
                  onChange={(value) => onChange("checkOutTime", value)}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={formData.attendance}
                  onChange={(e) => onChange("attendance", e.target.checked)}
                  style={{ width: "20px", height: "20px" }}
                />
                Presente hoje
              </label>
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={onReset}
              className="obras-action-btn"
            >
              <FiRefreshCw size={16} />
              Limpar
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              {editingItem ? "Atualizar Membro" : "Salvar Membro"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

