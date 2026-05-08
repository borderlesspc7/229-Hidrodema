import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
import {
  FiCalendar,
  FiMapPin,
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
  FiClock,
  FiArrowLeft,
  FiUsers,
  FiList,
  FiX,
} from "react-icons/fi";
import "./RelatorioVisitas.css";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import { navigateBackOrFallback } from "../../../lib/navigation";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import { compressImageFile } from "../../../lib/imageCompress";
import { getCurrentGeoPoint, type GeoPoint } from "../../../lib/geolocation";
import { uploadVisitPhoto, type VisitPhoto } from "../../../services/visitasAttachmentsService";
import {
  createVisitRequest,
  createVisitReport,
  loadVisitDataScoped,
  updateVisitRequest,
  updateVisitReport,
  deleteVisitRequest,
  deleteVisitReport,
  addComment,
  getCommentsByRequestId,
  deleteComment,
  generateRequestId,
  type VisitRequest,
  type VisitComment,
  type VisitReport,
} from "../../../services/visitasService";
import { sanitizeForDatabase, validateVisitFormData } from "../../../lib/validation";
import {
  canDeleteVisitRequest,
  canMutateVisitReport,
  hasMacroVisibility,
} from "../../../lib/rbac";
import {
  getSuggestedNextStepsForVisitWorkflow,
  type VisitWorkflowUiStatus,
} from "../../../lib/visitWorkflow";
import {
  buildHidrodemaPrintDocument,
  escapeHtml,
} from "../../../lib/printPdfBranding";

interface FormData {
  [key: string]: string | string[];
}

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "date" | "time";
  question: string;
  options?: string[];
  required?: boolean;
  section?: string;
  instruction?: string;
  placeholder?: string;
}

type ViewMode = "menu" | "new" | "history" | "edit" | "comments" | "schedule";

// Interface local combinada para exibição
interface DisplayVisit {
  id: string;
  requestId?: string;
  title: string;
  status:
    | "pending"
    | "scheduled"
    | "awaiting-report"
    | "cancelled"
    | "completed";
  visitType: "technical" | "commercial";
  client: string;
  salesperson: string;
  engineer?: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  comments: VisitComment[];
  followUpDate?: string;
  hasReport?: boolean;
  isRequest?: boolean; // true se for solicitação, false se for relatório
  /** Editar/excluir/alterar status (RBAC). */
  canMutate: boolean;
}

