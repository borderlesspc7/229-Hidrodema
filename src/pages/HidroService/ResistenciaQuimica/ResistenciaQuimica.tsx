import "./ResistenciaQuimica.css";
import { Fragment, useMemo, useState } from "react";
import BackButton from "../../../components/ui/BackButton/BackButton";
import { paths } from "../../../routes/paths";
import {
  FaFlask,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaTable,
  FaChartLine,
} from "react-icons/fa";
import {
  chemicalResistanceData,
  type ChemicalResistanceItem,
  type ResistanceLevel,
} from "./chemicalResistanceData";

const categoryOrder = [
  "Ácidos",
  "Hidróxidos e Bases",
  "Sais",
  "Águas e Soluções Aquosas",
  "Gases e Halogênios",
  "Oxidantes",
  "Álcoois e Glicóis",
  "Solventes Orgânicos",
  "Hidrocarbonetos e Óleos",
  "Alimentos e Bebidas",
  "Outros Produtos Químicos",
] as const;

function getChemicalCategory(substance: string): (typeof categoryOrder)[number] {
  if (substance.startsWith("Ácido")) return "Ácidos";
  if (substance.startsWith("Hidróxido") || substance.startsWith("Amônia")) {
    return "Hidróxidos e Bases";
  }
  if (
    /^(Alúmen|Bicarbonato|Bissulfito|Brometo|Carbonato|Cloreto|Fosfato|Nitrato|Sulfato|Tiossulfato)/.test(
      substance
    )
  ) {
    return "Sais";
  }
  if (substance.startsWith("Água")) return "Águas e Soluções Aquosas";
  if (/^(Bromo|Cloro|Dióxido|Ozônio|Sulfeto)/.test(substance)) {
    return "Gases e Halogênios";
  }
  if (/^(Hipoclorito|Peróxido|Permanganato)/.test(substance)) return "Oxidantes";
  if (/^(Álcool|Etanol|Etilenoglicol|Glicerina|Metanol)/.test(substance)) {
    return "Álcoois e Glicóis";
  }
  if (
    /^(Acetona|Metiletilcetona|Metilisobutilcetona|Clorofórmio|Diclorometano|Tetracloreto|Tricloroetileno|Acetato|Éter|Fenol|Nitrobenzeno|Terebintina|Verniz)/.test(
      substance
    )
  ) {
    return "Solventes Orgânicos";
  }
  if (/^(Gasolina|Hexano|Nafta|Óleo|Querosene|Benzeno|Estireno|Tolueno|Xileno)/.test(substance)) {
    return "Hidrocarbonetos e Óleos";
  }
  if (/^(Cerveja|Leite|Suco|Vinho)/.test(substance)) return "Alimentos e Bebidas";
  return "Outros Produtos Químicos";
}

function groupByCategory(items: ChemicalResistanceItem[]) {
  const groups = new Map<string, ChemicalResistanceItem[]>();
  for (const category of categoryOrder) groups.set(category, []);

  for (const item of items) {
    const category = getChemicalCategory(item.substance);
    groups.get(category)?.push(item);
  }

  return categoryOrder
    .map((category) => ({ category, items: groups.get(category) ?? [] }))
    .filter((group) => group.items.length > 0);
}

