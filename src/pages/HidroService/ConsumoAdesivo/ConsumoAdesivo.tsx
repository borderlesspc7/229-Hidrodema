import "./ConsumoAdesivo.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";

const DIAMETERS = [
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
  '14"',
  '16"',
];

const ACCESSORIES = [
  "Luva",
  "Luva L/R",
  "Joelhos 45° e 90°",
  "Te",
  "Adaptador",
  "Bucha de Redução",
  "Cap",
  "Flanges",
  "Válvulas",
  "União",
];

const ADHESIVE_705_DIAMETERS = new Set<string>([
  '½"',
  '¾"',
  '1"',
  '1.1/4"',
  '1.1/2"',
  '2"',
  '2.1/2"',
  '3"',
  '4"',
]);

const ADHESIVE_717_DIAMETERS = new Set<string>(
  DIAMETERS.filter((diameter) => !ADHESIVE_705_DIAMETERS.has(diameter))
);

const PACKAGING_OPTIONS = [
  { label: "Galão 3,785 l", volume: 3.785 },
  { label: "Lata 946 ml", volume: 0.946 },
  { label: "Lata 473 ml", volume: 0.473 },
  { label: "Lata 237 ml", volume: 0.237 },
  { label: "Lata 118 ml", volume: 0.118 },
];

type PackagingBreakdown = {
  counts: number[];
  remainders: number[];
};

