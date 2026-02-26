import Card from "../../../../../components/ui/Card/Card";
import { pluralize } from "../../../../../utils/pluralize";
import {
  FiTool,
  FiPlus,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiClipboard,
  FiBarChart,
  FiUserCheck,
  FiSettings,
  FiSliders,
  FiShield,
  FiAward,
  FiAlertTriangle,
  FiArchive,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  InventoryItem,
  Budget,
  Supplier,
  QualityChecklist,
  TeamMember,
  Equipment,
  Schedule,
  SafetyRecord,
  Measurement,
  Issue,
  DocumentRecord,
} from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface MenuProps {
  projects: Project[];
  diaryEntries: DiaryEntry[];
  inventory: InventoryItem[];
  budgets: Budget[];
  suppliers: Supplier[];
  qualityChecklists: QualityChecklist[];
  teamMembers: TeamMember[];
  equipment: Equipment[];
  schedules: Schedule[];
  safetyRecords: SafetyRecord[];
  measurements: Measurement[];
  issues: Issue[];
  documents: DocumentRecord[];
  onViewChange: (mode: ViewMode) => void;
}

export default function Menu({
  projects,
  diaryEntries,
  inventory,
  budgets,
  suppliers,
  qualityChecklists,
  teamMembers,
  equipment,
  schedules,
  safetyRecords,
  measurements,
  issues,
  documents,
  onViewChange,
}: MenuProps) {
  return (
    <div className="obras-menu-container">
      <div className="obras-menu-cards">
        <Card
          variant="service"
          title="OBRAS"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("projects")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTool size={48} />
            </div>
            <p>Cadastrar novas obras para gerenciamento</p>
            <span className="obras-entry-count">{pluralize(projects.length, "obra", "obras")}</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="NOVO REGISTRO"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("new")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPlus size={48} />
            </div>
            <p>Criar novo registro diário de obra</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="RELATÓRIOS"
          textColor="#059669"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("unified-reports")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Todos os relatórios em um único lugar</p>
            <span className="obras-entry-count">
              {pluralize(diaryEntries.length, "relatório", "relatórios")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ESTOQUE"
          textColor="#dc2626"
          backgroundColor="#fef2f2"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("inventory")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPackage size={48} />
            </div>
            <p>Controle de estoque de materiais</p>
            <span className="obras-entry-count">{pluralize(inventory.length, "item", "itens")}</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ORÇAMENTOS"
          textColor="#ea580c"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("budgets")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiDollarSign size={48} />
            </div>
            <p>Sistema de orçamentos automatizado</p>
            <span className="obras-entry-count">
              {pluralize(budgets.length, "orçamento", "orçamentos")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="FORNECEDORES"
          textColor="#0891b2"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("suppliers")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTruck size={48} />
            </div>
            <p>Gestão de fornecedores</p>
            <span className="obras-entry-count">
              {pluralize(suppliers.length, "fornecedor", "fornecedores")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="QUALIDADE"
          textColor="#16a34a"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("quality")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiClipboard size={48} />
            </div>
            <p>Controle de qualidade com checklists</p>
            <span className="obras-entry-count">
              {pluralize(qualityChecklists.length, "checklist", "checklists")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="RELATÓRIOS"
          textColor="#9333ea"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("reports")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiBarChart size={48} />
            </div>
            <p>Relatórios e análises</p>
            <span className="obras-entry-count">Dashboard completo</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="EQUIPE"
          textColor="#7c3aed"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("team")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiUserCheck size={48} />
            </div>
            <p>Gestão de equipe e mão de obra</p>
            <span className="obras-entry-count">
              {pluralize(teamMembers.length, "membro", "membros")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="EQUIPAMENTOS"
          textColor="#ea580c"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("equipment")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiSettings size={48} />
            </div>
            <p>Controle de equipamentos</p>
            <span className="obras-entry-count">
              {pluralize(equipment.length, "equipamento", "equipamentos")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="CRONOGRAMA"
          textColor="#0891b2"
          backgroundColor="#ecfeff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("schedule")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiSliders size={48} />
            </div>
            <p>Planejamento e cronograma</p>
            <span className="obras-entry-count">
              {pluralize(schedules.length, "tarefa", "tarefas")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="SEGURANÇA"
          textColor="#dc2626"
          backgroundColor="#fef2f2"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("safety")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiShield size={48} />
            </div>
            <p>Segurança do trabalho</p>
            <span className="obras-entry-count">
              {pluralize(safetyRecords.length, "registro", "registros")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="MEDIÇÕES"
          textColor="#16a34a"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("measurements")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiAward size={48} />
            </div>
            <p>Avanço físico-financeiro</p>
            <span className="obras-entry-count">
              {pluralize(measurements.length, "medição", "medições")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="PROBLEMAS"
          textColor="#f59e0b"
          backgroundColor="#fffbeb"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("issues")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiAlertTriangle size={48} />
            </div>
            <p>Não conformidades e problemas</p>
            <span className="obras-entry-count">{pluralize(issues.length, "registro", "registros")}</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="DOCUMENTOS"
          textColor="#1e40af"
          backgroundColor="#eff6ff"
          size="large"
          className="obras-menu-card"
          onClick={() => onViewChange("documents")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiArchive size={48} />
            </div>
            <p>Documentação técnica</p>
            <span className="obras-entry-count">
              {pluralize(documents.length, "documento", "documentos")}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
