import "./EspacamentoSuportes.css";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";

export default function EspacamentoSuportes() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/service");
  };

  // Dados da tabela de espaçamento de suportes
  const tableData = [
    {
      diameter: '½"',
      temp20: 110,
      temp30: 105,
      temp40: 100,
      temp50: 90,
      temp60: 70,
      temp70: 65,
      temp80: 60,
    },
    {
      diameter: '¾"',
      temp20: 120,
      temp30: 115,
      temp40: 105,
      temp50: 95,
      temp60: 75,
      temp70: 70,
      temp80: 60,
    },
    {
      diameter: '1"',
      temp20: 135,
      temp30: 130,
      temp40: 125,
      temp50: 110,
      temp60: 90,
      temp70: 70,
      temp80: 60,
    },
    {
      diameter: '1.1/4"',
      temp20: 145,
      temp30: 140,
      temp40: 135,
      temp50: 125,
      temp60: 100,
      temp70: 90,
      temp80: 75,
    },
    {
      diameter: '1.1/2"',
      temp20: 160,
      temp30: 155,
      temp40: 150,
      temp50: 140,
      temp60: 115,
      temp70: 95,
      temp80: 75,
    },
    {
      diameter: '2"',
      temp20: 180,
      temp30: 175,
      temp40: 170,
      temp50: 155,
      temp60: 130,
      temp70: 105,
      temp80: 80,
    },
    {
      diameter: '2.1/2"',
      temp20: 200,
      temp30: 190,
      temp40: 185,
      temp50: 170,
      temp60: 145,
      temp70: 115,
      temp80: 80,
    },
    {
      diameter: '3"',
      temp20: 220,
      temp30: 210,
      temp40: 200,
      temp50: 185,
      temp60: 155,
      temp70: 125,
      temp80: 95,
    },
    {
      diameter: '4"',
      temp20: 240,
      temp30: 230,
      temp40: 225,
      temp50: 205,
      temp60: 175,
      temp70: 145,
      temp80: 105,
    },
    {
      diameter: '6"',
      temp20: 290,
      temp30: 280,
      temp40: 270,
      temp50: 250,
      temp60: 210,
      temp70: 170,
      temp80: 130,
    },
    {
      diameter: '8"',
      temp20: 345,
      temp30: 330,
      temp40: 320,
      temp50: 295,
      temp60: 250,
      temp70: 205,
      temp80: 165,
    },
    {
      diameter: '10"',
      temp20: 375,
      temp30: 370,
      temp40: 355,
      temp50: 330,
      temp60: 275,
      temp70: 225,
      temp80: 175,
    },
    {
      diameter: '12"',
      temp20: 410,
      temp30: 390,
      temp40: 375,
      temp50: 350,
      temp60: 295,
      temp70: 240,
      temp80: 190,
    },
    {
      diameter: '14"',
      temp20: 430,
      temp30: 420,
      temp40: 400,
      temp50: 370,
      temp60: 310,
      temp70: 285,
      temp80: 255,
    },
  ];

  return (
    <div className="espacamento-suportes-container">
      <div className="espacamento-suportes-header">
        <Button
          variant="secondary"
          className="back-button"
          onClick={handleBack}
        >
          Voltar
        </Button>
        <div className="espacamento-suportes-title-section">
          <h1 className="espacamento-suportes-title">
            ESPAÇAMENTO DE SUPORTES
          </h1>
          <span className="espacamento-suportes-subtitle">
            Tabela Técnica de Referência
          </span>
        </div>
        <div className="espacamento-suportes-header-spacer"></div>
      </div>

      <div className="espacamento-suportes-content">
        <div className="intro-section">
          <h2 className="intro-title">IMPORTÂNCIA DO ESPAÇAMENTO CORRETO</h2>
          <div className="intro-content">
            <p>
              Para garantir a durabilidade e segurança de sistemas de tubulação,
              é essencial respeitar os espaçamentos adequados entre os suportes.
            </p>
            <p>
              <strong>Benefícios:</strong>
            </p>
            <ul>
              <li>Prevenção de deformações e tensões excessivas</li>
              <li>Redução do risco de vazamentos e falhas</li>
              <li>Aumento da vida útil da tubulação</li>
              <li>Segurança operacional</li>
            </ul>
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">
            TABELA DE ESPAÇAMENTO DE SUPORTES (cm)
          </h2>
          <div className="table-container">
            <table className="espacamento-table">
              <thead>
                <tr>
                  <th className="diameter-header">Ø</th>
                  <th>20°C</th>
                  <th>30°C</th>
                  <th>40°C</th>
                  <th>50°C</th>
                  <th>60°C</th>
                  <th>70°C</th>
                  <th>80°C</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                  >
                    <td className="diameter-cell">{row.diameter}</td>
                    <td>{row.temp20}</td>
                    <td>{row.temp30}</td>
                    <td>{row.temp40}</td>
                    <td>{row.temp50}</td>
                    <td>{row.temp60}</td>
                    <td>{row.temp70}</td>
                    <td>{row.temp80}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-legend">
            <p>
              <strong>Legenda:</strong> Ø = Diâmetro nominal | Valores em cm |
              Temperaturas em °C
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <span className="footer-company-subtitle">HIDRODEMA</span>
      </div>
    </div>
  );
}
