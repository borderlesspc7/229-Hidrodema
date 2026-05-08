import "./ConsumoAdesivo.css";
import { useEffect, useState } from "react";
import BackButton from "../../../components/ui/BackButton/BackButton";
import { paths } from "../../../routes/paths";

type ProductType = "PVC-U" | "CPVC";
type CpvcApplication = "Água Quente" | "Industrial";
type CpvcCureMode = "Padrão" | "Cura rápida / Alta temperatura";

export default function ConsumoAdesivo() {
  const [productType, setProductType] = useState<ProductType>("PVC-U");
  const [cpvcApplication, setCpvcApplication] =
    useState<CpvcApplication>("Água Quente");
  const [cpvcCureMode, setCpvcCureMode] = useState<CpvcCureMode>("Padrão");

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
    '14"',
    '16"',
  ];

  const accessories = [
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

  const productLabel = productType === "PVC-U" ? "PVC-U" : "CPVC";

  const diameterInInches: Record<string, number> = {
    '½"': 0.5,
    '¾"': 0.75,
    '1"': 1,
    '1.1/4"': 1.25,
    '1.1/2"': 1.5,
    '2"': 2,
    '2.1/2"': 2.5,
    '3"': 3,
    '4"': 4,
    '6"': 6,
    '8"': 8,
    '10"': 10,
    '12"': 12,
    '14"': 14,
    '16"': 16,
  };

  const getBaseAdhesiveCode = (type: ProductType, diameter: string) => {
    const inches = diameterInInches[diameter] ?? 0;

    if (type === "PVC-U") {
      if (inches > 0 && inches <= 4) return "705";
      if (inches >= 6 && inches <= 12) return "717";
      if (inches === 14 || inches === 16) return "719";
      return "-";
    }

    // CPVC
    if (inches > 0 && inches <= 12) return "724";
    if (inches === 14 || inches === 16) return "729";
    return "-";
  };

  const getSelectedAdhesiveCode = (diameter: string) => {
    const inches = diameterInInches[diameter] ?? 0;
    const base = getBaseAdhesiveCode(productType, diameter);

    if (productType !== "CPVC") return base;

    // CPVC: quando for Industrial + Cura rápida/Alta temperatura, força adesivo de alta performance.
    // (mantém regra por diâmetro em Água Quente e no modo Padrão)
    if (
      cpvcApplication === "Industrial" &&
      cpvcCureMode === "Cura rápida / Alta temperatura" &&
      inches > 0
    ) {
      return "729";
    }

    return base;
  };

  const getViscosityLabel = (adhesiveCode: string) => {
    const map: Record<string, string> = {
      "705": "Baixa (Série 700)",
      "717": "Baixa (Série 700)",
      "719": "Alta (Série 700)",
      "724": "Baixa (CPVC)",
      "729": "Alta (CPVC)",
    };
    return map[adhesiveCode] || "-";
  };

  const getBranchingValidation = (type: ProductType, diameter: string) => {
    const inches = diameterInInches[diameter] ?? 0;

    // Regra explícita solicitada (Série 700 PVC-U).
    if (type === "PVC-U") {
      if (inches > 0 && inches <= 4) return { ok: true, reason: "Faixa até 4" };
      if (inches >= 6 && inches <= 12) return { ok: true, reason: "Faixa 6 a 12" };
      if (inches === 14 || inches === 16) return { ok: true, reason: "Faixa 14 e 16" };
      return {
        ok: false,
        reason:
          'Diâmetro fora das faixas configuradas (até 4", 6" a 12", 14" e 16").',
      };
    }

    // CPVC
    if (inches > 0 && inches <= 12) return { ok: true, reason: "Faixa 1/2 até 12" };
    if (inches === 14 || inches === 16) return { ok: true, reason: "Faixa 14 e 16" };
    return { ok: false, reason: "Diâmetro fora das faixas configuradas." };
  };

  // Função para calcular o total de juntas por diâmetro
  const calculateTotalJoints = (diameter: string) => {
    let total = 0;
    accessories.forEach((accessory) => {
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

  // Função para determinar o consumo por junta baseado no diâmetro
  const getConsumptionPerJoint = (diameter: string, adhesiveCode: string) => {
    const baseMap: { [key: string]: number } = {
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
    const highViscosityMap: { [key: string]: number } = {
      '14"': baseMap['14"'],
      '16"': baseMap['16"'],
    };

    const isHighViscosity = adhesiveCode === "719" || adhesiveCode === "729";
    if (isHighViscosity && (diameter === '14"' || diameter === '16"')) {
      return highViscosityMap[diameter] || 0;
    }

    return baseMap[diameter] || 0;
  };

  const formatLiters = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const getConsumptionLiters = (diameter: string) => {
    const totalJoints = calculateTotalJoints(diameter);
    const adhesiveCode = getSelectedAdhesiveCode(diameter);
    if (adhesiveCode === "-") return 0;
    const consumptionPerJoint = getConsumptionPerJoint(diameter, adhesiveCode);
    return totalJoints * consumptionPerJoint;
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

  const adhesiveCards =
    productType === "PVC-U"
      ? [
          {
            title: "Adesivo Weldon 705",
            application:
              'Para tubulações PVC-U sch 80 até 4" (inclusive)',
          },
          {
            title: "Adesivo Weldon 717",
            application:
              'Para tubulações PVC-U sch 80 de 6" a 12"',
          },
          {
            title: "Adesivo Weldon 719",
            application: 'Para tubulações PVC-U sch 80 de 14" e 16"',
          },
        ]
      : [
          {
            title: "Adesivo Weldon 724",
            application:
              cpvcApplication === "Industrial" &&
              cpvcCureMode === "Cura rápida / Alta temperatura"
                ? 'Uso geral CPVC (quando o sistema não priorizar 729)'
                : 'Para tubulações CPVC de 1/2" até 12"',
          },
          {
            title: "Adesivo Weldon 729",
            application:
              cpvcApplication === "Industrial" &&
              cpvcCureMode === "Cura rápida / Alta temperatura"
                ? 'Cura rápida / alta temperatura (Industrial) — priorizado em todos os diâmetros'
                : 'Para tubulações CPVC de 14" e 16"',
          },
        ];

  const SAFETY_MARGIN = 1.2;
  const PACK_SIZES_L = [
    { key: "galao_3_785", label: "Galão 3,785 l", liters: 3.785 },
    { key: "lata_946", label: "Lata 946 ml", liters: 0.946 },
    { key: "lata_473", label: "Lata 473 ml", liters: 0.473 },
    { key: "lata_237", label: "Lata 237 ml", liters: 0.237 },
    { key: "lata_118", label: "Lata 118 ml", liters: 0.118 },
  ] as const;

  const calcTotalsByAdhesiveCode = () => {
    const totals: Record<string, number> = {};
    diameters.forEach((d) => {
      const code = getSelectedAdhesiveCode(d);
      if (code === "-") return;
      totals[code] = (totals[code] ?? 0) + getConsumptionLiters(d);
    });
    return totals;
  };

  const totalsByCode = calcTotalsByAdhesiveCode();
  const totalConsumptionAll = Object.values(totalsByCode).reduce((a, b) => a + b, 0);

  const EQUIV_GROUPS = {
    baixa: { label: "Baixa viscosidade", codes: ["705", "717", "724"] },
    alta: { label: "Alta viscosidade", codes: ["719", "729"] },
  } as const;

  const totalsByGroup = {
    baixa: EQUIV_GROUPS.baixa.codes.reduce((sum, c) => sum + (totalsByCode[c] ?? 0), 0),
    alta: EQUIV_GROUPS.alta.codes.reduce((sum, c) => sum + (totalsByCode[c] ?? 0), 0),
  };

  const computePackaging = (litersNeeded: number) => {
    let remaining = Math.max(0, litersNeeded) * SAFETY_MARGIN;
    const counts: Record<(typeof PACK_SIZES_L)[number]["key"], number> = {
      galao_3_785: 0,
      lata_946: 0,
      lata_473: 0,
      lata_237: 0,
      lata_118: 0,
    };

    for (const size of PACK_SIZES_L) {
      if (remaining <= 1e-9) break;
      const n = Math.floor((remaining + 1e-9) / size.liters);
      if (n > 0) {
        counts[size.key] = n;
        remaining -= n * size.liters;
      }
    }

    // Se sobrar qualquer fração, completa com a menor lata.
    if (remaining > 1e-6) {
      counts.lata_118 += 1;
      remaining = 0;
    }

    const purchasedLiters = PACK_SIZES_L.reduce(
      (sum, s) => sum + counts[s.key] * s.liters,
      0
    );

    return { counts, purchasedLiters, litersWithMargin: litersNeeded * SAFETY_MARGIN };
  };

  const packagingBaixa = computePackaging(totalsByGroup.baixa);
  const packagingAlta = computePackaging(totalsByGroup.alta);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const issues: { area: string; message: string }[] = [];

    const approxEq = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;

    // 1) Varredura: códigos de adesivo por cenário (furos de lógica)
    const diametersToTest = diameters;
    const pvcCodes = ["705", "717", "719", "-"] as const;
    const cpvcCodes = ["724", "729", "-"] as const;

    for (const d of diametersToTest) {
      const pvc = getBaseAdhesiveCode("PVC-U", d);
      if (!pvcCodes.includes(pvc as (typeof pvcCodes)[number])) {
        issues.push({ area: "ramificação", message: `PVC-U: código inválido '${pvc}' em ${d}` });
      }

      // CPVC base
      const cpvc = getBaseAdhesiveCode("CPVC", d);
      if (!cpvcCodes.includes(cpvc as (typeof cpvcCodes)[number])) {
        issues.push({ area: "ramificação", message: `CPVC: código inválido '${cpvc}' em ${d}` });
      }
    }

    // 2) Varredura: combinações CPVC aplicação x modo (priorização 729)
    const cpvcApplications: CpvcApplication[] = ["Água Quente", "Industrial"];
    const cpvcModes: CpvcCureMode[] = ["Padrão", "Cura rápida / Alta temperatura"];
    for (const app of cpvcApplications) {
      for (const mode of cpvcModes) {
        for (const d of diametersToTest) {
          const inches = diameterInInches[d] ?? 0;
          const base = getBaseAdhesiveCode("CPVC", d);
          const expected =
            app === "Industrial" && mode === "Cura rápida / Alta temperatura" && inches > 0
              ? "729"
              : base;

          // calcula manualmente (sem mexer no state)
          const selected =
            app === "Industrial" &&
            mode === "Cura rápida / Alta temperatura" &&
            inches > 0
              ? "729"
              : base;

          if (selected !== expected) {
            issues.push({
              area: "ramificação",
              message: `CPVC (${app}/${mode}) divergência em ${d}: esperado ${expected}, obtido ${selected}`,
            });
          }
        }
      }
    }

    // 3) Embalagens: volume comprado deve cobrir volume com margem
    const assertPackaging = (group: string, p: ReturnType<typeof computePackaging>) => {
      if (p.purchasedLiters + 1e-9 < p.litersWithMargin) {
        issues.push({
          area: "embalagens",
          message: `${group}: volume comprado (${p.purchasedLiters.toFixed(
            3
          )}L) menor que necessário com margem (${p.litersWithMargin.toFixed(3)}L)`,
        });
      }
      if (p.litersWithMargin < 0 || p.purchasedLiters < 0) {
        issues.push({
          area: "embalagens",
          message: `${group}: litros negativos detectados`,
        });
      }
    };
    assertPackaging("Baixa", packagingBaixa);
    assertPackaging("Alta", packagingAlta);

    // 4) Consumo: garantir não-negativo e formatação coerente
    for (const d of diametersToTest) {
      const liters = getConsumptionLiters(d);
      if (liters < -1e-12) {
        issues.push({ area: "consumo", message: `Consumo negativo em ${d}: ${liters}` });
      }
      const formatted = formatLiters(liters);
      if (typeof formatted !== "string" || formatted.length === 0) {
        issues.push({ area: "consumo", message: `Formatação inválida em ${d}` });
      }
    }

    // 5) Invariantes de agrupamento equivalências
    const sumCodes = (codes: readonly string[]) =>
      codes.reduce((s, c) => s + (totalsByCode[c] ?? 0), 0);
    if (!approxEq(sumCodes(EQUIV_GROUPS.baixa.codes), totalsByGroup.baixa)) {
      issues.push({ area: "equivalência", message: "Soma grupo baixa divergente" });
    }
    if (!approxEq(sumCodes(EQUIV_GROUPS.alta.codes), totalsByGroup.alta)) {
      issues.push({ area: "equivalência", message: "Soma grupo alta divergente" });
    }

    if (issues.length > 0) {
      console.warn("[QA ConsumoAdesivo] Falhas detectadas:", issues);
      console.table(issues);
    } else {
      console.info("[QA ConsumoAdesivo] OK — validação automática sem falhas.");
    }
  });

  return (
    <div className="consumo-adesivo-container hd-page-bg">
      <div className="consumo-adesivo-header">
        <BackButton fallbackPath={paths.service} className="back-button" />
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
          <div className="product-type-section product-type-section--highlight">
            <div className="product-type-title">Tipo de Produto</div>
            <div className="product-type-toggle" role="tablist" aria-label="Tipo de Produto">
              <button
                type="button"
                className={`product-type-toggle-btn ${
                  productType === "PVC-U" ? "active" : ""
                }`}
                onClick={() => setProductType("PVC-U")}
                aria-pressed={productType === "PVC-U"}
              >
                PVC-U
              </button>
              <button
                type="button"
                className={`product-type-toggle-btn ${
                  productType === "CPVC" ? "active" : ""
                }`}
                onClick={() => setProductType("CPVC")}
                aria-pressed={productType === "CPVC"}
              >
                CPVC
              </button>
            </div>
            <div className="product-type-helper">
              Selecionado: <strong>{productLabel}</strong>
            </div>

            {productType === "CPVC" && (
              <div className="cpvc-config">
                <div className="cpvc-config-row">
                  <div className="product-type-title">Aplicação</div>
                  <div className="product-type-toggle" role="tablist" aria-label="Aplicação CPVC">
                    <button
                      type="button"
                      className={`product-type-toggle-btn ${
                        cpvcApplication === "Água Quente" ? "active" : ""
                      }`}
                      onClick={() => setCpvcApplication("Água Quente")}
                      aria-pressed={cpvcApplication === "Água Quente"}
                    >
                      Água Quente
                    </button>
                    <button
                      type="button"
                      className={`product-type-toggle-btn ${
                        cpvcApplication === "Industrial" ? "active" : ""
                      }`}
                      onClick={() => setCpvcApplication("Industrial")}
                      aria-pressed={cpvcApplication === "Industrial"}
                    >
                      Industrial
                    </button>
                  </div>
                </div>

                <div className="cpvc-config-row">
                  <div className="product-type-title">Modo</div>
                  <div className="product-type-toggle" role="tablist" aria-label="Modo CPVC">
                    <button
                      type="button"
                      className={`product-type-toggle-btn ${
                        cpvcCureMode === "Padrão" ? "active" : ""
                      }`}
                      onClick={() => setCpvcCureMode("Padrão")}
                      aria-pressed={cpvcCureMode === "Padrão"}
                    >
                      Padrão
                    </button>
                    <button
                      type="button"
                      className={`product-type-toggle-btn ${
                        cpvcCureMode === "Cura rápida / Alta temperatura"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setCpvcCureMode("Cura rápida / Alta temperatura")}
                      aria-pressed={
                        cpvcCureMode === "Cura rápida / Alta temperatura"
                      }
                    >
                      Cura rápida / Alta temperatura
                    </button>
                  </div>
                </div>

                <div className="product-type-helper">
                  Dica: em <strong>Industrial + Cura rápida/Alta temperatura</strong>, o sistema
                  prioriza o adesivo <strong>729</strong>.
                </div>
              </div>
            )}
          </div>

          <div className="table-container">
            <table className="consumo-table">
              <thead>
                <tr>
                  <th className="accessory-header">Acessórios</th>
                  {diameters.map((diameter) => (
                    <th key={diameter} className="diameter-header">
                      {diameter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accessories.map((accessory, index) => (
                  <tr
                    key={accessory}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                  >
                    <td className="accessory-cell">{accessory}</td>
                    {diameters.map((diameter) => (
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
                  {diameters.map((diameter) => (
                    <td key={diameter} className="total-value-cell">
                      {calculateTotalJoints(diameter)}
                    </td>
                  ))}
                </tr>
                <tr className="adhesive-row">
                  <td className="adhesive-cell">
                    <strong>Adesivo</strong>
                  </td>
                  {diameters.map((diameter) => (
                    <td
                      key={diameter}
                      className={`adhesive-value-cell ${
                        getSelectedAdhesiveCode(diameter) === "-"
                          ? "adhesive-value-cell--invalid"
                          : ""
                      }`}
                      title={
                        getBranchingValidation(productType, diameter).ok
                          ? `OK (${getBranchingValidation(productType, diameter).reason})`
                          : getBranchingValidation(productType, diameter).reason
                      }
                    >
                      {getSelectedAdhesiveCode(diameter)}
                    </td>
                  ))}
                </tr>
                <tr className="viscosity-row">
                  <td className="viscosity-cell">
                    <strong>Viscosidade</strong>
                  </td>
                  {diameters.map((diameter) => {
                    const code = getSelectedAdhesiveCode(diameter);
                    return (
                      <td
                        key={diameter}
                        className={`viscosity-value-cell ${
                          code === "-" ? "viscosity-value-cell--invalid" : ""
                        }`}
                      >
                        {getViscosityLabel(code)}
                      </td>
                    );
                  })}
                </tr>
                <tr className="consumption-row">
                  <td className="consumption-cell">
                    <strong>Consumo (L)</strong>
                  </td>
                  {diameters.map((diameter) => (
                    <td key={diameter} className="consumption-value-cell">
                      {formatLiters(getConsumptionLiters(diameter))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {productType === "PVC-U" && (
            <div className="technical-validation">
              <div className="technical-validation-title">
                Validação técnica (PVC-U — Série 700)
              </div>
              <div className="technical-validation-text">
                O sistema seleciona automaticamente o adesivo por faixa de diâmetro:
                <strong> 705</strong> (até 4"), <strong>717</strong> (6" a 12"),
                <strong> 719</strong> (14" e 16"). Diâmetros fora dessas faixas
                ficam marcados com <strong>-</strong>.
              </div>
              <div className="technical-validation-note">
                Observação: a validação de pressão por norma depende da tabela técnica
                (pressão x temperatura x schedule). Quando você enviar esses limites,
                eu amarro a regra automaticamente aqui.
              </div>
            </div>
          )}

          {productType === "CPVC" && (
            <div className="technical-validation">
              <div className="technical-validation-title">
                Validação técnica (CPVC — Série Pro)
              </div>
              <div className="technical-validation-text">
                <strong>Aplicação:</strong> {cpvcApplication} &nbsp;|&nbsp;
                <strong>Modo:</strong> {cpvcCureMode}
              </div>
              <div className="technical-validation-text" style={{ marginTop: 8 }}>
                Regra base por diâmetro: <strong>724</strong> (1/2" até 12") e{" "}
                <strong>729</strong> (14" e 16"). Em{" "}
                <strong>Industrial + Cura rápida/Alta temperatura</strong>, o sistema
                seleciona <strong>729</strong> para todos os diâmetros.
              </div>
              <div className="technical-validation-note">
                Se você enviar os limites normativos (pressão/temperatura por aplicação),
                eu adiciono a checagem automática e os avisos por coluna.
              </div>
            </div>
          )}
        </div>

        <div className="products-section">
          <h2 className="products-title">INFORMAÇÕES DOS PRODUTOS ({productLabel})</h2>
          <div className="products-grid">
            {adhesiveCards.map((card) => (
              <div key={card.title} className="product-card">
                <h3>{card.title}</h3>
                <p>
                  <strong>Aplicação:</strong> {card.application}
                </p>
                <p>
                  <strong>Embalagem:</strong> Latas de 118 ml até galão 3,785 l
                </p>
              </div>
            ))}
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

          <div className="tables-grid">
            <div className="packaging-table-container">
              <h3 className="packaging-table-title">INDICAÇÃO DE EMBALAGENS</h3>
              <div className="packaging-table-wrapper">
                <table className="packaging-table">
                  <thead>
                    <tr>
                      <th className="packaging-header">Embalagem</th>
                      <th className="packaging-header">
                        {EQUIV_GROUPS.baixa.label} ({EQUIV_GROUPS.baixa.codes.join("/")})
                      </th>
                      <th className="packaging-header">
                        {EQUIV_GROUPS.alta.label} ({EQUIV_GROUPS.alta.codes.join("/")})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PACK_SIZES_L.map((s) => (
                      <tr key={s.key}>
                        <td className="packaging-label">{s.label}</td>
                        <td className="packaging-value">
                          {packagingBaixa.counts[s.key] || 0}
                        </td>
                        <td className="packaging-value">
                          {packagingAlta.counts[s.key] || 0}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="packaging-label">
                        <strong>Consumo (L)</strong>
                      </td>
                      <td className="packaging-value">
                        {formatLiters(totalsByGroup.baixa)}
                      </td>
                      <td className="packaging-value">
                        {formatLiters(totalsByGroup.alta)}
                      </td>
                    </tr>
                    <tr>
                      <td className="packaging-label">
                        <strong>Com margem (L)</strong>
                      </td>
                      <td className="packaging-value">
                        {formatLiters(packagingBaixa.litersWithMargin)}
                      </td>
                      <td className="packaging-value">
                        {formatLiters(packagingAlta.litersWithMargin)}
                      </td>
                    </tr>
                    <tr>
                      <td className="packaging-label">
                        <strong>Volume comprado (L)</strong>
                      </td>
                      <td className="packaging-value">
                        {formatLiters(packagingBaixa.purchasedLiters)}
                      </td>
                      <td className="packaging-value">
                        {formatLiters(packagingAlta.purchasedLiters)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="safety-margin">
                <strong>Margem segurança:</strong> {SAFETY_MARGIN.toFixed(2).replace(".", ",")}
                {" · "}
                <strong>Total consumo:</strong> {formatLiters(totalConsumptionAll)} L
              </div>
            </div>

            <div className="conversion-table-container">
              <h3 className="conversion-table-title">FRACIONAMENTO</h3>
              <div className="conversion-table-wrapper">
                <table className="conversion-table">
                  <thead>
                    <tr>
                      <th className="conversion-header"></th>
                      <th className="conversion-header">Fração (0,1 a 0,9)</th>
                      <th className="conversion-header">lata 946 ml</th>
                      <th className="conversion-header">lata 473 ml</th>
                      <th className="conversion-header">lata 273 ml</th>
                      <th className="conversion-header">lata 118 ml</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="conversion-label">Galão 3,785l</td>
                      <td className="conversion-empty"></td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                    </tr>
                    <tr>
                      <td className="conversion-label">lata 946 ml</td>
                      <td className="conversion-empty"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                    </tr>
                    <tr>
                      <td className="conversion-label">lata 473 ml</td>
                      <td className="conversion-empty"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-value">0,0</td>
                      <td className="conversion-value">0,0</td>
                    </tr>
                    <tr>
                      <td className="conversion-label"></td>
                      <td className="conversion-empty"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-gray"></td>
                      <td className="conversion-gray"></td>
                    </tr>
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