export default function RelatorioVisitas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const displayName =
    user?.name?.trim() || user?.email?.trim() || "Usuário";
  // Ao entrar no módulo, abrir no menu (cards). O formulário inicia ao clicar em "Nova Solicitação".
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [visitReports, setVisitReports] = useState<DisplayVisit[]>([]);
  const [editingReport, setEditingReport] = useState<DisplayVisit | null>(null);
  const [selectedReport, setSelectedReport] = useState<DisplayVisit | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedRequest, setLoadedRequest] = useState<VisitRequest | null>(null);
  const [availableRequests, setAvailableRequests] = useState<VisitRequest[]>(
    []
  );

  // Workflow obrigatório (check-in -> foto -> relato -> check-out)
  const [checkInAt, setCheckInAt] = useState<string | null>(null);
  const [checkInGeo, setCheckInGeo] = useState<GeoPoint | null>(null);
  const [checkOutAt, setCheckOutAt] = useState<string | null>(null);
  const [checkOutGeo, setCheckOutGeo] = useState<GeoPoint | null>(null);
  const [visitPhotos, setVisitPhotos] = useState<VisitPhoto[]>([]);

  const startNewRequest = () => {
    setViewMode("new");
    setCurrentSection(1); // "Geral" (tela do print com a escolha da ação)
    setFormData({});
    setLoadedRequest(null);
    setEditingReport(null);
    setSelectedReport(null);
    setCheckInAt(null);
    setCheckInGeo(null);
    setCheckOutAt(null);
    setCheckOutGeo(null);
    setVisitPhotos([]);
  };

  const selectedRegional = (formData.q1 as string) || "";
  const selectedVendor =
    ((formData.q2 as string) ||
      (formData.q3 as string) ||
      (formData.q4 as string) ||
      (formData.q5 as string) ||
      "") as string;
  const isRegionalVendedorQuestion = (id: string) =>
    id === "q2" || id === "q3" || id === "q4" || id === "q5";

  useEffect(() => {
    // Mantém o "vendedor responsável" alinhado ao vendedor selecionado por regional.
    if (!selectedVendor) return;
    if ((formData.q17 as string) === selectedVendor) return;
    setFormData((prev) => ({ ...prev, q17: selectedVendor }));
  }, [formData.q17, selectedVendor]);

  useEffect(() => {
    // Evita inconsistência entre campos duplicados de ID da solicitação.
    const q19 = String(formData.q19 ?? "").trim();
    const q21 = String(formData.q21 ?? "").trim();
    if (q19 && q21 !== q19) {
      setFormData((prev) => ({ ...prev, q21: q19 }));
    } else if (q21 && q19 !== q21) {
      setFormData((prev) => ({ ...prev, q19: q21 }));
    }
  }, [formData.q19, formData.q21]);

  const shouldShowQuestion = (q: Question) => {
    // Seção 1: ao escolher a regional, mostrar apenas o select de vendedores correspondente.
    if (q.section === "Informações Regionais e Vendedores") {
      if (q.id === "q1") return true;
      if (q.id === "q2") return selectedRegional.includes("VEND I & II");
      if (q.id === "q3") return selectedRegional.toUpperCase().includes("HUNTERS");
      if (q.id === "q4") return selectedRegional.includes("HVAC");
      if (q.id === "q5") return selectedRegional.includes("Expansão");
      // Por segurança: qualquer outro campo dessa seção segue visível.
      return !isRegionalVendedorQuestion(q.id);
    }
    // Evita campo redundante quando já foi selecionado por regional.
    if (q.id === "q17" && selectedVendor) return false;
    return true;
  };

  // Estrutura preparada para receber 25 perguntas sobre visitas
  const questions: Question[] = [
    // Seção 1: Informações Regionais e Vendedores
    {
      id: "q1",
      type: "radio",
      question: "1 - Informe sua Regional",
      section: "Informações Regionais e Vendedores",
      required: true,
      options: [
        "Carlos Moraes - VEND I & II",
        "Rogério Foltran - HUNTERS",
        "Davi Salgado - HVAC",
        "Nic Romano - Expansão & Novos Negócios",
      ],
    },
    {
      id: "q2",
      type: "select",
      question: "2 - Vendedor Solicitação - VEND I & II",
      section: "Informações Regionais e Vendedores",
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
      id: "q3",
      type: "select",
      question: "3 - Vendedor Solicitação - Hunters",
      section: "Informações Regionais e Vendedores",
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
      id: "q4",
      type: "select",
      question: "4 - Vendedor Solicitação - HVAC",
      section: "Informações Regionais e Vendedores",
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
      id: "q5",
      type: "select",
      question: "5 - Vendedor Solicitação - Expansão & Novos Negócios",
      section: "Informações Regionais e Vendedores",
      required: true,
      options: [
        "035197 - DANILO TRIPOLI",
        "035199 - EDSON RANGEL",
        "035200 - MARCO TULIO",
        "035193 - NILZA ROMANO",
        "035198 - RAFAEL SOUZA DA COSTA",
      ],
    },
    // Seção 2: Geral
    {
      id: "q6",
      type: "radio",
      question: "6 - Selecione a ação que deseja realizar",
      section: "Geral",
      required: true,
      options: [
        "Solicitar uma nova visita",
        "Fazer o relatório de uma visita realizada",
      ],
    },
    // Seção 3: Dados do Cliente
    {
      id: "q7",
      type: "text",
      question: "7 - Nome do Cliente",
      section: "Dados do Cliente",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q8",
      type: "text",
      question: "8 - CNPJ do Cliente",
      section: "Dados do Cliente",
      required: false,
      placeholder: "Insira pelo menos 13 caracteres",
    },
    {
      id: "q9",
      type: "text",
      question: "9 - Código do Cliente",
      section: "Dados do Cliente",
      required: false,
      instruction: "Insira conforme exemplo: N17318-01",
      placeholder: "Insira pelo menos 8 caracteres",
    },
    {
      id: "q10",
      type: "text",
      question: "10 - Município",
      section: "Dados do Cliente",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q11",
      type: "text",
      question: "11 - Contato Cliente",
      section: "Dados do Cliente",
      required: true,
      placeholder: "Insira sua resposta",
    },
    // Seção 4: Solicitação de Visita
    {
      id: "q12",
      type: "radio",
      question: "12 - Qual será o tipo de visita",
      section: "Solicitação de Visita",
      required: true,
      options: [
        "Levantamento Técnico",
        "Apresentação Técnica",
        "Reunião Técnica",
        "Reunião Comercial",
      ],
    },
    {
      id: "q13",
      type: "textarea",
      question: "13 - Detalhe o motivo da visita",
      section: "Solicitação de Visita",
      required: true,
      instruction: "Detalhe o escopo da visita",
      placeholder: "Insira sua resposta",
    },
    {
      id: "q14",
      type: "text",
      question: "14 - Endereço da Visita",
      section: "Solicitação de Visita",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q15",
      type: "date",
      question: "15 - Data da visita",
      section: "Solicitação de Visita",
      required: true,
      placeholder: "Insira a data (dd/MM/yyyy)",
    },
    {
      id: "q16",
      type: "radio",
      question: "16 - Período Sugerido de Visita",
      section: "Solicitação de Visita",
      required: true,
      options: [
        "Manhã | 09:00HS - 12:00HS",
        "Manhã | 09:00HS - 10:30HS",
        "Manhã | 10:30HS - 12:00HS",
        "Tarde | 13:00HS - 16:00HS",
        "Tarde | 13:00HS - 14:30HS",
        "Tarde | 14:30HS - 16:00HS",
      ],
    },
    {
      id: "q17",
      type: "select",
      question: "17 - Vendedor Responsável Solicitação",
      section: "Solicitação de Visita",
      required: true,
      options: [
        "002617 - CLAUDINEI",
        "002620 - ALESSANDRO",
        "002630 - CHRISTIAN",
        "020719 - ROGERIO",
        "035139 - LEONARDO",
        "035163 - ELTON",
        "035174 - MOACIR",
        "035178 - HERBERT",
        "035179 - GABRIEL LUIS",
        "035180 - MARIO",
        "035183 - GUILHERME ALVES",
        "035184 - ALEXANDRE DI RIENZO",
        "035185 - GUILHERME CAMPOS",
        "035190 - PEDRO HENRIQUE",
        "035197 - DANILO TRIPOLI",
        "035199 - EDSON RANGEL",
        "035200 - MARCO TULIO",
        "035193 - NILZA ROMANO",
        "035198 - RAFAEL SOUZA DA COSTA",
        "Outro Vendedor",
      ],
    },
    // Seção 5: Confirmação
    {
      id: "q18",
      type: "checkbox",
      question: "18 - Confirmação da Solicitação",
      section: "Confirmação",
      required: true,
      options: [
        "Confirmo que todas as informações fornecidas estão corretas e autorizo o processamento desta solicitação de visita",
      ],
    },
    // Seção 6: Instruções para Relatório
    {
      id: "q19",
      type: "text",
      question: "19 - ID da Solicitação",
      section: "Instruções para Relatório",
      required: true,
      placeholder: "Insira o ID da solicitação prévia",
    },
    // Seção 7: Dados da Visita
    {
      id: "q20",
      type: "radio",
      question: "20 - Possui o número de solicitação da visita (ID)",
      section: "Dados da Visita",
      required: true,
      options: ["Sim", "Não"],
    },
    {
      id: "q21",
      type: "text",
      question: "21 - Solicitação de Visita",
      section: "Dados da Visita",
      required: true,
      instruction:
        "Adicione o ID da Solicitação de visita que está referenciando.",
      placeholder: "O número não pode ser 0",
    },
    {
      id: "q22",
      type: "text",
      question: "22 - Nome do Cliente Visitado",
      section: "Dados da Visita",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q23",
      type: "date",
      question: "23 - Data da Visita",
      section: "Dados da Visita",
      required: true,
      placeholder: "Insira a data (dd/MM/yyyy)",
    },
    {
      id: "q24",
      type: "radio",
      question: "24 - Essa visita foi Online",
      section: "Dados da Visita",
      required: true,
      options: [
        "Sim, foi uma apresentação Online",
        "Não, foi uma visita Presencial",
      ],
    },
    {
      id: "q25",
      type: "checkbox",
      question: "25 - Quem realizou a visita",
      section: "Dados da Visita",
      required: true,
      options: [
        "Carlos Moraes",
        "Eduardo Amaral",
        "Eduardo Zoega",
        "Enrique Leite",
        "Marco Antônio - Amanco",
        "Ricardo Reis - Lubrizol",
        "Executivo de vendas responsável",
        "Outra",
      ],
    },
    // Seção 8: Relatório
    {
      id: "q26",
      type: "select",
      question: "26 - Tema principal da visita",
      section: "Relatório",
      required: true,
      options: [
        "Selecionar sua resposta",
        "Levantamento técnico / Projeto",
        "Apresentação da Hidrodema",
        "Apresentação de proposta / negociação",
        "Prospecção de cliente",
        "Visita de rotina / Complemento de rota",
        "Treinamento",
        "Reunião Tecnica",
        "Reunião Comercial",
      ],
    },
    {
      id: "q27",
      type: "textarea",
      question: "27 - Relatório da Visita",
      section: "Relatório",
      required: true,
      instruction: "Relatar com detalhes o que foi realizado na visita",
      placeholder: "Insira sua resposta",
    },
    {
      id: "q28",
      type: "checkbox",
      question: "28 - Ponto Emocional Principal Constatado",
      section: "Relatório",
      required: true,
      options: [
        "Conveniência",
        "Segurança",
        "Qualidade",
        "Agilidade",
        "Tecnologia",
        "Status",
        "Responsabilidade",
        "Comprometimento",
        "Exclusividade",
        "Transparência",
        "Confiança",
        "Responsabilidade Ambiental",
        "Outra",
      ],
    },
    {
      id: "q29",
      type: "text",
      question: "29 - Próxima Ação",
      section: "Relatório",
      required: true,
      instruction: "Vendedor / Engenharia / Logística...",
      placeholder: "Insira sua resposta",
    },
    {
      id: "q30",
      type: "date",
      question: "30 - Data para o Próximo Follow UP",
      section: "Relatório",
      required: true,
      placeholder: "Insira a data (dd/MM/yyyy)",
    },
  ];

  // Seções para Solicitação de Visita
  const solicitacaoSections = [
    "Informações Regionais e Vendedores",
    "Geral",
    "Dados do Cliente",
    "Solicitação de Visita",
    "Confirmação",
  ];

  // Seções para Relatório de Visita
  const relatorioSections = [
    "Instruções para Relatório",
    "Dados da Visita",
    "Relatório",
  ];

  // Determinar seções ativas baseadas na escolha do usuário
  const getActiveSections = () => {
    const selectedAction = formData.q6 as string;

    if (selectedAction === "Solicitar uma nova visita") {
      return solicitacaoSections;
    } else if (selectedAction === "Fazer o relatório de uma visita realizada") {
      return relatorioSections;
    }

    // Se ainda não selecionou, mostrar apenas até a seção Geral
    return ["Informações Regionais e Vendedores", "Geral"];
  };

  const sections = getActiveSections();

  // Carregar dados do Firebase
  const loadVisitData = async () => {
    try {
      setLoading(true);

      const { requests, reports, byRequestId } = await loadVisitDataScoped(
        user ?? null
      );

      // Filtrar solicitações que ainda não têm relatório (disponíveis para fazer relatório)
      const requestsWithoutReport = requests.filter((req) => !req.hasReport);
      setAvailableRequests(requestsWithoutReport);

      // Combinar para exibição
      const displayData: DisplayVisit[] = [
        ...requests.map((req) => ({
          id: req.id || "",
          requestId: req.requestId,
          title: `${req.clientName} - ${new Date(
            req.visitDate
          ).toLocaleDateString()}`,
          status: req.status as DisplayVisit["status"],
          visitType:
            req.visitType.includes("Técnico") ||
            req.visitType.includes("Técnica")
              ? ("technical" as const)
              : ("commercial" as const),
          client: req.clientName,
          salesperson: req.responsibleSalesperson,
          scheduledDate: req.visitDate,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
          formData: req.formData,
          comments: [],
          hasReport: req.hasReport,
          isRequest: true,
          canMutate: user ? canDeleteVisitRequest(user, req) : false,
        })),
        ...reports.map((rep: VisitReport) => {
          const parent = rep.requestId
            ? byRequestId.get(rep.requestId)
            : undefined;
          return {
            id: rep.id || "",
            requestId: rep.requestId,
            title: `Relatório - ${rep.requestId}`,
            status: "completed" as const,
            visitType: "technical" as const,
            client: "",
            salesperson: "",
            scheduledDate: rep.visitDate,
            createdAt: rep.createdAt,
            updatedAt: rep.updatedAt,
            formData: rep.formData,
            comments: [],
            followUpDate: rep.followUpDate,
            isRequest: false,
            canMutate: canMutateVisitReport(user ?? null, rep, parent),
          };
        }),
      ];

      // Seed visual (apenas DEV): deixa a planilha com 1 linha igual ao mock do layout.
      // Não afeta produção e não sobrescreve dados reais.
      const seeded =
        import.meta.env.DEV && displayData.length === 0
          ? ([
              {
                id: "mock-visit-1",
                requestId: "REQ-20260324-38347",
                title: "Mitsui - 23/03/2026",
                status: "completed",
                visitType: "commercial",
                client: "Mitsui",
                salesperson: "035184 - ALEXANDRE DI RIENZO",
                scheduledDate: "2026-03-23",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formData: {},
                comments: [],
                hasReport: true,
                isRequest: true,
                canMutate: false,
              } satisfies DisplayVisit,
            ] as DisplayVisit[])
          : displayData;

      setVisitReports(seeded);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      alert("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados da solicitação selecionada no dropdown
  const loadRequestFromSelect = (requestId: string) => {
    if (!requestId) {
      setLoadedRequest(null);
      return;
    }

    console.log("📋 Carregando solicitação ID:", requestId);

    // Buscar a solicitação na lista de disponíveis
    const request = availableRequests.find(
      (req) => req.requestId === requestId
    );

    if (request) {
      setLoadedRequest(request);

      // Preencher automaticamente os campos com os dados da solicitação
      setFormData((prev) => ({
        ...prev,
        // Manter o ID da solicitação
        q19: requestId,
        q21: requestId,
        // Preencher dados do cliente
        q22: request.clientName,
        // Dados da visita
        q23: request.visitDate,
      }));

      console.log("✅ Dados carregados com sucesso!");
    }
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => {
      // Ao trocar a regional (q1), limpa os selects de vendedor para evitar “vendedor de outra regional”.
      if (questionId === "q1") {
        return {
          ...prev,
          q1: value,
          q2: "",
          q3: "",
          q4: "",
          q5: "",
        };
      }

      return {
        ...prev,
        [questionId]: value,
      };
    });

    // Se mudou a seleção de ação (q6), resetar para a seção Geral
    if (questionId === "q6") {
      setCurrentSection(1); // Índice da seção "Geral"
      setLoadedRequest(null); // Limpar solicitação carregada
      setCheckInAt(null);
      setCheckInGeo(null);
      setCheckOutAt(null);
      setCheckOutGeo(null);
      setVisitPhotos([]);
    }

    // Se selecionou uma solicitação no dropdown, carregar os dados
    if (
      (questionId === "q19" || questionId === "q21") &&
      typeof value === "string"
    ) {
      loadRequestFromSelect(value);
    }
  };

  const selectedAction = formData.q6 as string;
  const isReportFlow =
    selectedAction === "Fazer o relatório de uma visita realizada";
  const selectedRequestId = String(formData.q19 || formData.q21 || "").trim();

  const canCheckIn = isReportFlow && Boolean(selectedRequestId) && !checkInAt;
  const canUploadPhoto = isReportFlow && Boolean(selectedRequestId) && Boolean(checkInAt);
  const canCheckOut =
    isReportFlow &&
    Boolean(selectedRequestId) &&
    Boolean(checkInAt) &&
    visitPhotos.length > 0 &&
    !checkOutAt;

  const workflowOk =
    isReportFlow &&
    Boolean(checkInAt) &&
    Boolean(checkInGeo) &&
    visitPhotos.length > 0 &&
    Boolean(checkOutAt) &&
    Boolean(checkOutGeo);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const geo = await getCurrentGeoPoint();
      setCheckInGeo(geo);
      setCheckInAt(new Date().toISOString());
      alert("Check-in registado com GPS.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no check-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const geo = await getCurrentGeoPoint();
      setCheckOutGeo(geo);
      setCheckOutAt(new Date().toISOString());
      alert("Check-out registado com GPS.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no check-out.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async (file: File) => {
    if (!selectedRequestId) {
      alert("Selecione o ID da solicitação antes de enviar fotos.");
      return;
    }
    try {
      setLoading(true);
      const { blob } = await compressImageFile(file, { maxEdge: 1920, quality: 0.82 });
      const uploaded = await uploadVisitPhoto({
        requestId: selectedRequestId,
        fileName: file.name.replace(/\.[^.]+$/, "") + ".jpg",
        blob,
        mimeType: "image/jpeg",
      });
      setVisitPhotos((prev) => [uploaded, ...prev]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao enviar foto.");
    } finally {
      setLoading(false);
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
      const selectedAction = formData.q6 as string;
      const v = validateVisitFormData(formData as Record<string, unknown>);
      if (!v.ok) {
        const proceed = confirm(
          `Rascunho com avisos:\n- ${v.errors.join("\n- ")}\n\nDeseja salvar mesmo assim?`
        );
        if (!proceed) return;
      }

      if (selectedAction === "Solicitar uma nova visita") {
        // Salvar rascunho de solicitação
        const requestId = generateRequestId();

        await createVisitRequest({
          requestId,
          regional: (formData.q1 as string) || "",
          vendedor:
            (formData.q2 as string) ||
            (formData.q3 as string) ||
            (formData.q4 as string) ||
            (formData.q5 as string) ||
            "",
          clientName: (formData.q7 as string) || "Cliente não informado",
          clientCNPJ: formData.q8 as string,
          clientCode: formData.q9 as string,
          municipality: (formData.q10 as string) || "",
          clientContact: (formData.q11 as string) || "",
          visitType: (formData.q12 as string) || "",
          visitReason: (formData.q13 as string) || "",
          visitAddress: (formData.q14 as string) || "",
          visitDate:
            (formData.q15 as string) || new Date().toISOString().split("T")[0],
          visitPeriod: (formData.q16 as string) || "",
          responsibleSalesperson: (formData.q17 as string) || "",
          status: "pending",
          hasReport: false,
          formData: sanitizeForDatabase({ ...formData }),
          createdBy: user?.uid,
        });

        alert(
          `Rascunho de solicitação salvo com sucesso!\nID da Solicitação: ${requestId}\n\nGuarde este ID para fazer o relatório posteriormente.`
        );
      }

      await loadVisitData();
    } catch (err) {
      console.error("Erro ao salvar rascunho:", err);
      alert("Erro ao salvar rascunho. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const v = validateVisitFormData(formData as Record<string, unknown>);
      if (!v.ok) {
        alert(v.errors.join("\n"));
        return;
      }

      if (selectedAction === "Solicitar uma nova visita") {
        // Criar nova solicitação
        const requestId = generateRequestId();

        await createVisitRequest({
          requestId,
          regional: (formData.q1 as string) || "",
          vendedor:
            (formData.q2 as string) ||
            (formData.q3 as string) ||
            (formData.q4 as string) ||
            (formData.q5 as string) ||
            "",
          clientName: (formData.q7 as string) || "Cliente não informado",
          clientCNPJ: formData.q8 as string,
          clientCode: formData.q9 as string,
          municipality: (formData.q10 as string) || "",
          clientContact: (formData.q11 as string) || "",
          visitType: (formData.q12 as string) || "",
          visitReason: (formData.q13 as string) || "",
          visitAddress: (formData.q14 as string) || "",
          visitDate:
            (formData.q15 as string) || new Date().toISOString().split("T")[0],
          visitPeriod: (formData.q16 as string) || "",
          responsibleSalesperson: (formData.q17 as string) || "",
          status: "scheduled",
          hasReport: false,
          formData: sanitizeForDatabase({ ...formData }),
          createdBy: user?.uid,
        });

        alert(
          `Solicitação de visita criada com sucesso!\nID da Solicitação: ${requestId}\n\nGuarde este ID para fazer o relatório posteriormente.`
        );
      } else if (
        selectedAction === "Fazer o relatório de uma visita realizada"
      ) {
        // Criar relatório vinculado à solicitação
        const requestId = (formData.q19 || formData.q21) as string;

        if (!requestId) {
          alert(
            "É necessário informar o ID da solicitação para criar o relatório."
          );
          return;
        }

        if (!workflowOk) {
          const missing: string[] = [];
          if (!checkInAt || !checkInGeo) missing.push("Check-in (GPS)");
          if (visitPhotos.length === 0) missing.push("Pelo menos 1 foto");
          if (!checkOutAt || !checkOutGeo) missing.push("Check-out (GPS)");
          alert(`Workflow obrigatório incompleto:\n- ${missing.join("\n- ")}`);
          return;
        }

        await createVisitReport({
          requestId,
          createdBy: user?.uid,
          visitDate:
            (formData.q23 as string) || new Date().toISOString().split("T")[0],
          isOnline:
            (formData.q24 as string) === "Sim, foi uma apresentação Online",
          participants: Array.isArray(formData.q25)
            ? formData.q25
            : [formData.q25 as string],
          mainTheme: (formData.q26 as string) || "",
          reportText: (formData.q27 as string) || "",
          emotionalPoints: Array.isArray(formData.q28)
            ? formData.q28
            : [formData.q28 as string],
          nextAction: (formData.q29 as string) || "",
          followUpDate: (formData.q30 as string) || "",
          checkInAt: checkInAt ?? undefined,
          checkInGeo: checkInGeo ?? undefined,
          checkOutAt: checkOutAt ?? undefined,
          checkOutGeo: checkOutGeo ?? undefined,
          photos: visitPhotos.map((p) => ({
            id: p.id,
            storagePath: p.storagePath,
            storageUrl: p.storageUrl,
            uploadedAt: p.uploadedAt,
            name: p.name,
          })),
          formData: sanitizeForDatabase({ ...formData }),
        });

        alert("Relatório de visita criado com sucesso!");
      }

      await loadVisitData();
      setViewMode("menu");
      setFormData({});
      setCurrentSection(0);
      setLoadedRequest(null);
      setCheckInAt(null);
      setCheckInGeo(null);
      setCheckOutAt(null);
      setCheckOutGeo(null);
      setVisitPhotos([]);
    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = (report: DisplayVisit) => {
    if (!report.canMutate) {
      alert("Sem permissão para editar este registro.");
      return;
    }
    setEditingReport(report);
    setFormData(report.formData);
    setViewMode("edit");
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    try {
      setLoading(true);
      const v = validateVisitFormData(formData as Record<string, unknown>);
      if (!v.ok) {
        alert(v.errors.join("\n"));
        return;
      }

      if (editingReport.isRequest) {
        // Atualizar solicitação
        await updateVisitRequest(editingReport.id, {
          formData: sanitizeForDatabase({ ...formData }),
        });
      } else {
        // Atualizar relatório
        await updateVisitReport(editingReport.id, {
          formData: sanitizeForDatabase({ ...formData }),
        });
      }

      alert("Atualizado com sucesso!");
      await loadVisitData();
      setViewMode("history");
      setEditingReport(null);
      setFormData({});
      setCurrentSection(0);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
      setLoading(true);
      const report = visitReports.find((r) => r.id === reportId);

      if (report && !report.canMutate) {
        alert("Sem permissão para excluir este registro.");
        return;
      }

      if (report) {
        if (report.isRequest) {
          await deleteVisitRequest(reportId);
        } else {
          await deleteVisitReport(reportId);
        }
      }

      await loadVisitData();
      alert("Excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (
    reportId: string,
    newStatus: DisplayVisit["status"]
  ) => {
    try {
      const report = visitReports.find((r) => r.id === reportId);

      if (report && !report.canMutate) {
        return;
      }

      if (report && report.isRequest) {
        await updateVisitRequest(reportId, {
          status: newStatus as VisitRequest["status"],
        });
        await loadVisitData();
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  const handleExportPDF = (report: DisplayVisit) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const questionById = new Map(questions.map((q) => [q.id, q]));
      const formatValue = (v: unknown) =>
        Array.isArray(v) ? v.join(", ") : String(v ?? "");

      const sections = new Map<string, { label: string; value: string }[]>();
      for (const [key, value] of Object.entries(report.formData ?? {})) {
        const q = questionById.get(key);
        const label = q?.question ?? key;
        const section = q?.section ?? "Dados";
        const val = formatValue(value).trim();
        if (!val) continue;
        if (!sections.has(section)) sections.set(section, []);
        sections.get(section)!.push({ label, value: val });
      }

      const metaLinesHtml = [
        `<p><span class="print-label">Cliente:</span> <span class="print-value">${escapeHtml(report.client)}</span></p>`,
        report.requestId
          ? `<p><span class="print-label">ID solicitação:</span> <span class="print-value">${escapeHtml(report.requestId)}</span></p>`
          : "",
        `<p><span class="print-label">Data:</span> <span class="print-value">${escapeHtml(
          new Date(report.scheduledDate).toLocaleDateString()
        )}</span></p>`,
        `<p><span class="print-label">Vendedor:</span> <span class="print-value">${escapeHtml(report.salesperson)}</span></p>`,
        `<p><span class="print-label">Tipo:</span> <span class="print-value">${escapeHtml(
          report.isRequest ? "Solicitação" : "Relatório"
        )}</span></p>`,
        `<p><span class="print-label">Status:</span> <span class="print-value">${escapeHtml(
          report.status
        )}</span></p>`,
      ]
        .filter(Boolean)
        .join("");

      const bodyHtml = `
        ${Array.from(sections.entries())
          .map(
            ([section, items]) => `
              <section class="print-section">
                <h3>${escapeHtml(section)}</h3>
                ${items
                  .map(
                    (it) => `
                    <div class="visit-print-row">
                      <div class="visit-print-q">${escapeHtml(it.label)}</div>
                      <div class="visit-print-a">${escapeHtml(it.value)}</div>
                    </div>
                  `
                  )
                  .join("")}
              </section>
            `
          )
          .join("")}
      `;
      printWindow.document.write(
        buildHidrodemaPrintDocument({
          pageTitle: `Relatório de Visita — ${report.title}`,
          mainTitle: "Relatório de visita",
          metaLinesHtml,
          bodyHtml,
          extraStyles: `
            .visit-print-row { padding: 10px 0; border-bottom: 1px solid rgba(226,232,240,0.9); }
            .visit-print-row:last-child { border-bottom: 0; }
            .visit-print-q { font-weight: 800; color: #0f172a; margin-bottom: 6px; }
            .visit-print-a { white-space: pre-wrap; overflow-wrap: anywhere; color: #1f2937; }
          `,
        })
      );
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewComments = async (report: DisplayVisit) => {
    try {
      setLoading(true);
      const requestId = report.requestId || report.id;

      // Carregar comentários do Firebase
      const comments = await getCommentsByRequestId(requestId);

      setSelectedReport({
        ...report,
        comments,
      });
      setViewMode("comments");
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
      alert("Erro ao carregar comentários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedReport || !newComment.trim()) return;

    try {
      setLoading(true);
      const requestId = selectedReport.requestId || selectedReport.id;

      await addComment({
        requestId,
        text: newComment.trim(),
        author: displayName,
      });

      // Recarregar comentários
      const comments = await getCommentsByRequestId(requestId);
      setSelectedReport({
        ...selectedReport,
        comments,
      });

      setNewComment("");
      alert("Comentário adicionado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
      alert("Erro ao adicionar comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      await deleteComment(commentId);

      // Recarregar comentários
      const requestId = selectedReport.requestId || selectedReport.id;
      const comments = await getCommentsByRequestId(requestId);
      setSelectedReport({
        ...selectedReport,
        comments,
      });

      alert("Comentário excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
      alert("Erro ao excluir comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigateBackOrFallback(navigate, location.key, paths.acessoExclusivo);
    } else if (viewMode === "comments") {
      setViewMode("history");
      setSelectedReport(null);
    } else {
      setViewMode("menu");
      setFormData({});
      setCurrentSection(0);
      setEditingReport(null);
      setSelectedReport(null);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || "";

    switch (question.type) {
      case "text":
        // Se for q19 ou q21 (seleção de solicitação), mostrar SELECT em vez de INPUT
        if (question.id === "q19" || question.id === "q21") {
          return (
            <div className="visitas-form-question" key={question.id}>
              <label className="visitas-question-label">
                {question.question}
                {question.required && (
                  <span className="visitas-required">*</span>
                )}
              </label>
              {question.instruction && (
                <div className="visitas-question-instruction">
                  {question.instruction}
                </div>
              )}

              <select
                className="visitas-form-select"
                value={value as string}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required={question.required}
              >
                <option value="">Selecione uma solicitação de visita</option>
                {availableRequests.length === 0 ? (
                  <option value="" disabled>
                    Nenhuma solicitação disponível
                  </option>
                ) : (
                  availableRequests.map((req) => (
                    <option key={req.id} value={req.requestId}>
                      {req.clientName} -{" "}
                      {new Date(req.visitDate).toLocaleDateString()} -{" "}
                      {req.visitType}
                    </option>
                  ))
                )}
              </select>

              {/* Indicação de solicitação carregada */}
              {loadedRequest && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    background: "rgba(6, 214, 160, 0.1)",
                    border: "2px solid rgba(6, 214, 160, 0.3)",
                    borderRadius: "12px",
                    color: "#059669",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    ✓ Solicitação selecionada:
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Cliente:</strong> {loadedRequest.clientName}
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Data:</strong>{" "}
                    {new Date(loadedRequest.visitDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Tipo:</strong> {loadedRequest.visitType}
                  </div>
                  <div
                    style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}
                  >
                    ID: {loadedRequest.requestId}
                  </div>
                </div>
              )}

              {/* Aviso se não houver solicitações */}
              {availableRequests.length === 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "2px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "12px",
                    color: "#d97706",
                    fontSize: "14px",
                  }}
                >
                  ⚠️ Não há solicitações de visita disponíveis para relatório.
                  <br />
                  Crie uma solicitação primeiro antes de fazer o relatório.
                </div>
              )}
            </div>
          );
        }

        // Para outros campos de texto, renderizar normalmente
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            {question.instruction && (
              <div className="visitas-question-instruction">
                {question.instruction}
              </div>
            )}
            <Input
              type="text"
              placeholder={question.placeholder || "Digite sua resposta"}
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
            />
          </div>
        );

      case "date":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            {question.instruction && (
              <div className="visitas-question-instruction">
                {question.instruction}
              </div>
            )}
            <Input
              placeholder={question.placeholder || "Digite sua resposta"}
              type="date"
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
            />
          </div>
        );

      case "time":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            <Input
              placeholder="Digite sua resposta"
              type="time"
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            {question.instruction && (
              <div className="visitas-question-instruction">
                {question.instruction}
              </div>
            )}
            <textarea
              className="visitas-form-textarea"
              placeholder={
                question.placeholder || "Digite sua resposta detalhada"
              }
              value={value as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
              rows={4}
            />
          </div>
        );

      case "radio":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            <div
              className={`visitas-options-container ${
                question.id === "q6" ? "visitas-options-container--inline" : ""
              }`}
            >
              {question.options?.map((option, index) => (
                <label key={index} className="visitas-radio-option">
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
                  <span className="visitas-radio-custom"></span>
                  <span className="visitas-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            <div className="visitas-options-container">
              {question.options?.map((option, index) => (
                <label key={index} className="visitas-checkbox-option">
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
                          currentValues.filter((v) => v !== option)
                        );
                      }
                    }}
                  />
                  <span className="visitas-checkbox-custom"></span>
                  <span className="visitas-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "select":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            <select
              className="visitas-form-select"
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
    (q) => q.section === sections[currentSection] && shouldShowQuestion(q)
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Carregar dados na inicialização e quando o perfil muda
  useEffect(() => {
    void loadVisitData();
    // Intencional: recarregar lista ao mudar sessão/perfil, não ao mudar a função.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Renderizar menu principal
  const renderMenu = () => (
    <div className="visitas-menu-container">
      {user && !hasMacroVisibility(user) && (
        <p className="visitas-rbac-banner" role="note">
          <strong>Visão restrita:</strong> você vê apenas solicitações e relatórios
          associados ao seu perfil (criação, vendedor ou responsável). Gestores e
          administradores têm visão consolidada.
        </p>
      )}
      <div className="visitas-menu-cards">
        <Card
          variant="technology"
          title="NOVA SOLICITAÇÃO"
          textColor="#e2e8f0"
          size="large"
          className="visitas-menu-card"
          onClick={startNewRequest}
        >
          <div className="visitas-menu-card-content">
            <div className="visitas-menu-icon">
              <FiCalendar size={48} />
            </div>
            <p>Agendar nova visita técnica ou comercial</p>
          </div>
        </Card>

        <Card
          variant="technology"
          title="PLANILHA DE VISITAS"
          textColor="#e2e8f0"
          size="large"
          className="visitas-menu-card"
          onClick={() => setViewMode("schedule")}
        >
          <div className="visitas-menu-card-content">
            <div className="visitas-menu-icon">
              <FiList size={48} />
            </div>
            <p>Consultar agenda e status das visitas</p>
            <span className="visitas-request-count">
              {visitReports.length} visitas
            </span>
          </div>
        </Card>

        <Card
          variant="technology"
          title="HISTÓRICO"
          textColor="#e2e8f0"
          size="large"
          className="visitas-menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="visitas-menu-card-content">
            <div className="visitas-menu-icon">
              <FiMapPin size={48} />
            </div>
            <p>Relatórios e histórico completo</p>
          </div>
        </Card>
      </div>
    </div>
  );

  // Renderizar planilha interativa de visitas
  const renderSchedule = () => (
    <div className="visitas-schedule-container">
      <div className="visitas-schedule-header">
        <h2>Planilha de Visitas</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="visitas-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="visitas-schedule-table">
        <div className="visitas-table-header">
          <div className="visitas-table-cell">Cliente</div>
          <div className="visitas-table-cell">Vendedor</div>
          <div className="visitas-table-cell">Data</div>
          <div className="visitas-table-cell">Tipo</div>
          <div className="visitas-table-cell">Status</div>
          <div className="visitas-table-cell">Ações</div>
        </div>

        {visitReports.length === 0 ? (
          <div className="visitas-empty-schedule">
            <div className="visitas-empty-icon">
              <FiCalendar size={64} />
            </div>
            <h3>Nenhuma visita agendada</h3>
            <p>Crie sua primeira visita</p>
            <Button variant="primary" onClick={startNewRequest}>
              Nova Visita
            </Button>
          </div>
        ) : (
          visitReports.map((report) => {
            const workflowSteps = getSuggestedNextStepsForVisitWorkflow({
              status: report.status as VisitWorkflowUiStatus,
              hasReport: Boolean(report.hasReport),
              isRequest: Boolean(report.isRequest),
            });
            return (
              <div key={report.id} className="visitas-schedule-block">
                <div className="visitas-table-row">
                  <div className="visitas-table-cell">{report.client}</div>
                  <div className="visitas-table-cell">{report.salesperson}</div>
                  <div className="visitas-table-cell">
                    {new Date(report.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="visitas-table-cell">
                    {report.visitType === "technical" ? "Técnica" : "Comercial"}
                  </div>
                  <div className="visitas-table-cell">
                    <select
                      className={`visitas-status-select status-${report.status}`}
                      value={report.status}
                      disabled={!report.canMutate}
                      onChange={(e) =>
                        handleChangeStatus(
                          report.id,
                          e.target.value as DisplayVisit["status"]
                        )
                      }
                    >
                      <option value="scheduled">Agendada</option>
                      <option value="awaiting-report">Aguardando Relatório</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="completed">Concluída</option>
                    </select>
                  </div>
                  <div className="visitas-table-cell">
                    <div className="visitas-table-actions">
                      {report.canMutate && (
                        <Button
                          variant="secondary"
                          onClick={() => handleEditReport(report)}
                          className="visitas-action-button"
                        >
                          <FiEdit3 size={14} />
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        onClick={() => handleExportPDF(report)}
                        className="visitas-action-button"
                      >
                        <FiFile size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                {workflowSteps.length > 0 && (
                  <div className="visitas-workflow-row">
                    <details className="visitas-workflow-details">
                      <summary>Próximos passos sugeridos</summary>
                      <ul className="visitas-workflow-list">
                        {workflowSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Renderizar histórico de relatórios
  const renderHistory = () => (
    <div className="visitas-history-container">
      <div className="visitas-history-header">
        <h2>Histórico de Visitas</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="visitas-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="visitas-requests-list">
        {visitReports.length === 0 ? (
          <div className="visitas-empty-state">
            <div className="visitas-empty-icon">
              <FiMapPin size={64} />
            </div>
            <h3>Nenhuma visita encontrada</h3>
            <p>Crie sua primeira visita</p>
            <Button variant="primary" onClick={startNewRequest}>
              Nova Visita
            </Button>
          </div>
        ) : (
          visitReports.map((report) => (
            <div key={report.id} className="visitas-request-item">
              <div className="visitas-request-info">
                <h3>{report.title}</h3>
                <div className="visitas-request-meta">
                  <span
                    className={`visitas-status visitas-status-${report.status}`}
                  >
                    {report.status === "scheduled" && (
                      <>
                        <FiClock size={16} />
                        Agendada
                      </>
                    )}
                    {report.status === "awaiting-report" && (
                      <>
                        <FiEdit3 size={16} />
                        Aguardando Relatório
                      </>
                    )}
                    {report.status === "cancelled" && (
                      <>
                        <FiX size={16} />
                        Cancelada
                      </>
                    )}
                    {report.status === "completed" && (
                      <>
                        <FiCheck size={16} />
                        Concluída
                      </>
                    )}
                  </span>
                  <span className="visitas-date">
                    {new Date(report.scheduledDate).toLocaleDateString()}
                  </span>
                  <span className="visitas-salesperson">
                    <FiUsers size={16} />
                    {report.salesperson}
                  </span>
                </div>
              </div>
              <div className="visitas-request-actions">
                {report.canMutate && (
                  <Button
                    variant="secondary"
                    onClick={() => handleEditReport(report)}
                    className="visitas-action-button"
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => handleViewComments(report)}
                  className="visitas-action-button"
                >
                  <FiMessageCircle size={16} />({report.comments.length})
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleExportPDF(report)}
                  className="visitas-action-button"
                >
                  <FiFile size={16} />
                  PDF
                </Button>
                {report.canMutate && (
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteReport(report.id)}
                    className="visitas-action-button visitas-delete"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Renderizar comentários
  const renderComments = () => (
    <div className="visitas-comments-container">
      <div className="visitas-comments-header">
        <h2>Comentários - {selectedReport?.title}</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("history")}
          className="visitas-back-to-history"
        >
          <FiArrowLeft size={16} />
          Voltar ao Histórico
        </Button>
      </div>

      <div className="visitas-comments-content">
        <div className="visitas-add-comment-section">
          <h3>Adicionar Comentário</h3>
          <div className="visitas-comment-form">
            <textarea
              className="visitas-comment-textarea"
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <Button
              variant="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="visitas-add-comment-button"
            >
              <FiPlus size={16} />
              Adicionar Comentário
            </Button>
          </div>
        </div>

        <div className="visitas-comments-list">
          <h3>Comentários ({selectedReport?.comments.length || 0})</h3>
          {selectedReport?.comments.length === 0 ? (
            <div className="visitas-no-comments">
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            selectedReport?.comments.map((comment) => (
              <div key={comment.id} className="visitas-comment-item">
                <div className="visitas-comment-header">
                  <div className="visitas-comment-author">
                    <strong>{comment.author}</strong>
                    <span className="visitas-comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()} às{" "}
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      comment.id && handleDeleteComment(comment.id)
                    }
                    className="visitas-delete-comment-button"
                  >
                    <FiTrash2 size={16} />
                  </Button>
                </div>
                <div className="visitas-comment-text">{comment.text}</div>
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
      <div className="visitas-progress-container">
        <div className="visitas-progress-bar">
          <div
            className="visitas-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="visitas-progress-text">
          Seção {currentSection + 1} de {sections.length}:{" "}
          {sections[currentSection]}
        </span>
      </div>

      {/* Form Content */}
      <div className="visitas-form-container">
        <Card
          variant="service"
          className="visitas-form-card"
          title=""
          textColor="#1e293b"
        >
          <div className="visitas-form-header">
            <h2 className="visitas-form-title">
              {viewMode === "edit" ? "EDITAR VISITA" : "RELATÓRIO DE VISITAS"}
            </h2>
            <p className="visitas-form-subtitle">
              Preencha todas as informações da visita
            </p>
          </div>

          <div className="visitas-form-content">
            <div className="visitas-section-title">
              <h3>{sections[currentSection]}</h3>
            </div>

            <div className="visitas-questions-container">
              {isReportFlow && sections[currentSection] === "Dados da Visita" && (
                <div className="visitas-form-question">
                  <label className="visitas-question-label">
                    Workflow obrigatório da visita (provas)
                  </label>
                  <div className="visitas-question-instruction">
                    Ordem: <strong>Check-in → Foto → Relato → Check-out</strong>. Sem isso, o relatório não pode ser concluído.
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={!canCheckIn || loading}
                      onClick={() => void handleCheckIn()}
                    >
                      Check-in (GPS)
                    </Button>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canUploadPhoto || loading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleAddPhoto(f);
                          e.currentTarget.value = "";
                        }}
                      />
                      <span style={{ fontSize: 13, opacity: 0.85 }}>
                        {visitPhotos.length} foto(s)
                      </span>
                    </label>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={!canCheckOut || loading}
                      onClick={() => void handleCheckOut()}
                    >
                      Check-out (GPS)
                    </Button>
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.9 }}>
                    <div>
                      <strong>Check-in:</strong>{" "}
                      {checkInAt ? new Date(checkInAt).toLocaleString() : "—"}
                    </div>
                    <div>
                      <strong>Check-out:</strong>{" "}
                      {checkOutAt ? new Date(checkOutAt).toLocaleString() : "—"}
                    </div>
                    {!workflowOk && (
                      <div style={{ marginTop: 8, color: "#d97706" }}>
                        Para concluir: registre check-in/out e envie pelo menos 1 foto.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentQuestions.length > 0 ? (
                <>
                  {sections[currentSection] === "Confirmação" && (
                    <div className="visitas-confirmation-message">
                      <p>
                        Confirme abaixo sua solicitação em breve você terá um
                        retorno por e-mail.
                      </p>
                    </div>
                  )}
                  {sections[currentSection] === "Instruções para Relatório" && (
                    <div className="visitas-instruction-message">
                      <h4>TODA VISITA PRECISA TER UMA SOLICITAÇÃO PRÉVIA</h4>
                      <p>
                        Faça a solicitação de Visita para preencher o relatório
                        da mesma. É necessário ter o ID da solicitação para
                        preencher o relatório, acesse o link novamente e faça a
                        solicitação.
                      </p>
                    </div>
                  )}
                  {currentQuestions.map(renderQuestion)}
                </>
              ) : currentSection > 1 && !formData.q6 ? (
                <div className="visitas-placeholder-message">
                  <p>
                    ⚠️ Por favor, volte à seção "Geral" e selecione a ação que
                    deseja realizar.
                  </p>
                  <p>
                    Escolha entre "Solicitar uma nova visita" ou "Fazer o
                    relatório de uma visita realizada".
                  </p>
                </div>
              ) : (
                <div className="visitas-placeholder-message">
                  <p>
                    As perguntas desta seção serão adicionadas quando
                    fornecidas.
                  </p>
                  <p>
                    Estrutura preparada para 30 perguntas distribuídas em{" "}
                    {sections.length} seções.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="visitas-form-navigation">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="visitas-nav-button"
            >
              <FiChevronLeft size={16} />
              Anterior
            </Button>

            <div className="visitas-section-indicators">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`visitas-section-dot ${
                    index === currentSection ? "active" : ""
                  } ${index < currentSection ? "completed" : ""}`}
                  onClick={() => setCurrentSection(index)}
                />
              ))}
            </div>

            <div className="visitas-form-actions">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                className="visitas-nav-button"
              >
                <FiSave size={16} />
                Salvar Rascunho
              </Button>

              {currentSection === sections.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={
                    viewMode === "edit" ? handleUpdateReport : handleSubmit
                  }
                  className="visitas-nav-button visitas-submit-button"
                  disabled={loading || (isReportFlow && !workflowOk)}
                >
                  {viewMode === "edit" ? (
                    <FiUpload size={16} />
                  ) : (
                    <FiCalendar size={16} />
                  )}
                  {viewMode === "edit" ? "Atualizar" : "Agendar Visita"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="visitas-nav-button"
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
    <div className="visitas-container">
      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px 50px",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e40af",
            }}
          >
            Carregando...
          </div>
        </div>
      )}

      {/* Header */}
      <div className="visitas-header">
        <div className="visitas-header-inner">
          <div className="visitas-header-left">
            <div className="visitas-header-menu">
              <Button
                variant="secondary"
                className="visitas-back-button"
                onClick={handleBack}
              >
                <FiArrowLeft size={16} />
                Voltar
              </Button>
              <Breadcrumb
                compact
                className="visitas-header-breadcrumb"
                items={[
                  { label: "Acesso Exclusivo", to: paths.acessoExclusivo },
                  { label: "Relatório de Visitas" },
                ]}
              />
            </div>
          </div>
          <div className="visitas-company-brand">
            <h1 className="visitas-company-title">RELATÓRIO DE VISITAS</h1>
            <span className="visitas-company-subtitle">
              Gestão de visitas técnicas e comerciais
            </span>
            <div className="visitas-company-underline"></div>
          </div>
          <div className="visitas-header-spacer"></div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {viewMode === "schedule" && renderSchedule()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "comments" && renderComments()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}

      {/* Footer */}
      <div className="visitas-watermark" aria-hidden="true">
        HIDRODEMA
      </div>
    </div>
  );
}
