import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
import LoadingScreen from "../../../components/ui/LoadingScreen/LoadingScreen";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import {
  FiFileText,
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiUpload,
  FiEdit3,
  FiMessageCircle,
  FiFile,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiSettings,
  FiArrowLeft,
} from "react-icons/fi";
import "./SolicitacaoServicos.css";
import {
  createServiceRequest,
  getAllServiceRequests,
  updateServiceRequest,
  deleteServiceRequest,
  addServiceComment,
  getServiceCommentsByRequestId,
  deleteServiceComment,
  generateServiceRequestId,
  type ServiceComment,
} from "../../../services/servicosService";
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateCNPJ,
  validateDate,
  sanitizeForDatabase,
} from "../../../utils/validation";

interface FormData {
  [key: string]: string | string[];
}

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  question: string;
  options?: string[];
  required?: boolean;
  section?: string;
}

type ViewMode = "menu" | "new" | "history" | "edit" | "comments";

// Interface local para display
interface ServiceRequest {
  id: string;
  requestId?: string;
  title: string;
  status: "draft" | "submitted" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  comments: ServiceComment[];
}

export default function SolicitacaoServicos() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Perguntas do formulário de solicitação de serviços
  const questions: Question[] = [
    // Seção 1: Identificação e Dados Iniciais
    {
      id: "q1",
      type: "radio",
      question: "1 - Você Pertence a qual das Categorias abaixo:",
      section: "Identificação e Dados Iniciais",
      required: true,
      options: [
        "Engenharia - Hidrodema",
        "Executivo de Vendas - Hidrodema",
        "Cliente",
        "Instalador",
        "Instalador Autorizado Hidrodema",
      ],
    },
    {
      id: "q2",
      type: "text",
      question: "2 - Data da Solicitação",
      section: "Identificação e Dados Iniciais",
      required: true,
    },
    // Seção 2: Dados do Solicitante
    {
      id: "q3",
      type: "text",
      question: "3 - Informe seu Nome - Solicitante",
      section: "Dados do Solicitante",
      required: true,
    },
    {
      id: "q4",
      type: "text",
      question: "4 - E-mail - Solicitante",
      section: "Dados do Solicitante",
      required: true,
    },
    {
      id: "q5",
      type: "text",
      question: "5 - Celular - Solicitante",
      section: "Dados do Solicitante",
      required: true,
    },
    // Seção 3: Responsável pelo Acompanhamento Interno
    {
      id: "q6",
      type: "text",
      question: "6 - Informe seu Nome - Internamente",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
    },
    {
      id: "q7",
      type: "text",
      question: "7 - E-mail - Internamente",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
    },
    {
      id: "q8",
      type: "radio",
      question: "8 - Segmento do Cliente",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: ["Industrial", "HVAC"],
    },
    {
      id: "q9",
      type: "radio",
      question: "9 - Possui Pedido ou Proposta em Andamento?",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: ["Sim", "Não"],
    },
    {
      id: "q10",
      type: "text",
      question: "10 - Informe o Pedido ou Proposta em Andamento",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
    },
    {
      id: "q11",
      type: "radio",
      question: "11 - Informe a sua Regional",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: [
        "Carlos Moraes - VEND I & II",
        "Rogério Foltran - HUNTERS",
        "Davi Salgado - HVAC",
        "Nic Romano - Expansão & Novos Negócios",
      ],
    },

    // ADD options
    {
      id: "q12",
      type: "select",
      question: "12 - VEND I & II",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: [
        "002620 - ALESSANDRO APARECIDO DE RESENDE",
        "035184 - ALEXANDRE DI RIENZO GANDARA",
        "002630 - CHRISTIAN NONATO MATOS",
        "002617 - CLAUDINEI RODRIGUES MARQUES",
        "035174 - CZ",
        "035163 - ELTON DA COSTA GONCALO",
        "035179 - GABRIEL LUIS OLIVEIRA ALVES",
        "035178 - HERBERT LOPES",
        "035139 - LEONARDO AMARAL MONARI",
        "035180 - MARIO PESCUMA FILHO",
        "035183 - GUILHERME ALVES NOGUEIRA",
        "035168 - JOAO VITOR DA SILVA PEREIRA",
      ],
    },
    {
      id: "q13",
      type: "select",
      question: "13 - HUNTERS",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: [
        "035202 - ANA CAROLINE",
        "035192 - ANA JULYA",
        "035104 - LUCAS NASCIMENTO GONCALVES",
        "035185 - GUILHERME CAMPOS DO CARMO",
        "035201 - JULIA CINTRA",
        "035195 - JULIA SANTANA",
        "035189 - MARIA ROBERTA",
        "035203 - MILENA RIBEIRO",
        "035191 - PAOLA LINO",
        "035190 - PEDRO HENRIQUE PEREIRA SOUZA",
        "020719 - ROGERIO PINHEIRO FOLTRAN",
      ],
    },
    {
      id: "q14",
      type: "select",
      question: "14 - HVAC",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: [
        "99999G - CEOS CONSULTORIA, ASSESSORIA E REPRESENT",
        "000356 - DAVI SALGADO DE A. MARTINS",
        "035140 - DDK REPRESENTACOES LTDA",
        "99999X - EMB REPRESENTACOES",
        "A00000 - ENGINE - COMERCIO E SERVICOS EIRELI - EP",
        "99999E - FAMAC REPRESENTACOES LTDA",
        "035194 - GERSON SOUZA",
        "99999Y - ISOLEX NE - PROJETOS, REPRESENTACOES",
        "035144 - JOSE ROMERO JUNIOR",
        "035141 - MARCO SOUTO",
        "99999B - MAURICIO COSTA",
        "99999D - MULT-ELETRIC REPRESENTACOES",
        "A00001 - ONIX SP REPRESENTACOES LTDA",
        "035175 - RC VEDACOES LTDA / RAFAEL",
        "99999F - SAFETY CONTROL REPRESENTACOES LTDA",
        "99999J - SAFETY/ZOEGA",
        "99999N - SIMEY",
        "99999O - TITO REPRESENTACOES LTDA",
        "99999Q - TITO/ZOEGA",
        "99999W - TROMPOWSKY REPRESENTACOES COMERCIAIS LTD",
        "035176 - VEREDA REPRESENTACOES COMERCIAIS LTDA",
      ],
    },
    {
      id: "q15",
      type: "select",
      question: "15 - Expansão & Novos Negócios",
      section: "Responsável pelo Acompanhamento Interno",
      required: true,
      options: [
        "035197 - DANILO TRIPOLI",
        "035199 - EDSON RANGEL",
        "035200 - MARCO TULIO",
        "035193 - NILZA ROMANO",
        "035198 - RAFAEL SOUZA DA COSTA",
      ],
    },
    // Seção 4: Cadastrais dados do solicitante de serviço
    {
      id: "q16",
      type: "text",
      question: "16 - Empresa",
      section: "Cadastrais dados do solicitante de serviço",
      required: true,
    },
    {
      id: "q17",
      type: "text",
      question: "17 - Código Interno do Cliente",
      section: "Cadastrais dados do solicitante de serviço",
      required: false,
    },
    {
      id: "q18",
      type: "text",
      question: "18 - CNPJ",
      section: "Cadastrais dados do solicitante de serviço",
      required: true,
    },
    // Seção 5: Serviços
    {
      id: "q19",
      type: "radio",
      question: "19 - Qual é o grau de urgência da Solicitação",
      section: "Serviços",
      required: true,
      options: [
        "0 - Estável",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10 - Extremamente Urgente",
      ],
    },
    {
      id: "q20",
      type: "select",
      question: "20 - Selecione qual serviço você deseja solicitar",
      section: "Serviços",
      required: true,
      options: [
        "Visita Técnica",
        "Treinamento de Solda",
        "Acompanhamento de Obras",
        "Conversão de DWG",
        "Locação de Ferramenta",
        "Fabricação de Produtos Engenheirados",
        "Instalações e Montagens",
        "Pintura de Tubulações",
      ],
    },
    // Seção 6: Visita Técnica
    {
      id: "q21",
      type: "select",
      question: "21 - Qual será o tipo de visita?",
      section: "Visita Técnica",
      required: true,
      options: ["Selecionar sua resposta"],
    },
    {
      id: "q22",
      type: "textarea",
      question: "22 - Detalhe o motivo da Visita",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q23",
      type: "text",
      question: "23 - Endereço",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q24",
      type: "text",
      question: "24 - Nome Contato",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q25",
      type: "text",
      question: "25 - Telefone Contato",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q26",
      type: "text",
      question: "26 - E-mail Contato",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q27",
      type: "text",
      question: "27 - Data Sugerida de Visita",
      section: "Visita Técnica",
      required: true,
    },
    {
      id: "q28",
      type: "radio",
      question: "28 - Período Sugerido de Visita",
      section: "Visita Técnica",
      required: true,
      options: [
        "Manhã | 09:00HS - 12:00HS",
        "Tarde | 13:00HS - 16:00HS",
        "Qualquer período",
      ],
    },
    {
      id: "q29",
      type: "checkbox",
      question: "29 - Qual a aplicação do Treinamento",
      section: "Treinamento de Solda",
      required: true,
      options: ["Solda Química de PVC-U SCH80 | CPVC SCH80", "PPR"],
    },
    {
      id: "q30",
      type: "radio",
      question: "30 - Modalidade do Treinamento",
      section: "Treinamento de Solda",
      required: true,
      options: [
        "Presencial - Cliente",
        "Presencial - Amanco Academy",
        "Online",
      ],
    },
    {
      id: "q31",
      type: "text",
      question: "31 - Endereço",
      section: "Treinamento de Solda",
      required: true,
    },
    {
      id: "q32",
      type: "text",
      question: "32 - Nome Contato",
      section: "Treinamento de Solda",
      required: true,
    },
    {
      id: "q33",
      type: "text",
      question: "33 - Telefone Contato",
      section: "Treinamento de Solda",
      required: true,
    },
    {
      id: "q34",
      type: "text",
      question: "34 - E-mail Contato",
      section: "Treinamento de Solda",
      required: true,
    },
    {
      id: "q35",
      type: "text",
      question: "35 - Data Sugerida do Treinamento",
      section: "Treinamento de Solda",
      required: true,
    },
    {
      id: "q36",
      type: "radio",
      question: "36 - Período Sugerido do Treinamento",
      section: "Treinamento de Solda",
      required: true,
      options: [
        "Manhã | 09:00HS - 12:00HS",
        "Tarde | 13:00HS - 16:00HS",
        "Qualquer período",
      ],
    },
    {
      id: "q37",
      type: "radio",
      question: "37 - Qual estágio da Obra",
      section: "Acompanhamento de Obras",
      required: true,
      options: ["Projeto", "Execução", "Finalização"],
    },
    {
      id: "q38",
      type: "text",
      question: "38 - Previsão de Inicio da Obra",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q39",
      type: "text",
      question: "39 - Previsão de Término da Obra",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q40",
      type: "checkbox",
      question: "40 - Informe a linha de Produtos que está sendo instalada",
      section: "Acompanhamento de Obras",
      required: true,
      options: [
        "CPVC SCH80",
        "PVC-U SCH80",
        "PPR AZ",
        "PPR VD",
        "PVDF",
        "DUPLA CONTENÇÃO",
        "Outra",
      ],
    },
    {
      id: "q41",
      type: "text",
      question: "41 - Endereço",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q42",
      type: "text",
      question: "42 - Nome Contato",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q43",
      type: "text",
      question: "43 - Telefone Contato",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q44",
      type: "text",
      question: "44 - E-mail Contato",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q45",
      type: "text",
      question:
        "45 - Informe o Período desejado em dias para Acompanhamento de Obra",
      section: "Acompanhamento de Obras",
      required: true,
    },
    {
      id: "q46",
      type: "text",
      question: "46 - Data Sugerida para realização do acompanhamento de obra",
      section: "Acompanhamento de Obras",
      required: false,
    },
    {
      id: "q47",
      type: "radio",
      question: "47 - Qual o tipo de instalação",
      section: "Instalação e Montagem",
      required: true,
      options: ["Retrofit", "Projeto Novo"],
    },
    {
      id: "q48",
      type: "checkbox",
      question: "48 - Características do Local de Instalação da Tubulação",
      section: "Instalação e Montagem",
      required: true,
      options: [
        "Aéreo",
        "Nível do Solo (Até 2m de altura)",
        "Enterrado",
        "Outra",
      ],
    },
    {
      id: "q49",
      type: "checkbox",
      question: "49 - Informe a linha de Produtos que está sendo instalada",
      section: "Instalação e Montagem",
      required: true,
      options: [
        "CPVC SCH80",
        "PVC-U SCH80",
        "PPR AZ",
        "PPR VD",
        "PVDF",
        "DUPLA CONTENÇÃO",
        "Outra",
      ],
    },
    {
      id: "q50",
      type: "text",
      question: "50 - Previsão de Término da Obra",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q51",
      type: "text",
      question: "51 - Endereço",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q52",
      type: "text",
      question: "52 - Nome Contato",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q53",
      type: "text",
      question: "53 - Telefone Contato",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q54",
      type: "text",
      question: "54 - E-mail Contato",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q55",
      type: "radio",
      question: "55 - É necessário Integração",
      section: "Instalação e Montagem",
      required: true,
      options: ["Sim", "Não"],
    },
    {
      id: "q56",
      type: "text",
      question: "56 - Informe os documentos necessários para Integração",
      section: "Instalação e Montagem",
      required: true,
    },
    {
      id: "q57",
      type: "text",
      question: "57 - Nome Contato",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q58",
      type: "text",
      question: "58 - Telefone Contato",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q59",
      type: "text",
      question: "59 - E-mail Contato",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q60",
      type: "text",
      question: "60 - Link DWG",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q61",
      type: "text",
      question: "61 - Informe a aplicação do sistema",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q62",
      type: "textarea",
      question: "62 - Informe Detalhes do Projeto",
      section: "Conversão de DWG",
      required: true,
    },
    {
      id: "q63",
      type: "checkbox",
      question: "63 - Selecione as ferramentas desejadas",
      section: "Locação de Ferramentas",
      required: true,
      options: [
        "Beiseladora elétrica",
        "Torno coplador",
        "Cavalete",
        "Tifor",
        'Corta tubos Manual - 1/4" a 2"',
        'Corta tubos Manual - 2.1/2" a 5"',
        'Corta tubos Manual - 6" a 8"',
        'Beiseladora Cone - 3/4" a 2.1/2"',
        'Corta Tubos manual - 4" a 12"',
        "Termofusora 75MM - 110MM",
        "Termofusora 20MM - 63MM",
        'Corta Tubos elétrico - 4" - 16"',
      ],
    },
    {
      id: "q64",
      type: "text",
      question: "64 - Informe o Período desejado de Locação - Início",
      section: "Locação de Ferramentas",
      required: true,
    },
    {
      id: "q65",
      type: "text",
      question: "65 - Informe o Período desejado de Locação - Término",
      section: "Locação de Ferramentas",
      required: true,
    },
    {
      id: "q66",
      type: "text",
      question: "66 - Local da Obra",
      section: "Locação de Ferramentas",
      required: true,
    },
    {
      id: "q67",
      type: "text",
      question: "67 - Dados do Cliente - Responsável pela Locação",
      section: "Locação de Ferramentas",
      required: true,
    },
    {
      id: "q68",
      type: "text",
      question: "68 - Dados do Cliente - Contato e E-mail",
      section: "Locação de Ferramentas",
      required: true,
    },
    {
      id: "q69",
      type: "text",
      question: "69 - Anexe os isométricos correspondentes ao Projeto",
      section: "Fabricação de Produtos Engenheirados",
      required: true,
    },
    {
      id: "q70",
      type: "text",
      question: "70 - Informe a aplicação do sistema",
      section: "Fabricação de Produtos Engenheirados",
      required: true,
    },
    {
      id: "q71",
      type: "textarea",
      question: "71 - Informe Detalhes do Projeto",
      section: "Fabricação de Produtos Engenheirados",
      required: true,
    },
    {
      id: "q72",
      type: "radio",
      question: "72 - Informe a especificação da Cor da Tinta",
      section: "Pintura de Tubos",
      required: true,
      options: [
        "Alaranjado-segurança (Código: C244 Ácido)",
        "Verde-emblema (Código: N541)",
        "Lilás (Código: M 32T)",
        "Outra",
      ],
    },
    {
      id: "q73",
      type: "text",
      question: "73 - Informe a Quantidade em Metros e Diâmetro da Tubulação",
      section: "Pintura de Tubos",
      required: true,
    },
    // Mais perguntas serão adicionadas conforme as próximas seções...
  ];

  // Mapeamento de serviços para suas seções correspondentes
  const serviceToSectionMap: { [key: string]: string } = {
    "Visita Técnica": "Visita Técnica",
    "Treinamento de Solda": "Treinamento de Solda",
    "Acompanhamento de Obras": "Acompanhamento de Obras",
    "Instalações e Montagens": "Instalação e Montagem",
    "Conversão de DWG": "Conversão de DWG",
    "Locação de Ferramenta": "Locação de Ferramentas",
    "Fabricação de Produtos Engenheirados":
      "Fabricação de Produtos Engenheirados",
    "Pintura de Tubulações": "Pintura de Tubos",
  };

  // Seções base que sempre aparecem
  const baseSections = [
    "Identificação e Dados Iniciais",
    "Dados do Solicitante",
    "Responsável pelo Acompanhamento Interno",
    "Cadastrais dados do solicitante de serviço",
    "Serviços",
  ];

  // Determinar seções dinâmicas baseadas no serviço selecionado
  const getActiveSections = () => {
    const selectedService = formData.q20 as string;

    if (!selectedService || selectedService === "") {
      return baseSections;
    }

    const serviceSection = serviceToSectionMap[selectedService];
    if (serviceSection) {
      return [...baseSections, serviceSection];
    }

    return baseSections;
  };

  const sections = getActiveSections();

  // Carregar solicitações do Firebase
  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllServiceRequests();

      // Converter para formato local com comentários vazios inicialmente
      const displayRequests: ServiceRequest[] = requests.map((req) => ({
        id: req.id || "",
        requestId: req.requestId,
        title: `${req.category} - ${req.company}`,
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        formData: req.formData,
        comments: [],
      }));

      setServiceRequests(displayRequests);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      alert("Erro ao carregar solicitações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Se mudou a seleção de serviço (q20), resetar para a última seção base
    if (questionId === "q20") {
      setCurrentSection(4); // Índice da seção "Serviços"
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);

      // Validações básicas para rascunho (menos rigorosas)
      const warnings: string[] = [];

      // Validar email se fornecido
      if (formData.q4) {
        const emailValidation = validateEmail(formData.q4 as string, false);
        if (!emailValidation.valid) warnings.push(emailValidation.error!);
      }

      // Validar telefone se fornecido
      if (formData.q5) {
        const phoneValidation = validatePhone(formData.q5 as string, false);
        if (!phoneValidation.valid) warnings.push(phoneValidation.error!);
      }

      // Validar CNPJ se fornecido
      if (formData.q18) {
        const cnpjValidation = validateCNPJ(formData.q18 as string, false);
        if (!cnpjValidation.valid) warnings.push(cnpjValidation.error!);
      }

      // Se houver avisos, mostrar mas continuar
      if (warnings.length > 0) {
        const continuar = confirm(
          `Avisos encontrados:\n\n${warnings.join("\n")}\n\nDeseja continuar mesmo assim?`,
        );
        if (!continuar) {
          setLoading(false);
          return;
        }
      }

      const requestId = generateServiceRequestId();

      await createServiceRequest(
        sanitizeForDatabase({
          requestId,
          category: (formData.q1 as string) || "Não informado",
          requestDate:
            (formData.q2 as string) || new Date().toISOString().split("T")[0],
          requesterName: (formData.q3 as string) || "Não informado",
          requesterEmail: (formData.q4 as string) || "",
          requesterPhone: (formData.q5 as string) || "",
          internalName: (formData.q6 as string) || "",
          internalEmail: (formData.q7 as string) || "",
          clientSegment: (formData.q8 as string) || "",
          hasOrderOrProposal: (formData.q9 as string) || "Não",
          orderOrProposalNumber: (formData.q10 as string)
            ? (formData.q10 as string)
            : undefined,
          regional: (formData.q11 as string) || "",
          salesperson:
            (formData.q12 as string) ||
            (formData.q13 as string) ||
            (formData.q14 as string) ||
            (formData.q15 as string) ||
            "",
          company: (formData.q16 as string) || "Não informado",
          clientCode: (formData.q17 as string)
            ? (formData.q17 as string)
            : undefined,
          cnpj: (formData.q18 as string) || "",
          urgencyLevel: (formData.q19 as string) || "0",
          serviceType: (formData.q20 as string) || "Não especificado",
          serviceDescription: `Serviço: ${
            (formData.q20 as string) || "Não especificado"
          }`,
          status: "draft",
          formData: { ...formData },
        }),
      );

      await loadServiceRequests();
      alert(
        `Rascunho salvo com sucesso!\nID da Solicitação: ${requestId}\n\nGuarde este ID para referência futura.`,
      );
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
      alert("Erro ao salvar rascunho. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validações dos campos obrigatórios
      const errors: string[] = [];

      // Validar categoria (q1)
      const categoryValue = Array.isArray(formData.q1)
        ? formData.q1[0]
        : formData.q1;
      const categoryValidation = validateRequired(categoryValue, "Categoria");
      if (!categoryValidation.valid) errors.push(categoryValidation.error!);

      // Validar data (q2)
      const dateValidation = validateDate(
        formData.q2 as string,
        "Data da solicitação",
        true,
      );
      if (!dateValidation.valid) errors.push(dateValidation.error!);

      // Validar nome do solicitante (q3)
      const nameValue = Array.isArray(formData.q3)
        ? formData.q3[0]
        : formData.q3;
      const nameValidation = validateRequired(nameValue, "Nome do solicitante");
      if (!nameValidation.valid) errors.push(nameValidation.error!);

      // Validar email do solicitante (q4)
      const emailValidation = validateEmail(formData.q4 as string, true);
      if (!emailValidation.valid) errors.push(emailValidation.error!);

      // Validar telefone do solicitante (q5)
      const phoneValidation = validatePhone(formData.q5 as string, true);
      if (!phoneValidation.valid) errors.push(phoneValidation.error!);

      // Validar email interno se fornecido (q7)
      if (formData.q7) {
        const internalEmailValidation = validateEmail(
          formData.q7 as string,
          false,
        );
        if (!internalEmailValidation.valid)
          errors.push(internalEmailValidation.error!);
      }

      // Validar CNPJ se fornecido (q18)
      if (formData.q18) {
        const cnpjValidation = validateCNPJ(formData.q18 as string, false);
        if (!cnpjValidation.valid) errors.push(cnpjValidation.error!);
      }

      // Se houver erros, mostrar e parar
      if (errors.length > 0) {
        alert(`Erros de validação:\n\n${errors.join("\n")}`);
        setLoading(false);
        return;
      }

      const requestId = generateServiceRequestId();

      // Sanitizar dados antes de enviar
      const sanitizedData = sanitizeForDatabase({
        requestId,
        category: (formData.q1 as string) || "Não informado",
        requestDate:
          (formData.q2 as string) || new Date().toISOString().split("T")[0],
        requesterName: (formData.q3 as string) || "Não informado",
        requesterEmail: (formData.q4 as string) || "",
        requesterPhone: (formData.q5 as string) || "",
        internalName: (formData.q6 as string) || "",
        internalEmail: (formData.q7 as string) || "",
        clientSegment: (formData.q8 as string) || "",
        hasOrderOrProposal: (formData.q9 as string) || "Não",
        orderOrProposalNumber: (formData.q10 as string)
          ? (formData.q10 as string)
          : undefined,
        regional: (formData.q11 as string) || "",
        salesperson:
          (formData.q12 as string) ||
          (formData.q13 as string) ||
          (formData.q14 as string) ||
          (formData.q15 as string) ||
          "",
        company: (formData.q16 as string) || "Não informado",
        clientCode: (formData.q17 as string)
          ? (formData.q17 as string)
          : undefined,
        cnpj: (formData.q18 as string) || "",
        urgencyLevel: (formData.q19 as string) || "0",
        serviceType: (formData.q20 as string) || "Não especificado",
        serviceDescription: `Serviço: ${
          (formData.q20 as string) || "Não especificado"
        }`,
        status: "submitted" as const,
        formData: { ...formData },
      });

      await createServiceRequest(
        sanitizedData as Parameters<typeof createServiceRequest>[0],
      );

      await loadServiceRequests();
      alert(
        `Solicitação enviada com sucesso!\nID da Solicitação: ${requestId}\n\nVocê receberá atualizações por e-mail.`,
      );
      setViewMode("menu");
      setFormData({});
      setCurrentSection(0);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request: ServiceRequest) => {
    setEditingRequest(request);
    setFormData(request.formData);
    setViewMode("edit");
  };

  const handleUpdateRequest = async () => {
    if (!editingRequest) return;

    try {
      setLoading(true);
      await updateServiceRequest(editingRequest.id, {
        formData: { ...formData },
      });

      await loadServiceRequests();
      alert("Solicitação atualizada com sucesso!");
      setViewMode("history");
      setEditingRequest(null);
      setFormData({});
      setCurrentSection(0);
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error);
      alert("Erro ao atualizar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta solicitação?")) return;

    try {
      setLoading(true);
      await deleteServiceRequest(requestId);
      await loadServiceRequests();
      alert("Solicitação excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error);
      alert("Erro ao excluir solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (request: ServiceRequest) => {
    // Implementação básica de exportação para PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Solicitação de Serviço - ${request.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .question { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1e40af; }
              .value { margin-left: 10px; }
              .comments { margin-top: 30px; }
              .comment { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>HIDRO SERVICE</h1>
              <h2>Solicitação de Serviço</h2>
              <p>Data: ${new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h3>Dados da Solicitação</h3>
              ${Object.entries(request.formData)
                .map(
                  ([key, value]) => `
                <div class="question">
                  <span class="label">${key}:</span>
                  <span class="value">${
                    Array.isArray(value) ? value.join(", ") : value
                  }</span>
                </div>
              `,
                )
                .join("")}
            </div>
            ${
              request.comments.length > 0
                ? `
              <div class="comments">
                <h3>Comentários</h3>
                ${request.comments
                  .map(
                    (comment) => `
                  <div class="comment">
                    <strong>${comment.author}</strong> - ${new Date(
                      comment.createdAt,
                    ).toLocaleDateString()}
                    <p>${comment.text}</p>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewComments = async (request: ServiceRequest) => {
    try {
      setLoading(true);
      const requestId = request.requestId || request.id;

      // Carregar comentários do Firebase
      const comments = await getServiceCommentsByRequestId(requestId);

      setSelectedRequest({
        ...request,
        comments,
      });
      setViewMode("comments");
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      alert("Erro ao carregar comentários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedRequest || !newComment.trim()) return;

    try {
      setLoading(true);
      const requestId = selectedRequest.requestId || selectedRequest.id;

      await addServiceComment({
        requestId,
        text: newComment.trim(),
        author: "Usuário", // TODO: Pegar do contexto de autenticação
      });

      // Recarregar comentários
      const comments = await getServiceCommentsByRequestId(requestId);
      setSelectedRequest({
        ...selectedRequest,
        comments,
      });

      setNewComment("");
      alert("Comentário adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Erro ao adicionar comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      await deleteServiceComment(commentId);

      // Recarregar comentários
      const requestId = selectedRequest.requestId || selectedRequest.id;
      const comments = await getServiceCommentsByRequestId(requestId);
      setSelectedRequest({
        ...selectedRequest,
        comments,
      });

      alert("Comentário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      alert("Erro ao excluir comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigate("/acesso-exclusivo");
    } else if (viewMode === "comments") {
      setViewMode("history");
      setSelectedRequest(null);
    } else {
      setViewMode("menu");
      setFormData({});
      setCurrentSection(0);
      setEditingRequest(null);
      setSelectedRequest(null);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || "";

    switch (question.type) {
      case "text": {
        const isDateField = question.question.toLowerCase().includes("data");
        const isEmailField = question.question.toLowerCase().includes("e-mail");
        const isPhoneField =
          question.question.toLowerCase().includes("celular") ||
          question.question.toLowerCase().includes("telefone");
        const isCNPJField = question.question.toLowerCase().includes("cnpj");
        const isCPFField = question.question.toLowerCase().includes("cpf");

        let inputType = "text";
        let placeholder = "Digite sua resposta";
        let mask: "phone" | "cnpj" | "cpf" | "cpfcnpj" | undefined = undefined;

        if (isDateField) {
          inputType = "date";
          placeholder = "Selecione a data";
        } else if (isEmailField) {
          inputType = "email";
          placeholder = "exemplo@email.com";
        } else if (isPhoneField) {
          inputType = "text";
          placeholder = "(11) 99999-9999";
          mask = "phone";
        } else if (isCNPJField) {
          inputType = "text";
          placeholder = "00.000.000/0000-00";
          mask = "cnpj";
        } else if (isCPFField) {
          inputType = "text";
          placeholder = "000.000.000-00";
          mask = "cpf";
        }

        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <Input
              type={inputType}
              placeholder={placeholder}
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
              mask={mask}
            />
          </div>
        );
      }

      case "textarea":
        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <textarea
              className="form-textarea"
              placeholder="Digite sua resposta detalhada"
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
              rows={4}
            />
          </div>
        );

      case "radio":
        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="options-container">
              {question.options?.map((option, index) => (
                <label key={index} className="radio-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                    required={question.required}
                  />
                  <span className="radio-custom"></span>
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="options-container">
              {question.options?.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={(value as string[])?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      if (e.target.checked) {
                        handleInputChange(question.id, [
                          ...currentValues,
                          option,
                        ]);
                      } else {
                        handleInputChange(
                          question.id,
                          currentValues.filter((v) => v !== option),
                        );
                      }
                    }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      // meu select
      case "select":
        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <select
              className="form-select"
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
            >
              <option value="">Selecione uma opção</option>

              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  const currentQuestions = questions.filter(
    (q) => q.section === sections[currentSection],
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Carregar dados na inicialização
  useEffect(() => {
    loadServiceRequests();
  }, []);

  // Renderizar menu principal
  const renderMenu = () => (
    <div className="menu-container-solicitacao">
      <div className="solicitacao-menu-cards">
        <Card
          variant="service"
          title="NOVA SOLICITAÇÃO"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="menu-card"
          onClick={() => setViewMode("new")}
        >
          <div className="menu-card-content">
            <div className="menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Criar nova solicitação de serviço</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="HISTÓRICO"
          textColor="#059669"
          backgroundColor="#f0fdf4"
          size="large"
          className="menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="menu-card-content">
            <div className="menu-icon">
              <FiFolder size={48} />
            </div>
            <p>Consultar solicitações anteriores</p>
            <span className="request-count">
              {serviceRequests.length} solicitações
            </span>
          </div>
        </Card>
      </div>
    </div>
  );

  // Renderizar histórico de solicitações
  const renderHistory = () => (
    <div className="history-container">
      <div className="history-header">
        <h2>Histórico de Solicitações</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="requests-list">
        {serviceRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiFolder size={64} />
            </div>
            <h3>Nenhuma solicitação encontrada</h3>
            <p>Crie sua primeira solicitação de serviço</p>
            <Button variant="primary" onClick={() => setViewMode("new")}>
              Nova Solicitação
            </Button>
          </div>
        ) : (
          serviceRequests.map((request) => (
            <div key={request.id} className="request-item">
              <div className="request-info">
                <h3>{request.title}</h3>
                <div className="request-meta">
                  <span className={`status status-${request.status}`}>
                    {request.status === "draft" && (
                      <>
                        <FiEdit3 size={16} />
                        Rascunho
                      </>
                    )}
                    {request.status === "submitted" && (
                      <>
                        <FiUpload size={16} />
                        Enviado
                      </>
                    )}
                    {request.status === "in-progress" && (
                      <>
                        <FiSettings size={16} />
                        Em Andamento
                      </>
                    )}
                    {request.status === "completed" && (
                      <>
                        <FiCheck size={16} />
                        Concluído
                      </>
                    )}
                  </span>
                  <span className="date">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="request-actions">
                <Button
                  variant="secondary"
                  onClick={() => handleEditRequest(request)}
                  className="action-button"
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleViewComments(request)}
                  className="action-button"
                >
                  <FiMessageCircle size={16} />({request.comments.length})
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleExportPDF(request)}
                  className="action-button"
                >
                  <FiFile size={16} />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteRequest(request.id)}
                  className="action-button delete"
                >
                  <FiTrash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Renderizar comentários
  const renderComments = () => (
    <div className="comments-container">
      <div className="comments-header">
        <h2>Comentários - {selectedRequest?.title}</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("history")}
          className="back-to-history"
        >
          <FiArrowLeft size={16} />
          Voltar ao Histórico
        </Button>
      </div>

      <div className="comments-content">
        <div className="add-comment-section">
          <h3>Adicionar Comentário</h3>
          <div className="comment-form">
            <textarea
              className="comment-textarea"
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <Button
              variant="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="add-comment-button"
            >
              <FiPlus size={16} />
              Adicionar Comentário
            </Button>
          </div>
        </div>

        <div className="comments-list">
          <h3>Comentários ({selectedRequest?.comments.length || 0})</h3>
          {selectedRequest?.comments.length === 0 ? (
            <div className="no-comments">
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            selectedRequest?.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author">
                    <strong>{comment.author}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()} às{" "}
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      comment.id && handleDeleteComment(comment.id)
                    }
                    className="delete-comment-button"
                  >
                    <FiTrash2 size={16} />
                  </Button>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Renderizar formulário
  const renderForm = () => (
    <>
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          Seção {currentSection + 1} de {sections.length}:{" "}
          {sections[currentSection]}
        </span>
      </div>

      {/* Form Content */}
      <div className="form-container">
        <Card
          variant="service"
          className="form-card"
          title=""
          textColor="#1e293b"
        >
          <div className="form-header">
            <h2 className="form-title">
              {viewMode === "edit"
                ? "EDITAR SOLICITAÇÃO"
                : "SOLICITAÇÃO DE SERVIÇOS"}
            </h2>
            <p className="form-subtitle">
              Preencha todas as informações solicitadas
            </p>
          </div>

          <div className="form-content">
            <div className="section-title">
              <h3>{sections[currentSection]}</h3>
            </div>

            <div className="questions-container">
              {currentQuestions.length > 0 ? (
                currentQuestions.map(renderQuestion)
              ) : currentSection === sections.length - 1 && !formData.q20 ? (
                <div className="placeholder-message">
                  <p>
                    ⚠️ Por favor, volte à seção "Serviços" e selecione o tipo de
                    serviço desejado.
                  </p>
                  <p>
                    As perguntas específicas aparecerão de acordo com sua
                    seleção.
                  </p>
                </div>
              ) : (
                <div className="placeholder-message">
                  <p>
                    As perguntas desta seção serão adicionadas quando
                    fornecidas.
                  </p>
                  <p>
                    Estrutura preparada para 70 perguntas distribuídas em{" "}
                    {sections.length} seções.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="nav-button"
            >
              <FiChevronLeft size={16} />
              Anterior
            </Button>

            <div className="section-indicators">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`section-dot ${
                    index === currentSection ? "active" : ""
                  } ${index < currentSection ? "completed" : ""}`}
                  onClick={() => setCurrentSection(index)}
                />
              ))}
            </div>

            <div className="form-actions">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                className="nav-button"
              >
                <FiSave size={16} />
                Salvar Rascunho
              </Button>

              {currentSection === sections.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={
                    viewMode === "edit" ? handleUpdateRequest : handleSubmit
                  }
                  className="nav-button submit-button"
                >
                  <FiUpload size={16} />
                  {viewMode === "edit" ? "Atualizar" : "Enviar Solicitação"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="nav-button"
                >
                  Próxima
                  <FiChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <div className="solicitacao-container">
      {/* Loading Indicator */}
      {loading && <LoadingScreen message="Processando..." />}

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="solicitacao-header">
        <Button
          variant="secondary"
          className="back-button"
          onClick={handleBack}
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="company-brand">
          <h1 className="company-title">ACESSO EXCLUSIVO</h1>
          <span className="company-subtitle">
            Engenharia de aplicação e serviços Hidrodema
          </span>
          <div className="company-underline"></div>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "comments" && renderComments()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}

      {/* Footer */}
      <div className="solicitacao-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="footer-logo"
        />
      </div>
    </div>
  );
}
