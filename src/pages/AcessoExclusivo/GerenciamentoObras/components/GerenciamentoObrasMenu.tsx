import type { NavigateFunction } from "react-router-dom";
import Card from "../../../../components/ui/Card/Card";
import { paths } from "../../../../routes/paths";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiTool,
  FiPlus,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiClipboard,
  FiLayers,
  FiAlertTriangle,
  FiFolder,
  FiBarChart,
} from "react-icons/fi";

export type MenuCounts = {
  projects: number;
  diaries: number;
  inventory: number;
  budgets: number;
  suppliers: number;
  checklists: number;
};

type Props = {
  counts: MenuCounts;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  navigate: NavigateFunction;
};

export default function GerenciamentoObrasMenu({
  counts,
  setViewMode,
  navigate,
}: Props) {
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
          onClick={() => setViewMode("projects")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTool size={48} />
            </div>
            <p>Listagem e gestão de obras</p>
            <span className="obras-entry-count">{counts.projects} obras</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="NOVO REGISTRO"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("new")}
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
          title="HISTÓRICO"
          textColor="#059669"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Consultar registros anteriores</p>
            <span className="obras-entry-count">
              {counts.diaries} registros
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
          onClick={() => setViewMode("inventory")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPackage size={48} />
            </div>
            <p>Controle de estoque de materiais</p>
            <span className="obras-entry-count">{counts.inventory} itens</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ORÇAMENTOS"
          textColor="#ea580c"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("budgets")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiDollarSign size={48} />
            </div>
            <p>Sistema de orçamentos automatizado</p>
            <span className="obras-entry-count">
              {counts.budgets} orçamentos
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
          onClick={() => setViewMode("suppliers")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTruck size={48} />
            </div>
            <p>Gestão de fornecedores</p>
            <span className="obras-entry-count">
              {counts.suppliers} fornecedores
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
          onClick={() => setViewMode("quality")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiClipboard size={48} />
            </div>
            <p>Controle de qualidade com checklists</p>
            <span className="obras-entry-count">
              {counts.checklists} checklists
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="MEDIÇÕES"
          textColor="#1d4ed8"
          backgroundColor="#eff6ff"
          size="large"
          className="obras-menu-card"
          onClick={() => navigate(paths.obras.medicoes)}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiLayers size={48} />
            </div>
            <p>Medições técnicas e quantitativas (Firebase)</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="PROBLEMAS"
          textColor="#b91c1c"
          backgroundColor="#fef2f2"
          size="large"
          className="obras-menu-card"
          onClick={() => navigate(paths.obras.problemas)}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiAlertTriangle size={48} />
            </div>
            <p>Ocorrências, prioridade e status por obra</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="DOCUMENTOS"
          textColor="#4f46e5"
          backgroundColor="#eef2ff"
          size="large"
          className="obras-menu-card"
          onClick={() => navigate(paths.obras.documentos)}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiFolder size={48} />
            </div>
            <p>Anexos e histórico no Storage</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="RELATÓRIOS"
          textColor="#9333ea"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("reports")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiBarChart size={48} />
            </div>
            <p>Relatórios e análises</p>
            <span className="obras-entry-count">Dashboard completo</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