export default function ResistenciaQuimica() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedResistance, setSelectedResistance] = useState("all");

  const filteredData = useMemo(() => {
    return chemicalResistanceData.filter((item) => {
      const matchesSearch = item.substance
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMaterial =
        selectedMaterial === "all" ||
        (selectedMaterial === "pvcU" && item.pvcU !== "N/A") ||
        (selectedMaterial === "cpvc" && item.cpvc !== "N/A");
      const matchesResistance =
        selectedResistance === "all" || item.resistance === selectedResistance;

      return matchesSearch && matchesMaterial && matchesResistance;
    });
  }, [searchTerm, selectedMaterial, selectedResistance]);

  // Função para obter ícone de resistência
  const getResistanceIcon = (resistance: ResistanceLevel) => {
    switch (resistance) {
      case "excellent":
        return <FaCheckCircle className="resistance-icon excellent" />;
      case "good":
        return <FaCheckCircle className="resistance-icon good" />;
      case "limited":
        return <FaExclamationTriangle className="resistance-icon limited" />;
      default:
        return <FaQuestionCircle className="resistance-icon unknown" />;
    }
  };

  // Função para obter classe CSS de resistência
  const getResistanceClass = (resistance: string) => {
    switch (resistance.toLowerCase()) {
      case "excelente":
      case "excellent":
        return "excellent";
      case "bom":
      case "good":
        return "good";
      case "limitado":
      case "limited":
        return "limited";
      default:
        return "unknown";
    }
  };

  const groupedData = useMemo(() => groupByCategory(filteredData), [filteredData]);

  return (
    <div className="resistencia-quimica-container hd-page-bg">
      <div className="resistencia-quimica-header">
        <BackButton fallbackPath={paths.service} className="back-button" />
        <div className="resistencia-quimica-title-section">
          <h1 className="resistencia-quimica-title">RESISTÊNCIA QUÍMICA</h1>
          <span className="resistencia-quimica-subtitle">
            Comportamento de Materiais
          </span>
        </div>
        <div className="resistencia-quimica-header-spacer"></div>
      </div>

      <div className="resistencia-quimica-content">
        <div className="intro-section">
          <h2 className="intro-title">
            <FaFlask className="title-icon" />
            RESISTÊNCIA QUÍMICA DOS MATERIAIS
          </h2>
          <div className="intro-content">
            <p>
              A resistência química dos materiais é um fator determinante na
              escolha correta dos materiais para instalações industriais. Esta
              seção tem como objetivo fornecer informações técnicas confiáveis
              sobre o comportamento de diferentes materiais plásticos em contato
              com substâncias químicas diversas, com base nos catálogos Amanco.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaExclamationTriangle />
                </div>
                <h3>Segurança Industrial</h3>
                <p>
                  Informações essenciais para evitar falhas em instalações
                  industriais
                </p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaChartLine />
                </div>
                <h3>Tomada de Decisão</h3>
                <p>
                  Apoio técnico para especificadores, engenheiros e vendedores
                </p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaTable />
                </div>
                <h3>Dados Confiáveis</h3>
                <p>Baseado nos catálogos técnicos Amanco para PVC-U e CPVC</p>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <h3 className="filters-title">
            <FaFilter className="filter-icon" />
            Filtros de Consulta
          </h3>
          <div className="filters-container">
            <div className="search-filter">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por substância química..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="filter-buttons">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos os Materiais</option>
                <option value="pvcU">PVC-U</option>
                <option value="cpvc">CPVC</option>
              </select>
              <select
                value={selectedResistance}
                onChange={(e) => setSelectedResistance(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas as Resistências</option>
                <option value="excellent">Excelente</option>
                <option value="good">Bom</option>
                <option value="limited">Limitado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">
            <FaTable className="title-icon" />
            TABELA DE RESISTÊNCIA QUÍMICA
          </h2>
          <div
            className="table-container"
            role="region"
            aria-label="Tabela de resistência química (rolagem interna, cabeçalho fixo)"
          >
            <table className="resistencia-table">
              <thead>
                <tr>
                  <th className="substance-header">Substância Química</th>
                  <th className="material-header">PVC-U</th>
                  <th className="material-header">CPVC</th>
                  <th className="resistance-header">Resistência</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((group) => (
                  <Fragment key={group.category}>
                    <tr className="category-row">
                      <td colSpan={4}>{group.category}</td>
                    </tr>
                    {group.items.map((item) => (
                      <tr key={item.substance} className="data-row">
                        <td className="substance-cell">{item.substance}</td>
                        <td className="material-cell">
                          <span className={`resistance-badge ${getResistanceClass(item.pvcU)}`}>
                            {item.pvcU}
                          </span>
                        </td>
                        <td className="material-cell">
                          <span className={`resistance-badge ${getResistanceClass(item.cpvc)}`}>
                            {item.cpvc}
                          </span>
                        </td>
                        <td className="resistance-cell">
                          <span className="resistance-content">
                            {getResistanceIcon(item.resistance)}
                            <span className="resistance-text">
                              {item.resistance === "excellent" && "Excelente"}
                              {item.resistance === "good" && "Bom"}
                              {item.resistance === "limited" && "Limitado"}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length === 0 && (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <p>Nenhuma substância encontrada com os filtros aplicados.</p>
            </div>
          )}
        </div>

        <div className="legend-section">
          <h3 className="legend-title">Legenda de Resistência</h3>
          <div className="legend-grid">
            <div className="legend-item">
              <FaCheckCircle className="legend-icon excellent" />
              <span>Excelente - Uso recomendado</span>
            </div>
            <div className="legend-item">
              <FaCheckCircle className="legend-icon good" />
              <span>Bom - Uso com precaução</span>
            </div>
            <div className="legend-item">
              <FaExclamationTriangle className="legend-icon limited" />
              <span>Limitado - Uso não recomendado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="footer-logo"
        />
      </div>
    </div>
  );
}
