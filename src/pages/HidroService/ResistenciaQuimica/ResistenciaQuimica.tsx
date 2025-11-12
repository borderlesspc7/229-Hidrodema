import "./ResistenciaQuimica.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import {
  FaFlask,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaTable,
  FaChartLine,
  FaExchangeAlt,
  FaThermometerHalf,
  FaTachometerAlt,
  FaDollarSign,
  FaTimes,
} from "react-icons/fa";

export default function ResistenciaQuimica() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedResistance, setSelectedResistance] = useState("all");

  // Estados do Comparador
  const [showComparator, setShowComparator] = useState(false);
  const [selectedSubstances, setSelectedSubstances] = useState<string[]>([]);

  const handleBack = () => {
    navigate("/service");
  };

  // Dados técnicos dos materiais
  const materialData = {
    "PVC-U": {
      name: "PVC-U (Cloreto de Polivinila Não Plastificado)",
      temperatureRange: "0°C a 60°C",
      maxPressure: "até 1,0 MPa (10 bar)",
      costIndex: "Médio",
      advantages: [
        "Excelente resistência a ácidos e bases",
        "Baixo custo comparado ao CPVC",
        "Fácil instalação e manutenção",
        "Boa resistência à corrosão",
      ],
      limitations: [
        "Temperatura máxima limitada (60°C)",
        "Sensível a alguns solventes orgânicos",
        "Não recomendado para hidrocarbonetos aromáticos",
      ],
    },
    CPVC: {
      name: "CPVC (Cloreto de Polivinila Clorado)",
      temperatureRange: "0°C a 95°C",
      maxPressure: "até 1,5 MPa (15 bar)",
      costIndex: "Alto",
      advantages: [
        "Suporta temperaturas elevadas (até 95°C)",
        "Excelente resistência química ampla",
        "Maior resistência a oxidantes",
        "Ideal para água quente e aplicações industriais",
      ],
      limitations: [
        "Custo mais elevado que PVC-U",
        "Requer cuidados especiais na instalação",
        "Sensível a hidrocarbonetos clorados",
      ],
    },
  };

  // Dados de resistência química baseados nos catálogos Amanco
  const chemicalResistanceData = [
    // PVC-U - Páginas 28 a 32 / CPVC - Páginas 45 a 49

    // ÁCIDOS
    {
      substance: "Ácido Acético (CH3COOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Acético (CH3COOH) 50%",
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
      substance: "Ácido Acético Glacial",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Bórico (H3BO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Carbônico (H2CO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Cítrico (C6H8O7) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Cítrico (C6H8O7) Saturado",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Clorídrico (HCl) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Clorídrico (HCl) 20%",
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
      substance: "Ácido Crômico (H2CrO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Crômico (H2CrO4) 50%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Fluorídrico (HF) 20%",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Ácido Fluorídrico (HF) 40%",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Ácido Fosfórico (H3PO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Fosfórico (H3PO4) 30%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Fosfórico (H3PO4) 85%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Fórmico (HCOOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Fórmico (HCOOH) 50%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Láctico (C3H6O3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Láctico (C3H6O3) 50%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Nítrico (HNO3) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Nítrico (HNO3) 30%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Nítrico (HNO3) 50%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Ácido Nítrico (HNO3) 65%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Ácido Oxálico (C2H2O4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Oxálico (C2H2O4) Saturado",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Sulfúrico (H2SO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Sulfúrico (H2SO4) 30%",
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
      substance: "Ácido Sulfúrico (H2SO4) 75%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Ácido Sulfúrico (H2SO4) 93%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Ácido Sulfuroso (H2SO3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Tânico (C76H52O46)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ácido Tartárico (C4H6O6)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },

    // ÁLCALIS / BASES
    {
      substance: "Hidróxido de Amônio (NH4OH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidróxido de Amônio (NH4OH) 30%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Hidróxido de Cálcio (Ca(OH)2) Saturado",
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
      substance: "Hidróxido de Potássio (KOH) 50%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidróxido de Sódio (NaOH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidróxido de Sódio (NaOH) 30%",
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

    // SAIS E SOLUÇÕES SALINAS
    {
      substance: "Alúmen (KAl(SO4)2)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Bicarbonato de Sódio (NaHCO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Bissulfito de Sódio (NaHSO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Brometo de Potássio (KBr)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Carbonato de Cálcio (CaCO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Carbonato de Sódio (Na2CO3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Carbonato de Sódio (Na2CO3) 30%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Alumínio (AlCl3) 20%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Amônio (NH4Cl) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Cálcio (CaCl2) 30%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Cálcio (CaCl2) Saturado",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Ferro (FeCl3) 30%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Magnésio (MgCl2)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Potássio (KCl) Saturado",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Sódio (NaCl) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Sódio (NaCl) Saturado",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloreto de Zinco (ZnCl2) 80%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Fosfato Trissódico (Na3PO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Nitrato de Prata (AgNO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Alumínio (Al2(SO4)3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Cobre (CuSO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Magnésio (MgSO4)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Níquel (NiSO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Sódio (Na2SO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfato de Zinco (ZnSO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Tiossulfato de Sódio (Na2S2O3) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },

    // ÁGUA E SOLUÇÕES AQUOSAS
    {
      substance: "Água Deionizada",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Água Destilada",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
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
      substance: "Água Régia (HCl + HNO3)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },

    // GASES
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
    {
      substance: "Amônia Anidra (NH3)",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Bromo (Br2) Líquido",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Cloro (Cl2) Gasoso Seco",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Cloro (Cl2) Gasoso Úmido",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Cloro (Cl2) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Cloro (Cl2) Líquido",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Dióxido de Carbono (CO2)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Dióxido de Enxofre (SO2) Gasoso",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Ozônio (O3)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // OXIDANTES E ALVEJANTES
    {
      substance: "Hipoclorito de Cálcio (Ca(ClO)2) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Hipoclorito de Sódio (NaClO) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Hipoclorito de Sódio (NaClO) 20%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Peróxido de Hidrogênio (H2O2) 3%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Peróxido de Hidrogênio (H2O2) 10%",
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
      substance: "Permanganato de Potássio (KMnO4) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },

    // ÁLCOOIS
    {
      substance: "Álcool Amílico (C5H11OH)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Álcool Butílico (C4H9OH)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Álcool Isopropílico (C3H7OH) 100%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Etanol (C2H5OH) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Etanol (C2H5OH) 50%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Etanol (C2H5OH) 100%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Etilenoglicol (C2H6O2)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Glicerina (C3H8O3) 100%",
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

    // CETONAS
    {
      substance: "Acetona (C3H6O) 10%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Acetona (C3H6O) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Metiletilcetona (MEK) (C4H8O)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Metilisobutilcetona (MIBK) (C6H12O)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // HIDROCARBONETOS ALIFÁTICOS
    {
      substance: "Gasolina",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Hexano (C6H14)",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Nafta",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Óleo Diesel",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Óleo Lubrificante",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Óleo Mineral",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Querosene",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },

    // HIDROCARBONETOS AROMÁTICOS
    {
      substance: "Benzeno (C6H6) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Estireno (C8H8)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Tolueno (C7H8) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Xileno (C8H10)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // HIDROCARBONETOS CLORADOS
    {
      substance: "Clorofórmio (CHCl3)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Diclorometano (CH2Cl2)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Tetracloreto de Carbono (CCl4)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },
    {
      substance: "Tricloroetileno (C2HCl3)",
      pvcU: "Limitado",
      cpvc: "Limitado",
      resistance: "limited",
    },

    // ÉSTERES
    {
      substance: "Acetato de Amila (C7H14O2)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Acetato de Butila (C6H12O2)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Acetato de Etila (C4H8O2)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // ÉTERES
    {
      substance: "Éter Etílico (C4H10O)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // FENÓIS
    {
      substance: "Fenol (C6H5OH) 5%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Fenol (C6H5OH) 100%",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },

    // ALIMENTOS E BEBIDAS
    {
      substance: "Cerveja",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Leite",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Óleo Vegetal",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Suco de Frutas",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Vinho",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },

    // OUTROS COMPOSTOS
    {
      substance: "Anilina (C6H7N)",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Detergentes Comerciais",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Formol (Formaldeído) 40%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Formaldeído (HCHO) 37%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Gelatina",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Glicose (C6H12O6)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Hidrazina (N2H4) 35%",
      pvcU: "Bom",
      cpvc: "Excelente",
      resistance: "good",
    },
    {
      substance: "Nitrobenzeno (C6H5NO2)",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Sabão Líquido",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Silicato de Sódio (Na2SiO3)",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Sulfeto de Hidrogênio (H2S) Gasoso",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Terebintina",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
    },
    {
      substance: "Uréia (CH4N2O) 10%",
      pvcU: "Excelente",
      cpvc: "Excelente",
      resistance: "excellent",
    },
    {
      substance: "Verniz",
      pvcU: "Limitado",
      cpvc: "Bom",
      resistance: "limited",
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

  // Função para adicionar/remover substâncias do comparador
  const toggleSubstanceSelection = (substance: string) => {
    if (selectedSubstances.includes(substance)) {
      setSelectedSubstances(selectedSubstances.filter((s) => s !== substance));
    } else {
      if (selectedSubstances.length < 5) {
        setSelectedSubstances([...selectedSubstances, substance]);
      }
    }
  };

  // Função para limpar seleção do comparador
  const clearComparator = () => {
    setSelectedSubstances([]);
  };

  // Função para obter dados das substâncias selecionadas
  const getComparisonData = () => {
    return chemicalResistanceData.filter((item) =>
      selectedSubstances.includes(item.substance)
    );
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
      <Breadcrumb />
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
          <div className="filters-header">
            <h3 className="filters-title">
              <FaFilter className="filter-icon" />
              Filtros de Consulta
            </h3>
            <button
              className="comparator-button"
              onClick={() => setShowComparator(!showComparator)}
            >
              <FaExchangeAlt className="comparator-icon" />
              {showComparator ? "Fechar Comparador" : "Comparar Materiais"}
            </button>
          </div>
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
                  <tr
                    key={index}
                    className={`data-row ${
                      showComparator ? "clickable-row" : ""
                    } ${
                      selectedSubstances.includes(item.substance)
                        ? "selected-row"
                        : ""
                    }`}
                    onClick={() =>
                      showComparator && toggleSubstanceSelection(item.substance)
                    }
                    title={
                      showComparator
                        ? selectedSubstances.includes(item.substance)
                          ? "Clique para remover do comparador"
                          : selectedSubstances.length >= 5
                          ? "Máximo de 5 substâncias selecionadas"
                          : "Clique para adicionar ao comparador"
                        : ""
                    }
                  >
                    <td className="substance-cell">
                      {showComparator && (
                        <input
                          type="checkbox"
                          checked={selectedSubstances.includes(item.substance)}
                          onChange={() => {}}
                          className="substance-checkbox"
                        />
                      )}
                      {item.substance}
                    </td>
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

        {/* COMPARADOR DE MATERIAIS */}
        {showComparator && (
          <div className="comparator-section">
            <div className="comparator-header">
              <h2 className="comparator-title">
                <FaExchangeAlt className="title-icon" />
                COMPARADOR DE MATERIAIS
              </h2>
              <p className="comparator-subtitle">
                Selecione até 5 substâncias da tabela acima para comparar PVC-U
                vs CPVC
              </p>
            </div>

            {/* Informações Técnicas Gerais dos Materiais */}
            <div className="material-specs-grid">
              <div className="material-spec-card pvc-u-card">
                <h3 className="material-name">{materialData["PVC-U"].name}</h3>
                <div className="spec-items">
                  <div className="spec-item">
                    <FaThermometerHalf className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Temperatura</span>
                      <span className="spec-value">
                        {materialData["PVC-U"].temperatureRange}
                      </span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <FaTachometerAlt className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Pressão Máxima</span>
                      <span className="spec-value">
                        {materialData["PVC-U"].maxPressure}
                      </span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <FaDollarSign className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Custo Relativo</span>
                      <span className="spec-value">
                        {materialData["PVC-U"].costIndex}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="advantages-section">
                  <h4>Vantagens</h4>
                  <ul>
                    {materialData["PVC-U"].advantages.map((adv, idx) => (
                      <li key={idx}>
                        <FaCheckCircle className="list-icon" /> {adv}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="limitations-section">
                  <h4>Limitações</h4>
                  <ul>
                    {materialData["PVC-U"].limitations.map((lim, idx) => (
                      <li key={idx}>
                        <FaExclamationTriangle className="list-icon" /> {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="material-spec-card cpvc-card">
                <h3 className="material-name">{materialData["CPVC"].name}</h3>
                <div className="spec-items">
                  <div className="spec-item">
                    <FaThermometerHalf className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Temperatura</span>
                      <span className="spec-value">
                        {materialData["CPVC"].temperatureRange}
                      </span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <FaTachometerAlt className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Pressão Máxima</span>
                      <span className="spec-value">
                        {materialData["CPVC"].maxPressure}
                      </span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <FaDollarSign className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Custo Relativo</span>
                      <span className="spec-value">
                        {materialData["CPVC"].costIndex}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="advantages-section">
                  <h4>Vantagens</h4>
                  <ul>
                    {materialData["CPVC"].advantages.map((adv, idx) => (
                      <li key={idx}>
                        <FaCheckCircle className="list-icon" /> {adv}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="limitations-section">
                  <h4>Limitações</h4>
                  <ul>
                    {materialData["CPVC"].limitations.map((lim, idx) => (
                      <li key={idx}>
                        <FaExclamationTriangle className="list-icon" /> {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Seleção de Substâncias */}
            <div className="substance-selection-section">
              <div className="selection-header">
                <h3>
                  Substâncias Selecionadas ({selectedSubstances.length}/5)
                </h3>
                {selectedSubstances.length > 0 && (
                  <button
                    className="clear-selection-btn"
                    onClick={clearComparator}
                  >
                    <FaTimes /> Limpar Seleção
                  </button>
                )}
              </div>

              {selectedSubstances.length === 0 ? (
                <div className="empty-selection">
                  <FaExchangeAlt className="empty-icon" />
                  <p>
                    Clique nas substâncias da tabela acima para adicioná-las ao
                    comparador
                  </p>
                </div>
              ) : (
                <div className="comparison-table-container">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th className="substance-col">Substância</th>
                        <th className="material-col pvc-u-col">PVC-U</th>
                        <th className="material-col cpvc-col">CPVC</th>
                        <th className="winner-col">Recomendação</th>
                        <th className="action-col">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonData().map((item, index) => {
                        const pvcScore =
                          item.pvcU === "Excelente"
                            ? 3
                            : item.pvcU === "Bom"
                            ? 2
                            : 1;
                        const cpvcScore =
                          item.cpvc === "Excelente"
                            ? 3
                            : item.cpvc === "Bom"
                            ? 2
                            : 1;
                        const winner =
                          pvcScore > cpvcScore
                            ? "PVC-U"
                            : cpvcScore > pvcScore
                            ? "CPVC"
                            : "Equivalente";

                        return (
                          <tr key={index} className="comparison-row">
                            <td className="substance-name">{item.substance}</td>
                            <td
                              className={`resistance-value ${
                                winner === "PVC-U" ? "winner-cell" : ""
                              }`}
                            >
                              <span
                                className={`resistance-badge ${getResistanceClass(
                                  item.pvcU.toLowerCase().replace(" ", "")
                                )}`}
                              >
                                {item.pvcU}
                              </span>
                            </td>
                            <td
                              className={`resistance-value ${
                                winner === "CPVC" ? "winner-cell" : ""
                              }`}
                            >
                              <span
                                className={`resistance-badge ${getResistanceClass(
                                  item.cpvc.toLowerCase().replace(" ", "")
                                )}`}
                              >
                                {item.cpvc}
                              </span>
                            </td>
                            <td className="recommendation-cell">
                              {winner === "Equivalente" ? (
                                <span className="equivalent-badge">
                                  Ambos Adequados
                                </span>
                              ) : (
                                <span className="winner-badge">
                                  <FaCheckCircle /> {winner}
                                </span>
                              )}
                            </td>
                            <td className="action-cell">
                              <button
                                className="remove-btn"
                                onClick={() =>
                                  toggleSubstanceSelection(item.substance)
                                }
                                title="Remover"
                              >
                                <FaTimes />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resumo da Comparação */}
            {selectedSubstances.length > 0 && (
              <div className="comparison-summary">
                <h3>Resumo da Comparação</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <h4>PVC-U Recomendado</h4>
                    <p className="summary-count">
                      {
                        getComparisonData().filter((item) => {
                          const pvcScore =
                            item.pvcU === "Excelente"
                              ? 3
                              : item.pvcU === "Bom"
                              ? 2
                              : 1;
                          const cpvcScore =
                            item.cpvc === "Excelente"
                              ? 3
                              : item.cpvc === "Bom"
                              ? 2
                              : 1;
                          return pvcScore > cpvcScore;
                        }).length
                      }{" "}
                      substâncias
                    </p>
                  </div>
                  <div className="summary-card">
                    <h4>CPVC Recomendado</h4>
                    <p className="summary-count">
                      {
                        getComparisonData().filter((item) => {
                          const pvcScore =
                            item.pvcU === "Excelente"
                              ? 3
                              : item.pvcU === "Bom"
                              ? 2
                              : 1;
                          const cpvcScore =
                            item.cpvc === "Excelente"
                              ? 3
                              : item.cpvc === "Bom"
                              ? 2
                              : 1;
                          return cpvcScore > pvcScore;
                        }).length
                      }{" "}
                      substâncias
                    </p>
                  </div>
                  <div className="summary-card">
                    <h4>Equivalentes</h4>
                    <p className="summary-count">
                      {
                        getComparisonData().filter((item) => {
                          const pvcScore =
                            item.pvcU === "Excelente"
                              ? 3
                              : item.pvcU === "Bom"
                              ? 2
                              : 1;
                          const cpvcScore =
                            item.cpvc === "Excelente"
                              ? 3
                              : item.cpvc === "Bom"
                              ? 2
                              : 1;
                          return pvcScore === cpvcScore;
                        }).length
                      }{" "}
                      substâncias
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
