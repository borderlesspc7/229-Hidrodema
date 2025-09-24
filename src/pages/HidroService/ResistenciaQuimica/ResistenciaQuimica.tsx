import "./ResistenciaQuimica.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";
import {
  FaFlask,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaTable,
  FaChartLine,
} from "react-icons/fa";

export default function ResistenciaQuimica() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedResistance, setSelectedResistance] = useState("all");

  const handleBack = () => {
    navigate("/service");
  };

  // Dados de resistência química baseados nos catálogos Amanco
  const chemicalResistanceData = [
    // PVC-U - Páginas 28 a 32
    {
      substance: "Ácido Clorídrico (HCl) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Clorídrico (HCl) 37%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Sulfúrico (H2SO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Sulfúrico (H2SO4) 50%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Nítrico (HNO3) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Nítrico (HNO3) 65%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Ácido Acético (CH3COOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Acético (CH3COOH) 99%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Hidróxido de Sódio (NaOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidróxido de Sódio (NaOH) 50%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidróxido de Potássio (KOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloro (Cl2) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Cloro (Cl2) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Peróxido de Hidrogênio (H2O2) 3%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Peróxido de Hidrogênio (H2O2) 30%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Etanol (C2H5OH) 100%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Metanol (CH3OH) 100%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Acetona (C3H6O) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Benzina 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Tolueno (C7H8) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Água do Mar",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Água Potável",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Solução Salina (NaCl) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Amônia (NH3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Amônia (NH3) 30%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
  ];

  // Função para filtrar dados
  const getFilteredData = () => {
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
  };

  // Função para obter ícone de resistência
  const getResistanceIcon = (resistance: string) => {
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
    switch (resistance) {
      case "excellent":
        return "excellent";
      case "good":
        return "good";
      case "limited":
        return "limited";
      default:
        return "unknown";
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="resistencia-quimica-container">
      <div className="resistencia-quimica-header">
        <Button
          variant="secondary"
          className="back-button"
          onClick={handleBack}
        >
          Voltar
        </Button>
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
          <div className="table-container">
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
                {filteredData.map((item, index) => (
                  <tr key={index} className="data-row">
                    <td className="substance-cell">{item.substance}</td>
                    <td className="material-cell">
                      <span
                        className={`resistance-badge ${getResistanceClass(
                          item.pvcU.toLowerCase().replace(" ", "")
                        )}`}
                      >
                        {item.pvcU}
                      </span>
                    </td>
                    <td className="material-cell">
                      <span
                        className={`resistance-badge ${getResistanceClass(
                          item.cpvc.toLowerCase().replace(" ", "")
                        )}`}
                      >
                        {item.cpvc}
                      </span>
                    </td>
                    <td className="resistance-cell">
                      {getResistanceIcon(item.resistance)}
                      <span className="resistance-text">
                        {item.resistance === "excellent" && "Excelente"}
                        {item.resistance === "good" && "Bom"}
                        {item.resistance === "limited" && "Limitado"}
                      </span>
                    </td>
                  </tr>
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
        <span className="footer-company-subtitle">HIDRODEMA</span>
      </div>
    </div>
  );
}
