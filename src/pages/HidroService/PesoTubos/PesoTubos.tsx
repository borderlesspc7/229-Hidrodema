import "./PesoTubos.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import {
  FaTruck,
  FaBolt,
  FaDollarSign,
  FaWeightHanging,
  FaChartBar,
  FaTable,
} from "react-icons/fa";

export default function PesoTubos() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/service");
  };

  // Dados da tabela de pesos dos tubos
  const pipeData = {
    '½"': {
      "CPVC / PVC-U": { empty: 0.15, water: 0.2, full: 0.35 },
      "Tubo Aço SCH 40": { empty: 0.85, water: 0.2, full: 1.05 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '¾"': {
      "CPVC / PVC-U": { empty: 0.22, water: 0.35, full: 0.57 },
      "Tubo Aço SCH 40": { empty: 1.13, water: 0.35, full: 1.48 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '1"': {
      "CPVC / PVC-U": { empty: 0.32, water: 0.6, full: 0.92 },
      "Tubo Aço SCH 40": { empty: 1.49, water: 0.6, full: 2.09 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '1.1/4"': {
      "CPVC / PVC-U": { empty: 0.5, water: 0.95, full: 1.45 },
      "Tubo Aço SCH 40": { empty: 2.27, water: 0.95, full: 3.22 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '1.1/2"': {
      "CPVC / PVC-U": { empty: 0.65, water: 1.35, full: 2.0 },
      "Tubo Aço SCH 40": { empty: 2.72, water: 1.35, full: 4.07 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '2"': {
      "CPVC / PVC-U": { empty: 1.02, water: 2.4, full: 3.42 },
      "Tubo Aço SCH 40": { empty: 3.65, water: 2.4, full: 6.05 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '2.1/2"': {
      "CPVC / PVC-U": { empty: 1.58, water: 3.8, full: 5.38 },
      "Tubo Aço SCH 40": { empty: 5.79, water: 3.8, full: 9.59 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '3"': {
      "CPVC / PVC-U": { empty: 2.25, water: 5.5, full: 7.75 },
      "Tubo Aço SCH 40": { empty: 7.58, water: 5.5, full: 13.08 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '4"': {
      "CPVC / PVC-U": { empty: 3.95, water: 9.8, full: 13.75 },
      "Tubo Aço SCH 40": { empty: 12.15, water: 9.8, full: 21.95 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '6"': {
      "CPVC / PVC-U": { empty: 8.5, water: 22.0, full: 30.5 },
      "Tubo Aço SCH 40": { empty: 22.96, water: 22.0, full: 44.96 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '8"': {
      "CPVC / PVC-U": { empty: 14.8, water: 39.2, full: 54.0 },
      "Tubo Aço SCH 40": { empty: 36.24, water: 39.2, full: 75.44 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '10"': {
      "CPVC / PVC-U": { empty: 22.5, water: 61.2, full: 83.7 },
      "Tubo Aço SCH 40": { empty: 49.8, water: 61.2, full: 111.0 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
    '12"': {
      "CPVC / PVC-U": { empty: 25.2, water: 69.96, full: 95.16 },
      "Tubo Aço SCH 40": { empty: 73.87, water: 72.96, full: 146.83 },
      "NBR 5580 L Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Preto": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 L Galv": { empty: 0.0, water: 0.0, full: 0.0 },
      "NBR 5580 M Galv": { empty: 0.0, water: 0.0, full: 0.0 },
    },
  };

  const diameters = [
    '½"',
    '¾"',
    '1"',
    '1.1/4"',
    '1.1/2"',
    '2"',
    '2.1/2"',
    '3"',
    '4"',
    '6"',
    '8"',
    '10"',
    '12"',
  ];

  const materials = [
    "CPVC / PVC-U",
    "Tubo Aço SCH 40",
    "NBR 5580 L Preto",
    "NBR 5580 M Preto",
    "NBR 5580 L Galv",
    "NBR 5580 M Galv",
  ];

  const [selectedDiameter, setSelectedDiameter] = useState('12"');

  // Função para calcular a redução de peso dos termoplásticos
  const calculateWeightReduction = (diameter: string) => {
    const cpvcData =
      pipeData[diameter as keyof typeof pipeData]["CPVC / PVC-U"];
    const sch40Data =
      pipeData[diameter as keyof typeof pipeData]["Tubo Aço SCH 40"];

    if (cpvcData.empty > 0 && sch40Data.empty > 0) {
      const reduction =
        ((sch40Data.empty - cpvcData.empty) / sch40Data.empty) * 100;
      return reduction.toFixed(1);
    }
    return 0;
  };

  // Função para gerar dados do gráfico
  const getChartData = () => {
    const data = pipeData[selectedDiameter as keyof typeof pipeData];
    return materials
      .map((material) => ({
        material: material,
        empty: data[material as keyof typeof data].empty,
        water: data[material as keyof typeof data].water,
        full: data[material as keyof typeof data].full,
      }))
      .filter((item) => item.empty > 0);
  };

  const formatWeight = (value: number) =>
    value.toFixed(2).replace(".", ",") + " kg";

  return (
    <div className="peso-tubos-container">
      <Breadcrumb />
      <div className="peso-tubos-header">
        <Button
          variant="secondary"
          className="back-button"
          onClick={handleBack}
        >
          Voltar
        </Button>
        <div className="peso-tubos-title-section">
          <h1 className="peso-tubos-title">PESO DOS TUBOS</h1>
          <span className="peso-tubos-subtitle">Comparação de Materiais</span>
        </div>
        <div className="peso-tubos-header-spacer"></div>
      </div>

      <div className="peso-tubos-content">
        <div className="intro-section">
          <h2 className="intro-title">
            <FaWeightHanging className="title-icon" />
            COMPARAÇÃO DE PESOS DOS TUBOS
          </h2>
          <div className="intro-content">
            <p>
              Comparar o peso dos tubos de diferentes materiais é fundamental
              para avaliar a facilidade de manuseio, logística e instalação.
              Esta aba apresenta uma tabela comparativa que destaca os
              benefícios dos termoplásticos em relação a outros materiais,
              demonstrando ganho de produtividade e redução de esforço físico em
              campo.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaTruck />
                </div>
                <h3>Facilidade de Manuseio</h3>
                <p>
                  Termoplásticos são até{" "}
                  {calculateWeightReduction(selectedDiameter)}% mais leves que
                  tubos metálicos
                </p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaBolt />
                </div>
                <h3>Ganho de Produtividade</h3>
                <p>Instalação mais rápida e com menor esforço físico</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <FaDollarSign />
                </div>
                <h3>Redução de Custos</h3>
                <p>Menor necessidade de equipamentos de movimentação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="diameter-selector">
          <h3>Selecione o Diâmetro:</h3>
          <div className="diameter-buttons">
            {diameters.map((diameter) => (
              <button
                key={diameter}
                className={`diameter-btn ${
                  selectedDiameter === diameter ? "active" : ""
                }`}
                onClick={() => setSelectedDiameter(diameter)}
              >
                {diameter}
              </button>
            ))}
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">
            <FaTable className="title-icon" />
            PESOS DOS TUBOS COM E SEM ÁGUA
          </h2>
          <div className="table-container">
            <table className="peso-table">
              <thead>
                <tr>
                  <th className="category-header">Categoria</th>
                  {materials.map((material) => (
                    <th key={material} className="material-header">
                      {material}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="data-row">
                  <td className="category-cell">Peso 1m Tubo (kg)</td>
                  {materials.map((material) => (
                    <td key={material} className="data-cell">
                      {pipeData[selectedDiameter as keyof typeof pipeData][
                        material as keyof (typeof pipeData)['12"']
                      ].empty.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="data-row">
                  <td className="category-cell">Peso de Água 1m Tubo (kg)</td>
                  {materials.map((material) => (
                    <td key={material} className="data-cell">
                      {pipeData[selectedDiameter as keyof typeof pipeData][
                        material as keyof (typeof pipeData)['12"']
                      ].water.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="data-row total-row">
                  <td className="category-cell total-cell">
                    Peso 1m Tubo cheio de água (kg)
                  </td>
                  {materials.map((material) => (
                    <td key={material} className="data-cell total-value-cell">
                      {pipeData[selectedDiameter as keyof typeof pipeData][
                        material as keyof (typeof pipeData)['12"']
                      ].full.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-section">
          <h2 className="chart-title">
            <FaChartBar className="title-icon" />
            GRÁFICO COMPARATIVO - DIÂMETRO {selectedDiameter}
          </h2>
          <div className="chart-container">
            <div className="chart-bars">
              {getChartData().map((item) => (
                <div key={item.material} className="chart-bar-group">
                  <div className="bar-label">{item.material}</div>
                  <div className="bars">
                    <div className="bar-column">
                      <span className="bar-value" title={`Peso do tubo: ${formatWeight(item.empty)}`}>
                        {formatWeight(item.empty)}
                      </span>
                      <div
                        className="bar empty-bar"
                        style={{
                          height: `${
                            (item.empty /
                              Math.max(...getChartData().map((d) => d.empty))) *
                            200
                          }px`,
                        }}
                      />
                    </div>
                    <div className="bar-column">
                      <span className="bar-value" title={`Peso da água: ${formatWeight(item.water)}`}>
                        {formatWeight(item.water)}
                      </span>
                      <div
                        className="bar water-bar"
                        style={{
                          height: `${
                            (item.water /
                              Math.max(...getChartData().map((d) => d.water))) *
                            200
                          }px`,
                        }}
                      />
                    </div>
                    <div className="bar-column">
                      <span className="bar-value" title={`Peso total: ${formatWeight(item.full)}`}>
                        {formatWeight(item.full)}
                      </span>
                      <div
                        className="bar full-bar"
                        style={{
                          height: `${
                            (item.full /
                              Math.max(...getChartData().map((d) => d.full))) *
                            200
                          }px`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="obseration">
                    Os valores são calculados por metro de tubo
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color empty-color"></div>
                <span>Peso do Tubo</span>
              </div>
              <div className="legend-item">
                <div className="legend-color water-color"></div>
                <span>Peso da Água</span>
              </div>
              <div className="legend-item">
                <div className="legend-color full-color"></div>
                <span>Peso Total</span>
              </div>
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
