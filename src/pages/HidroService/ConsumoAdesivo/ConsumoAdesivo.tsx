import "./ConsumoAdesivo.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";

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

  // Função para calcular o consumo de adesivo
  const calculateConsumption = (diameter: string) => {
    const totalJoints = calculateTotalJoints(diameter);
    // Consumo baseado no diâmetro (valores aproximados)
    const consumptionPerJoint = getConsumptionPerJoint(diameter);
    return (totalJoints * consumptionPerJoint).toFixed(1);
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

  return (
    <div className="consumo-adesivo-container">
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
                <tr className="consumption-row">
                  <td className="consumption-cell">
                    <strong>Consumo (L)</strong>
                  </td>
                  {diameters.map((diameter) => (
                    <td key={diameter} className="consumption-value-cell">
                      {calculateConsumption(diameter)}
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

          <div className="tables-grid">
            <div className="packaging-table-container">
              <h3 className="packaging-table-title">INDICAÇÃO DE EMBALAGENS</h3>
              <div className="packaging-table-wrapper">
                <table className="packaging-table">
                  <thead>
                    <tr>
                      <th className="packaging-header" colSpan={2}>
                        Adesivo
                      </th>
                      <th className="packaging-header">Prime</th>
                    </tr>
                    <tr>
                      <th className="packaging-subheader">705 Weld</th>
                      <th className="packaging-subheader">717 Weld</th>
                      <th className="packaging-subheader">Weld</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="packaging-label">Galão 3,785 l</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,0</td>
                    </tr>
                    <tr>
                      <td className="packaging-label">Lata 946 ml</td>
                      <td className="packaging-value">0,1</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,1</td>
                    </tr>
                    <tr>
                      <td className="packaging-label">Lata 473 ml</td>
                      <td className="packaging-value">0,3</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,1</td>
                    </tr>
                    <tr>
                      <td className="packaging-label">Lata 237 ml</td>
                      <td className="packaging-value">0,5</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,3</td>
                    </tr>
                    <tr>
                      <td className="packaging-label">Lata 118 ml</td>
                      <td className="packaging-value">1,0</td>
                      <td className="packaging-value">0,0</td>
                      <td className="packaging-value">0,5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="safety-margin">
                <strong>Margem segurança:</strong> 1,20
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