export default function ConsumoAdesivo() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/service");
  };

  // Estado para controlar as quantidades de acessórios
  const [accessoryQuantities, setAccessoryQuantities] = useState<{
    [key: string]: { [diameter: string]: number };
  }>({
    Luva: {},
    "Luva L/R": {},
    "Joelhos 45° e 90°": {},
    Te: {},
    Adaptador: {},
    "Bucha de Redução": {},
    Cap: {},
    Flanges: {},
    Válvulas: {},
    União: {},
  });

  const [safetyMargin, setSafetyMargin] = useState(1.2);

  const formatLiters = (value: number, fractionDigits = 1) =>
    (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

  // Função para calcular o total de juntas por diâmetro
  const calculateTotalJoints = (diameter: string) => {
    let total = 0;
    ACCESSORIES.forEach((accessory) => {
      const quantity = accessoryQuantities[accessory][diameter] || 0;
      // Cada tipo de acessório tem um número diferente de juntas
      const jointsPerAccessory = getJointsPerAccessory(accessory);
      total += quantity * jointsPerAccessory;
    });
    return total;
  };

  // Função para determinar quantas juntas cada acessório tem
  const getJointsPerAccessory = (accessory: string) => {
    switch (accessory) {
      case "Cap":
        return 1;
      case "Luva":
        return 2;
      case "Te":
        return 3;
      case "Joelhos 45° e 90°":
        return 2;
      case "Luva L/R":
        return 2;
      case "Adaptador":
        return 2;
      case "Bucha de Redução":
        return 2;
      case "Flanges":
        return 2;
      case "Válvulas":
        return 2;
      case "União":
        return 2;
      default:
        return 1;
    }
  };

  // Função para calcular o consumo de adesivo
  const calculateConsumption = (diameter: string) => {
    const totalJoints = calculateTotalJoints(diameter);
    // Consumo baseado no diâmetro (valores aproximados)
    const consumptionPerJoint = getConsumptionPerJoint(diameter);
    return totalJoints * consumptionPerJoint;
  };

  // Função para determinar o consumo por junta baseado no diâmetro
  const getConsumptionPerJoint = (diameter: string) => {
    const diameterMap: { [key: string]: number } = {
      '½"': 0.1,
      '¾"': 0.15,
      '1"': 0.2,
      '1.1/4"': 0.25,
      '1.1/2"': 0.3,
      '2"': 0.4,
      '2.1/2"': 0.5,
      '3"': 0.6,
      '4"': 0.8,
      '6"': 1.2,
      '8"': 1.6,
      '10"': 2.0,
      '12"': 2.4,
      '14"': 2.8,
      '16"': 3.2,
    };
    return diameterMap[diameter] || 0;
  };

  // Função para atualizar a quantidade de acessórios
  const updateQuantity = (
    accessory: string,
    diameter: string,
    value: number
  ) => {
    setAccessoryQuantities((prev) => ({
      ...prev,
      [accessory]: {
        ...prev[accessory],
        [diameter]: value,
      },
    }));
  };

  const consumptionByDiameter = DIAMETERS.reduce((acc, diameter) => {
    acc[diameter] = calculateConsumption(diameter);
    return acc;
  }, {} as Record<string, number>);

  const totalAdhesive705 = DIAMETERS.reduce((sum, diameter) => {
    if (ADHESIVE_705_DIAMETERS.has(diameter)) {
      return sum + consumptionByDiameter[diameter];
    }
    return sum;
  }, 0);

  const totalAdhesive717 = DIAMETERS.reduce((sum, diameter) => {
    if (ADHESIVE_717_DIAMETERS.has(diameter)) {
      return sum + consumptionByDiameter[diameter];
    }
    return sum;
  }, 0);

  const totalPrime = totalAdhesive705 + totalAdhesive717;

  const totalWithMargin = (value: number) =>
    parseFloat((value * safetyMargin).toFixed(3));

  const calculatePackagingBreakdown = (
    totalLiters: number
  ): PackagingBreakdown => {
    let remaining = totalLiters;
    const counts: number[] = [];
    const remainders: number[] = [];

    PACKAGING_OPTIONS.forEach((option, index) => {
      const isLast = index === PACKAGING_OPTIONS.length - 1;
      const adjustedRemaining = Math.max(remaining, 0);
      const count =
        adjustedRemaining <= 0
          ? 0
          : isLast
          ? Math.ceil((adjustedRemaining - 1e-6) / option.volume)
          : Math.floor((adjustedRemaining + 1e-6) / option.volume);

      counts.push(count);
      remaining = parseFloat(
        (adjustedRemaining - count * option.volume).toFixed(3)
      );

      if (remaining < 0) {
        remaining = 0;
      }

      remainders.push(remaining);
    });

    return { counts, remainders };
  };

  const adhesive705WithMargin = totalWithMargin(totalAdhesive705);
  const adhesive717WithMargin = totalWithMargin(totalAdhesive717);
  const primeWithMargin = totalWithMargin(totalPrime);

  const breakdown705 = calculatePackagingBreakdown(adhesive705WithMargin);
  const breakdown717 = calculatePackagingBreakdown(adhesive717WithMargin);
  const breakdownPrime = calculatePackagingBreakdown(primeWithMargin);

  const smallerPackagingOptions = PACKAGING_OPTIONS.slice(1);

  const getFractionData = (total: number, breakdown: PackagingBreakdown) => {
    const fractionBase = PACKAGING_OPTIONS[0].volume;
    const remainderAfterGallons = breakdown.remainders[0] ?? total;
    const fraction = parseFloat(
      (fractionBase === 0 ? 0 : remainderAfterGallons / fractionBase).toFixed(2)
    );

    return {
      fraction,
      smallerPackages: breakdown.counts.slice(1),
    };
  };

  const fraction705 = getFractionData(adhesive705WithMargin, breakdown705);
  const fraction717 = getFractionData(adhesive717WithMargin, breakdown717);
  const fractionPrime = getFractionData(primeWithMargin, breakdownPrime);

  const totalGeneralConsumption = totalAdhesive705 + totalAdhesive717;
  const totalGeneralWithMargin = totalWithMargin(totalGeneralConsumption);

  return (
    <div className="consumo-adesivo-container">
      <Breadcrumb />
      <div className="consumo-adesivo-header">
        <Button
          variant="secondary"
          className="back-button"
          onClick={handleBack}
        >
          Voltar
        </Button>
        <div className="consumo-adesivo-title-section">
          <h1 className="consumo-adesivo-title">CONSUMO DE ADESIVO</h1>
          <span className="consumo-adesivo-subtitle">
            Planilha Técnica de Cálculo
          </span>
        </div>
        <div className="consumo-adesivo-header-spacer"></div>
      </div>

      <div className="consumo-adesivo-content">
        <div className="intro-section">
          <h2 className="intro-title">CÁLCULO DE CONSUMO DE ADESIVO</h2>
          <div className="intro-content">
            <p>
              O uso correto do adesivo influencia diretamente na vedação e
              durabilidade das conexões. Esta seção traz uma planilha técnica
              que permite calcular o consumo médio de adesivo por diâmetro e
              quantidade de juntas, auxiliando na estimativa precisa de
              materiais durante orçamentos e execuções.
            </p>
            <p>
              <strong>Instruções de uso:</strong>
            </p>
            <ul>
              <li>
                Insira as quantidades de conexões nos espaços em branco de
                acordo com o diâmetro
              </li>
              <li>
                O sistema calculará automaticamente o total de juntas e consumo
                de adesivo
              </li>
              <li>
                Junta: é considerado uma união entre duas partes (Bolsa/Tubo)
              </li>
              <li>Ex: Cap = 1 junta; Luva = 2 juntas; Te = 3 juntas</li>
            </ul>
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">PLANILHA DE CONSUMO DE ADESIVO</h2>
          <div className="table-container">
            <table className="consumo-table">
              <thead>
                <tr>
                  <th className="accessory-header">Acessórios</th>
                  {DIAMETERS.map((diameter) => (
                    <th key={diameter} className="diameter-header">
                      {diameter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCESSORIES.map((accessory, index) => (
                  <tr
                    key={accessory}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                  >
                    <td className="accessory-cell">{accessory}</td>
                    {DIAMETERS.map((diameter) => (
                      <td key={diameter} className="quantity-cell">
                        <input
                          type="number"
                          min="0"
                          value={accessoryQuantities[accessory][diameter] || ""}
                          onChange={(e) =>
                            updateQuantity(
                              accessory,
                              diameter,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="quantity-input"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="total-cell">
                    <strong>Total de Juntas</strong>
                  </td>
                  {DIAMETERS.map((diameter) => (
                    <td key={diameter} className="total-value-cell">
                      {calculateTotalJoints(diameter)}
                    </td>
                  ))}
                </tr>
                <tr className="consumption-row">
                  <td className="consumption-cell">
                    <strong>Consumo (L)</strong>
                  </td>
                  {DIAMETERS.map((diameter) => (
                    <td key={diameter} className="consumption-value-cell">
                      {formatLiters(consumptionByDiameter[diameter])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="products-section">
          <h2 className="products-title">INFORMAÇÕES DOS PRODUTOS</h2>
          <div className="products-grid">
            <div className="product-card">
              <h3>Adesivo Weldon 705</h3>
              <p>
                <strong>Aplicação:</strong> Para tubulações PVC-U sch 80 até 4"
              </p>
              <p>
                <strong>Embalagem:</strong> Latas de 118 ml até galão 3,785 l
              </p>
            </div>
            <div className="product-card">
              <h3>Adesivo Weldon 717</h3>
              <p>
                <strong>Aplicação:</strong> Para tubulações PVC-U sch 80 acima
                de 4"
              </p>
              <p>
                <strong>Embalagem:</strong> Latas de 118 ml até galão 3,785 l
              </p>
            </div>
            <div className="product-card">
              <h3>Primers P 68 Weldon</h3>
              <p>
                <strong>Aplicação:</strong> Para tubulações de CPVC e PVC-U sch
                80
              </p>
              <p>
                <strong>Embalagem:</strong> Latas de 118 ml até galão 3,785 l
              </p>
            </div>
          </div>

          <div className="consumption-summary">
            <div className="summary-card">
              <span className="summary-label">Consumo total (L)</span>
              <strong className="summary-value">
                {formatLiters(totalGeneralConsumption)}
              </strong>
              <span className="summary-sub">
                Com margem: {formatLiters(totalGeneralWithMargin)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Consumo 705 (L)</span>
              <strong className="summary-value">
                {formatLiters(totalAdhesive705)}
              </strong>
              <span className="summary-sub">
                Com margem: {formatLiters(adhesive705WithMargin)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Consumo 717 (L)</span>
              <strong className="summary-value">
                {formatLiters(totalAdhesive717)}
              </strong>
              <span className="summary-sub">
                Com margem: {formatLiters(adhesive717WithMargin)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Prime (L)</span>
              <strong className="summary-value">
                {formatLiters(totalPrime)}
              </strong>
              <span className="summary-sub">
                Com margem: {formatLiters(primeWithMargin)}
              </span>
            </div>
            <div className="summary-card summary-card--margin">
              <span className="summary-label">Margem de segurança</span>
              <div className="margin-input-group">
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={Number.isFinite(safetyMargin) ? safetyMargin : ""}
                  onChange={(event) => {
                    const newValue = parseFloat(event.target.value);
                    if (Number.isNaN(newValue)) {
                      setSafetyMargin(0);
                    } else {
                      setSafetyMargin(newValue >= 0 ? newValue : 0);
                    }
                  }}
                  className="margin-input"
                />
                <span className="summary-sub">
                  Aplicada às recomendações de embalagem
                </span>
              </div>
            </div>
          </div>

          <div className="tables-grid">
            <div className="packaging-table-container">
              <h3 className="packaging-table-title">INDICAÇÃO DE EMBALAGENS</h3>
              <div className="packaging-table-wrapper">
                <table className="packaging-table">
                  <thead>
                    <tr>
                      <th className="packaging-header">Volume</th>
                      <th className="packaging-header">Adesivo 705</th>
                      <th className="packaging-header">Adesivo 717</th>
                      <th className="packaging-header">Primer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PACKAGING_OPTIONS.map((option, index) => (
                      <tr key={option.label}>
                        <td className="packaging-label">{option.label}</td>
                        <td className="packaging-value">
                          {breakdown705.counts[index]}
                        </td>
                        <td className="packaging-value">
                          {breakdown717.counts[index]}
                        </td>
                        <td className="packaging-value">
                          {breakdownPrime.counts[index]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="safety-margin">
                <span>
                  Total 705 com margem:{" "}
                  <strong>{formatLiters(adhesive705WithMargin)}</strong> L
                </span>
                <span>
                  Total 717 com margem:{" "}
                  <strong>{formatLiters(adhesive717WithMargin)}</strong> L
                </span>
                <span>
                  Primer com margem:{" "}
                  <strong>{formatLiters(primeWithMargin)}</strong> L
                </span>
              </div>
            </div>

            <div className="conversion-table-container">
              <h3 className="conversion-table-title">FRACIONAMENTO</h3>
              <div className="conversion-table-wrapper">
                <table className="conversion-table">
                  <thead>
                    <tr>
                      <th className="conversion-header">Produto</th>
                      <th className="conversion-header">Fração (0,1 a 0,9)</th>
                      {smallerPackagingOptions.map((option) => (
                        <th key={option.label} className="conversion-header">
                          {option.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Adesivo 705", data: fraction705 },
                      { label: "Adesivo 717", data: fraction717 },
                      { label: "Primer", data: fractionPrime },
                    ].map(({ label, data }) => (
                      <tr key={label}>
                        <td className="conversion-label">{label}</td>
                        <td className="conversion-value">
                          {data.fraction.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        {data.smallerPackages.map((count, index) => (
                          <td
                            key={`${label}-${index}`}
                            className="conversion-value"
                          >
                            {count}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
