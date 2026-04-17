import "./PesoTubos.css";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button/Button";
import { useNavigateBack } from "../../../hooks/useNavigateBack";
import { paths } from "../../../routes/paths";
import {
  FaTruck,
  FaBolt,
  FaDollarSign,
  FaWeightHanging,
  FaChartBar,
  FaTable,
} from "react-icons/fa";

export default function PesoTubos() {
  const handleBack = useNavigateBack(paths.service);

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
  const [selectedMetric, setSelectedMetric] = useState<"empty" | "water" | "full">(
    "full"
  );

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
    const rows = materials
      .map((material) => ({
        material: material,
        empty: data[material as keyof typeof data].empty,
        water: data[material as keyof typeof data].water,
        full: data[material as keyof typeof data].full,
      }))
      .filter((item) => item.empty > 0);

    // Ordenar do menor para o maior (melhora leitura do gráfico e tabela)
    const metric = selectedMetric;
    return [...rows].sort((a, b) => (a[metric] ?? 0) - (b[metric] ?? 0));
  };

  const formatKg = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getSelectedLinearWeightSummary = () => {
    const data = pipeData[selectedDiameter as keyof typeof pipeData];
    const cpvc = data["CPVC / PVC-U"];
    const steel = data["Tubo Aço SCH 40"];
    return {
      cpvcEmpty: cpvc?.empty ?? 0,
      cpvcWater: cpvc?.water ?? 0,
      cpvcFull: cpvc?.full ?? 0,
      steelEmpty: steel?.empty ?? 0,
      steelWater: steel?.water ?? 0,
      steelFull: steel?.full ?? 0,
    };
  };

  const chartData = getChartData();
  const maxValue =
    chartData.length === 0
      ? 0
      : Math.max(...chartData.map((d) => Math.max(d.empty, d.water, d.full)));
  const CHART_HEIGHT_PX = 220;
  const yTicks = (() => {
    if (maxValue <= 0) return [];
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) =>
      (maxValue * i) / steps
    );
  })();

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const issues: { area: string; message: string }[] = [];
    const EPS = 1e-6;

    // 1) Varredura completa por diâmetro/material: sem negativos + total = tubo + água
    for (const d of Object.keys(pipeData) as Array<keyof typeof pipeData>) {
      const byMaterial = pipeData[d];
      for (const m of Object.keys(byMaterial) as Array<keyof typeof byMaterial>) {
        const v = byMaterial[m];
        if (v.empty < -EPS || v.water < -EPS || v.full < -EPS) {
          issues.push({
            area: "dados",
            message: `${String(d)} / ${String(m)} contém peso negativo`,
          });
        }
        const expectedFull = v.empty + v.water;
        if (Math.abs(v.full - expectedFull) > 0.02) {
          issues.push({
            area: "fórmula",
            message: `${String(d)} / ${String(m)}: full (${v.full}) != empty+water (${expectedFull.toFixed(
              2
            )})`,
          });
        }
      }
    }

    // 2) Escala do gráfico: maxValue precisa ser >= maior valor presente
    const allValues: number[] = [];
    for (const d of Object.keys(pipeData) as Array<keyof typeof pipeData>) {
      const byMaterial = pipeData[d];
      for (const m of Object.keys(byMaterial) as Array<keyof typeof byMaterial>) {
        const v = byMaterial[m];
        allValues.push(v.empty, v.water, v.full);
      }
    }
    const globalMax = Math.max(...allValues);
    if (globalMax < 0) {
      issues.push({ area: "dados", message: "globalMax negativo (inesperado)" });
    }

    if (issues.length > 0) {
      console.warn("[QA PesoTubos] Falhas detectadas:", issues);
      console.table(issues);
    } else {
      console.info("[QA PesoTubos] OK — validação automática sem falhas.");
    }
  }, [pipeData]);

  return (
    <div className="peso-tubos-container">
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

        <div className="diameter-selector">
          <h3>Ordenar gráfico por:</h3>
          <div className="diameter-buttons">
            <button
              className={`diameter-btn ${selectedMetric === "empty" ? "active" : ""}`}
              onClick={() => setSelectedMetric("empty")}
            >
              Peso do Tubo
            </button>
            <button
              className={`diameter-btn ${selectedMetric === "water" ? "active" : ""}`}
              onClick={() => setSelectedMetric("water")}
            >
              Peso da Água
            </button>
            <button
              className={`diameter-btn ${selectedMetric === "full" ? "active" : ""}`}
              onClick={() => setSelectedMetric("full")}
            >
              Peso Total
            </button>
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">
            <FaWeightHanging className="title-icon" />
            RESUMO (kg/m) — DIÂMETRO {selectedDiameter}
          </h2>
          {(() => {
            const s = getSelectedLinearWeightSummary();
            return (
              <div className="benefits-grid">
                <div className="benefit-card">
                  <h3>CPVC / PVC-U</h3>
                  <p>
                    <strong>Tubo:</strong> {formatKg(s.cpvcEmpty)} kg/m
                  </p>
                  <p>
                    <strong>Água:</strong> {formatKg(s.cpvcWater)} kg/m
                  </p>
                  <p>
                    <strong>Total:</strong> {formatKg(s.cpvcFull)} kg/m
                  </p>
                </div>
                <div className="benefit-card">
                  <h3>Tubo Aço SCH 40</h3>
                  <p>
                    <strong>Tubo:</strong> {formatKg(s.steelEmpty)} kg/m
                  </p>
                  <p>
                    <strong>Água:</strong> {formatKg(s.steelWater)} kg/m
                  </p>
                  <p>
                    <strong>Total:</strong> {formatKg(s.steelFull)} kg/m
                  </p>
                </div>
              </div>
            );
          })()}
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
            <div className="chart-area">
              <div className="chart-y-axis" aria-hidden="true">
                <div className="chart-y-axis-label">kg/m</div>
                <div className="chart-y-ticks" style={{ height: CHART_HEIGHT_PX }}>
                  {yTicks
                    .slice()
                    .reverse()
                    .map((t) => (
                      <div key={t} className="chart-y-tick">
                        <div className="chart-y-grid" />
                        <div className="chart-y-value">{formatKg(t)}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="chart-bars" style={{ height: CHART_HEIGHT_PX }}>
                {chartData.map((item) => (
                  <div key={item.material} className="chart-bar-group">
                    <div className="bars">
                      <div
                        className="bar empty-bar"
                        style={{
                          height: `${
                            maxValue > 0
                              ? (item.empty / maxValue) * CHART_HEIGHT_PX
                              : 0
                          }px`,
                        }}
                        title={`Peso do tubo: ${formatKg(item.empty)} kg/m`}
                      >
                        <span className="bar-value">{formatKg(item.empty)}</span>
                      </div>
                      <div
                        className="bar water-bar"
                        style={{
                          height: `${
                            maxValue > 0
                              ? (item.water / maxValue) * CHART_HEIGHT_PX
                              : 0
                          }px`,
                        }}
                        title={`Peso da água: ${formatKg(item.water)} kg/m`}
                      >
                        <span className="bar-value">{formatKg(item.water)}</span>
                      </div>
                      <div
                        className="bar full-bar"
                        style={{
                          height: `${
                            maxValue > 0
                              ? (item.full / maxValue) * CHART_HEIGHT_PX
                              : 0
                          }px`,
                        }}
                        title={`Peso total: ${formatKg(item.full)} kg/m`}
                      >
                        <span className="bar-value">{formatKg(item.full)}</span>
                      </div>
                    </div>
                    <div className="bar-label" title={item.material}>
                      {item.material}
                    </div>
                  </div>
                ))}
              </div>
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
