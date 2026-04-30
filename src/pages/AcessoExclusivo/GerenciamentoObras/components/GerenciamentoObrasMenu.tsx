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
  inventoryLow: number;
  inventoryCritical: number;
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
  const cardTextColor = "rgba(226, 232, 240, 0.98)";
  const cardBg = "rgba(7, 16, 33, 0.62)";

  return (
    <div className="obras-menu-container">
      <div className="obras-menu-cards">
        <Card
          variant="service"
          title="OBRAS"
          textColor={cardTextColor}
          backgroundColor={cardBg}
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("projects")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTool size={48} />
            </div>
            <p>Cadastrar novas obras para gerenciamento</p>
            <span className="obras-entry-count">{counts.projects} obras</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="NOVO REGISTRO"
          textColor={cardTextColor}
          backgroundColor={cardBg}
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("reports-select")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPlus size={48} />
            </div>
            <p>Selecione o tipo de registro que deseja criar</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="RELATÓRIOS"
          textColor={cardTextColor}
          backgroundColor={cardBg}
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("reports")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiBarChart size={48} />
            </div>
            <p>Todos os relatórios em um único lugar</p>
            <span className="obras-entry-count">{counts.diaries} relatórios</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ESTOQUE"
          textColor={cardTextColor}
          backgroundColor={cardBg}
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
            {(counts.inventoryLow > 0 || counts.inventoryCritical > 0) && (
              <span className="obras-entry-count" style={{ marginTop: 6 }}>
                <FiAlertTriangle style={{ marginRight: 6 }} />
                {counts.inventoryCritical} crítico / {counts.inventoryLow} baixo
              </span>
            )}
          </div>
        </Card>

        <Card
          variant="service"
          title="ORÇAMENTOS"
          textColor={cardTextColor}
          backgroundColor={cardBg}
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("budgets")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiDollarSign size={48} />
            </div>
            <p>Sistema de orçamentos</p>
            <span className="obras-entry-count">
              {counts.budgets} orçamentos
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="FORNECEDORES"
          textColor={cardTextColor}
          backgroundColor={cardBg}
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
          title="HISTÓRICO"
          textColor={cardTextColor}
          backgroundColor={cardBg}
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Consultar registros anteriores</p>
            <span className="obras-entry-count">{counts.diaries} registros</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="QUALIDADE"
          textColor={cardTextColor}
          backgroundColor={cardBg}
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
          textColor={cardTextColor}
          backgroundColor={cardBg}
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
          textColor={cardTextColor}
          backgroundColor={cardBg}
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
          textColor={cardTextColor}
          backgroundColor={cardBg}
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

      </div>
    </div>
  );
}
