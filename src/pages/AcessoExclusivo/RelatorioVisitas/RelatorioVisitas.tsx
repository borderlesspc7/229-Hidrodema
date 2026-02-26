import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
import LoadingScreen from "../../../components/ui/LoadingScreen/LoadingScreen";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import {
  FiCalendar,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiEdit3,
  FiMessageCircle,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiArrowLeft,
  FiList,
} from "react-icons/fi";
import "./RelatorioVisitas.css";
import {
  createVisitRequest,
  createVisitReport,
  getAllVisitRequests,
  getAllVisitReports,
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
} from "../../../services/visitasService";
import {
  validateRequired,
  validateCNPJ,
  validateDate,
  sanitizeForDatabase,
} from "../../../utils/validation";
import { pluralize } from "../../../utils/pluralize";
import { jsPDF } from "jspdf";

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

const VISITAS_DRAFT_KEY = "hidrodema_relatorio_visitas_draft";

// Interface local combinada para exibição
export interface DisplayVisit {
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
}

export default function RelatorioVisitas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || user?.email || "Usuário";
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [visitReports, setVisitReports] = useState<DisplayVisit[]>([]);
  const [editingReport, setEditingReport] = useState<DisplayVisit | null>(null);
  const [selectedReport, setSelectedReport] = useState<DisplayVisit | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedRequest, setLoadedRequest] = useState<VisitRequest | null>(null);
  const [availableRequests, setAvailableRequests] = useState<VisitRequest[]>(
    [],
  );

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
    // Seção 2: Geral — escolha do fluxo (solicitação ou relatório)
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

  // Determinar seções ativas baseadas na escolha do usuário (aceita formData opcional para restauração de rascunho)
  const getActiveSectionsFromData = (data: FormData) => {
    const selectedAction = data.q6 as string;
    if (selectedAction === "Solicitar uma nova visita") {
      return solicitacaoSections;
    }
    if (selectedAction === "Fazer o relatório de uma visita realizada") {
      return relatorioSections;
    }
    return ["Informações Regionais e Vendedores", "Geral"];
  };

  const getActiveSections = () => getActiveSectionsFromData(formData);

  const sections = getActiveSections();

  // Carregar dados do Firebase
  const loadVisitData = async () => {
    try {
      setLoading(true);

      // Carregar solicitações
      const requests = await getAllVisitRequests();

      // Carregar relatórios
      const reports = await getAllVisitReports();

      // Filtrar solicitações que ainda não têm relatório (disponíveis para fazer relatório)
      const requestsWithoutReport = requests.filter((req) => !req.hasReport);
      setAvailableRequests(requestsWithoutReport);

      // Combinar para exibição
      const displayData: DisplayVisit[] = [
        ...requests.map((req) => ({
          id: req.id || "",
          requestId: req.requestId,
          title: `${req.clientName} - ${new Date(
            req.visitDate,
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
        })),
        ...reports.map((rep) => ({
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
        })),
      ];

      setVisitReports(displayData);
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
      (req) => req.requestId === requestId,
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
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Se mudou a seleção de ação (q6), ajustar seção atual
    if (questionId === "q6") {
      setLoadedRequest(null);
      const action = value as string;
      if (action === "Fazer o relatório de uma visita realizada") {
        setCurrentSection(0); // primeira seção do fluxo relatório
      } else {
        setCurrentSection(1); // manter na seção "Geral" para solicitação
      }
    }

    // Se selecionou uma solicitação no dropdown, carregar os dados
    if (
      (questionId === "q19" || questionId === "q21") &&
      typeof value === "string"
    ) {
      loadRequestFromSelect(value);
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

      if (!selectedAction) {
        const draft = { formData: { ...formData }, currentSection };
        localStorage.setItem(VISITAS_DRAFT_KEY, JSON.stringify(draft));
        alert(
          "Rascunho salvo localmente. Selecione uma ação na seção \"Geral\" (Solicitar visita ou Fazer relatório) e depois use \"Salvar Rascunho\" ou \"Agendar Visita\" para enviar ao sistema.",
        );
        return;
      }

      if (selectedAction === "Fazer o relatório de uma visita realizada") {
        const draft = { formData: { ...formData }, currentSection };
        localStorage.setItem(VISITAS_DRAFT_KEY, JSON.stringify(draft));
        alert(
          "Rascunho do relatório salvo localmente. Preencha todos os campos e use \"Enviar Relatório\" para salvar no sistema.",
        );
        await loadVisitData();
        return;
      }

      if (selectedAction === "Solicitar uma nova visita") {
        const requestId = generateRequestId();

        await createVisitRequest(
          sanitizeForDatabase({
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
              (formData.q15 as string) ||
              new Date().toISOString().split("T")[0],
            visitPeriod: (formData.q16 as string) || "",
            responsibleSalesperson: (formData.q17 as string) || "",
            status: "pending",
            hasReport: false,
            formData: { ...formData },
          }),
        );

        alert(
          `Rascunho de solicitação salvo com sucesso!\nID da Solicitação: ${requestId}\n\nGuarde este ID para fazer o relatório posteriormente.`,
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
      const selectedAction = formData.q6 as string;

      // Validações
      const errors: string[] = [];

      // Validar ação selecionada
      if (!selectedAction) {
        errors.push(
          "Selecione uma ação (Solicitar visita ou Registrar relatório)",
        );
      }

      if (selectedAction === "Solicitar uma nova visita") {
        // Validações específicas para solicitação
        const clientNameValue = Array.isArray(formData.q7)
          ? formData.q7[0]
          : formData.q7;
        const clientNameValidation = validateRequired(
          clientNameValue,
          "Nome do cliente",
        );
        if (!clientNameValidation.valid)
          errors.push(clientNameValidation.error!);

        if (formData.q8) {
          const cnpjValidation = validateCNPJ(formData.q8 as string, false);
          if (!cnpjValidation.valid) errors.push(cnpjValidation.error!);
        }

        if (formData.q15) {
          const dateValidation = validateDate(
            formData.q15 as string,
            "Data da visita",
            false,
          );
          if (!dateValidation.valid) errors.push(dateValidation.error!);
        }
      }

      // Se houver erros, mostrar e parar
      if (errors.length > 0) {
        alert(`Erros de validação:\n\n${errors.join("\n")}`);
        setLoading(false);
        return;
      }

      if (selectedAction === "Solicitar uma nova visita") {
        // Criar nova solicitação
        const requestId = generateRequestId();

        await createVisitRequest(
          sanitizeForDatabase({
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
              (formData.q15 as string) ||
              new Date().toISOString().split("T")[0],
            visitPeriod: (formData.q16 as string) || "",
            responsibleSalesperson: (formData.q17 as string) || "",
            status: "scheduled",
            hasReport: false,
            formData: { ...formData },
          }),
        );

        alert(
          `Solicitação de visita criada com sucesso!\nID da Solicitação: ${requestId}\n\nGuarde este ID para fazer o relatório posteriormente.`,
        );
      } else if (
        selectedAction === "Fazer o relatório de uma visita realizada"
      ) {
        // Criar relatório vinculado à solicitação
        const requestId = (formData.q19 || formData.q21) as string;

        if (!requestId) {
          alert(
            "É necessário informar o ID da solicitação para criar o relatório.",
          );
          return;
        }

        await createVisitReport({
          requestId,
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
          formData: { ...formData },
        });

        alert("Relatório de visita criado com sucesso!");
      }

      await loadVisitData();
      localStorage.removeItem(VISITAS_DRAFT_KEY);
      setViewMode("menu");
      setFormData({});
      setCurrentSection(0);
      setLoadedRequest(null);
    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = (report: DisplayVisit) => {
    setEditingReport(report);
    setFormData(report.formData);
    setViewMode("edit");
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    try {
      setLoading(true);

      if (editingReport.isRequest) {
        // Atualizar solicitação
        await updateVisitRequest(editingReport.id, {
          formData: { ...formData },
        });
      } else {
        // Atualizar relatório
        await updateVisitReport(editingReport.id, {
          formData: { ...formData },
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
    newStatus: DisplayVisit["status"],
  ) => {
    const report = visitReports.find((r) => r.id === reportId);
    if (!report || !report.isRequest) return;

    setVisitReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: newStatus } : r,
      ),
    );

    try {
      await updateVisitRequest(reportId, {
        status: newStatus as VisitRequest["status"],
      });
      await loadVisitData();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      setVisitReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: report.status } : r)),
      );
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  const handleExportPDF = async (report: DisplayVisit) => {
    const loadImage = (src: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } else reject(new Error("Canvas context"));
        };
        img.onerror = () => reject(new Error("Falha ao carregar logo"));
        img.src = src;
      });

    try {
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const margin = 18;
      const pageW = doc.internal.pageSize.getWidth();
      let y = margin;

      const logoUrl = "/HIDRODEMA_LogoNovo_Verde.png";
      try {
        const logoData = await loadImage(logoUrl);
        const logoWidth = 48;
        const logoHeight = 14;
        doc.addImage(logoData, "PNG", pageW / 2 - logoWidth / 2, y, logoWidth, logoHeight);
        y += logoHeight + 10;
      } catch {
        doc.setFontSize(18);
        doc.setTextColor(0, 82, 155);
        doc.text("HIDRODEMA®", pageW / 2, y + 6, { align: "center" });
        y += 16;
      }

      doc.setDrawColor(0, 82, 155);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 12;

      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.setFont("helvetica", "bold");
      doc.text("RELATÓRIO DE VISITA", pageW / 2, y, { align: "center" });
      y += 14;

      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${report.client || "—"}`, margin, y);
      y += 7;
      if (report.requestId) {
        doc.text(`ID Solicitação: ${report.requestId}`, margin, y);
        y += 7;
      }
      doc.text(
        `Data: ${new Date(report.scheduledDate).toLocaleDateString("pt-BR")}`,
        margin,
        y,
      );
      y += 7;
      doc.text(`Vendedor: ${report.salesperson || "—"}`, margin, y);
      y += 14;

      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.setFont("helvetica", "bold");
      doc.text("Dados da visita", margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "normal");

      const entries = Object.entries(report.formData);
      for (const [key, value] of entries) {
        const text = `${key}: ${Array.isArray(value) ? value.join(", ") : value ?? ""}`;
        const lines = doc.splitTextToSize(text, pageW - 2 * margin);
        if (y + lines.length * 5 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      }

      const safeName = (report.client || "relatorio").replace(/[^a-zA-Z0-9\u00C0-\u00FF\s-]/g, "");
      const dateStr = new Date(report.scheduledDate).toISOString().slice(0, 10);
      doc.save(`Relatorio_Visita_${safeName}_${dateStr}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF. Tente novamente.");
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

  const handleCreateReportFromRequest = (request: DisplayVisit) => {
    // Preencher o formulário com os dados da solicitação
    setFormData({
      ...(request.formData || {}),
      q6: "Fazer o relatório de uma visita realizada",
      q19: request.requestId || "",
      q21: request.requestId || "",
      q22: request.client,
      q23: request.scheduledDate,
    });

    // Definir a solicitação carregada
    const visitRequest = availableRequests.find(
      (req) => req.requestId === request.requestId,
    );
    if (visitRequest) {
      setLoadedRequest(visitRequest);
    }

    // Ir para o modo de criação de relatório, começando na seção de Instruções
    setViewMode("new");
    setCurrentSection(0); // Primeira seção do relatório
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigate("/acesso-exclusivo");
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
      case "text": {
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

        // Detecta tipos especiais de campo
        const isCNPJField = question.question.toLowerCase().includes("cnpj");
        const isCPFField = question.question.toLowerCase().includes("cpf");
        const isPhoneField =
          question.question.toLowerCase().includes("celular") ||
          question.question.toLowerCase().includes("telefone");

        let mask: "phone" | "cnpj" | "cpf" | "cpfcnpj" | undefined = undefined;
        let placeholder = question.placeholder || "Digite sua resposta";

        if (isCNPJField) {
          mask = "cnpj";
          placeholder = "00.000.000/0000-00";
        } else if (isCPFField) {
          mask = "cpf";
          placeholder = "000.000.000-00";
        } else if (isPhoneField) {
          mask = "phone";
          placeholder = "(11) 99999-9999";
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
              placeholder={placeholder}
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
              mask={mask}
            />
          </div>
        );
      }
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
              placeholder=""
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
            <div className="visitas-options-container">
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
                          currentValues.filter((v) => v !== option),
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
    (q) => q.section === sections[currentSection],
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Carregar dados na inicialização
  useEffect(() => {
    loadVisitData();
  }, []);

  // Restaurar rascunho local ao abrir o formulário (apenas quando está vazio; não sobrescreve se veio de "Fazer relatório" de uma solicitação)
  useEffect(() => {
    if (viewMode !== "new" || editingReport) return;
    if (Object.keys(formData).length > 0) return;
    try {
      const raw = localStorage.getItem(VISITAS_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        formData: FormData;
        currentSection: number;
      };
      if (!draft.formData || Object.keys(draft.formData).length === 0) return;
      const sections = getActiveSectionsFromData(draft.formData);
      const safeSection = Math.min(
        Math.max(0, draft.currentSection),
        sections.length - 1,
      );
      setFormData(draft.formData);
      setCurrentSection(safeSection);
    } catch {
      // ignorar dados inválidos
    }
  }, [viewMode]);

  // Renderizar menu principal
  const renderMenu = () => (
    <div className="visitas-menu-container">
      <div className="visitas-menu-cards">
        <Card
          variant="service"
          title="NOVA SOLICITAÇÃO"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="visitas-menu-card"
          onClick={() => setViewMode("new")}
        >
          <div className="visitas-menu-card-content">
            <div className="visitas-menu-icon">
              <FiCalendar size={48} />
            </div>
            <p>Agendar nova visita técnica ou comercial</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="PLANILHA DE VISITAS"
          textColor="#059669"
          backgroundColor="#f0fdf4"
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
              {pluralize(visitReports.length, "visita", "visitas")}
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="HISTÓRICO"
          textColor="#7c3aed"
          backgroundColor="#faf5ff"
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

  // Renderizar planilha interativa de visitas (tabela estruturada)
  const renderSchedule = () => (
    <div className="visitas-planilha-container">
      <div className="visitas-planilha-header">
        <h2 className="visitas-planilha-title">Planilha de Visitas</h2>
        <p className="visitas-planilha-subtitle">
          Consultar agenda e status das visitas
        </p>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="visitas-planilha-back"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      {visitReports.length === 0 ? (
        <div className="visitas-planilha-empty">
          <div className="visitas-planilha-empty-icon">
            <FiCalendar size={64} />
          </div>
          <h3>Nenhuma visita cadastrada</h3>
          <p>Crie uma nova solicitação ou consulte o histórico.</p>
          <Button variant="primary" onClick={() => setViewMode("new")}>
            Nova Solicitação
          </Button>
        </div>
      ) : (
        <div className="visitas-planilha-wrapper">
          <table className="visitas-planilha-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Vendedor</th>
                <th scope="col">Data</th>
                <th scope="col">Tipo</th>
                <th scope="col">Status</th>
                <th scope="col" className="visitas-planilha-col-actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {visitReports.map((report) => (
                <tr key={report.id}>
                  <td data-label="Cliente">{report.client || "—"}</td>
                  <td data-label="Vendedor">{report.salesperson || "—"}</td>
                  <td data-label="Data">
                    {new Date(report.scheduledDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td data-label="Tipo">
                    {report.visitType === "technical" ? "Técnica" : "Comercial"}
                  </td>
                  <td data-label="Status">
                    {report.isRequest ? (
                      <select
                        className={`visitas-planilha-status status-${report.status}`}
                        value={report.status}
                        onChange={(e) =>
                          handleChangeStatus(
                            report.id,
                            e.target.value as DisplayVisit["status"],
                          )
                        }
                        aria-label="Alterar status"
                      >
                        <option value="pending">Pendente</option>
                        <option value="scheduled">Agendada</option>
                        <option value="awaiting-report">
                          Aguardando Relatório
                        </option>
                        <option value="cancelled">Cancelada</option>
                        <option value="completed">Concluída</option>
                      </select>
                    ) : (
                      <span className={`visitas-planilha-badge status-${report.status}`}>
                        Concluída
                      </span>
                    )}
                  </td>
                  <td data-label="Ações" className="visitas-planilha-actions">
                    {report.isRequest && !report.hasReport && (
                      <Button
                        variant="primary"
                        onClick={() => handleCreateReportFromRequest(report)}
                        className="visitas-planilha-btn"
                        title="Fazer relatório"
                      >
                        Relatório
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleEditReport(report)}
                      className="visitas-planilha-btn"
                      title="Editar"
                    >
                      <FiEdit3 size={14} />
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleExportPDF(report)}
                      className="visitas-planilha-btn"
                      title="Gerar PDF"
                    >
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Agrupar histórico por data (mais recente primeiro) para exibição estruturada
  const historyGroupedByDate = ((): { dateLabel: string; items: DisplayVisit[] }[] => {
    const sorted = [...visitReports].sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime(),
    );
    const byDate = new Map<string, DisplayVisit[]>();
    for (const item of sorted) {
      const key = new Date(item.scheduledDate).toLocaleDateString("pt-BR");
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(item);
    }
    return Array.from(byDate.entries()).map(([dateLabel, items]) => ({
      dateLabel,
      items,
    }));
  })();

  // Renderizar histórico em tabela completa: agrupado por data, rótulos claros nas ações
  const renderHistory = () => (
    <div className="visitas-planilha-container visitas-historial-container">
      <div className="visitas-planilha-header">
        <h2 className="visitas-planilha-title">Histórico de Visitas</h2>
        <p className="visitas-planilha-subtitle">
          Relatórios e solicitações técnicas e comerciais
        </p>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="visitas-planilha-back"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      {visitReports.length === 0 ? (
        <div className="visitas-planilha-empty">
          <div className="visitas-planilha-empty-icon">
            <FiMapPin size={64} />
          </div>
          <h3>Nenhum registro encontrado</h3>
          <p>Crie uma nova solicitação para começar.</p>
          <Button variant="primary" onClick={() => setViewMode("new")}>
            Nova Solicitação
          </Button>
        </div>
      ) : (
        <div className="visitas-planilha-wrapper">
          <table className="visitas-planilha-table visitas-planilha-table--history">
            <thead>
              <tr>
                <th scope="col">Registro</th>
                <th scope="col">Cliente / Identificador</th>
                <th scope="col">Vendedor</th>
                <th scope="col">Data</th>
                <th scope="col">Tipo</th>
                <th scope="col">Status</th>
                <th scope="col" className="visitas-planilha-col-actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {historyGroupedByDate.flatMap(({ dateLabel, items }) => [
                <tr
                  key={`group-${dateLabel}`}
                  className="visitas-history-group-row"
                >
                  <td colSpan={7} data-label="">
                    <span className="visitas-history-group-label">
                      <FiCalendar size={16} aria-hidden />
                      Concluída em {dateLabel}
                    </span>
                  </td>
                </tr>,
                ...items.map((report) => (
                    <tr key={report.id}>
                      <td data-label="Registro">
                        <span
                          className={`visitas-planilha-badge visitas-planilha-badge--${
                            report.isRequest
                              ? report.hasReport
                                ? "relatorio-ok"
                                : "aguardando"
                              : "relatorio"
                          }`}
                        >
                          {report.isRequest
                            ? report.hasReport
                              ? "Relatório concluído"
                              : "Aguardando relatório"
                            : "Relatório"}
                        </span>
                      </td>
                      <td data-label="Cliente">
                        {report.client || report.title || "—"}
                      </td>
                      <td data-label="Vendedor">{report.salesperson || "—"}</td>
                      <td data-label="Data">
                        {new Date(
                          report.scheduledDate,
                        ).toLocaleDateString("pt-BR")}
                      </td>
                      <td data-label="Tipo">
                        {report.visitType === "technical"
                          ? "Técnica"
                          : "Comercial"}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`visitas-planilha-badge status-${report.status}`}
                        >
                          {report.status === "pending" && "Pendente"}
                          {report.status === "scheduled" && "Agendada"}
                          {report.status === "awaiting-report" &&
                            "Aguardando Relatório"}
                          {report.status === "cancelled" && "Cancelada"}
                          {report.status === "completed" && "Concluída"}
                        </span>
                      </td>
                      <td
                        data-label="Ações"
                        className="visitas-planilha-actions visitas-history-actions"
                      >
                        {report.isRequest && !report.hasReport && (
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleCreateReportFromRequest(report)
                            }
                            className="visitas-planilha-btn"
                            title="Fazer relatório"
                          >
                            Relatório
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => handleEditReport(report)}
                          className="visitas-planilha-btn"
                          title="Editar"
                        >
                          <FiEdit3 size={14} />
                          Editar
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleViewComments(report)}
                          className="visitas-planilha-btn"
                          title="Comentários"
                        >
                          <FiMessageCircle size={14} />
                          Comentários ({report.comments.length})
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleExportPDF(report)}
                          className="visitas-planilha-btn"
                          title="Gerar PDF"
                        >
                          PDF
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDeleteReport(report.id)}
                          className="visitas-planilha-btn visitas-planilha-btn--danger"
                          title="Excluir"
                        >
                          <FiTrash2 size={14} />
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  )),
              ])}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Renderizar comentários — layout completo e formatado
  const renderComments = () => (
    <div className="visitas-comments-container">
      <header className="visitas-comments-header">
        <div className="visitas-comments-header-text">
          <h1 className="visitas-comments-title">Comentários</h1>
          <p className="visitas-comments-subtitle">{selectedReport?.title}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setViewMode("history")}
          className="visitas-back-to-history"
        >
          <FiArrowLeft size={16} />
          Voltar ao Histórico
        </Button>
      </header>

      <div className="visitas-comments-content">
        <section className="visitas-add-comment-section" aria-label="Novo comentário">
          <h2 className="visitas-add-comment-title">Adicionar Comentário</h2>
          <p className="visitas-add-comment-desc">
            Escreva sua observação sobre esta visita. Ela ficará registrada com sua identificação e data.
          </p>
          <div className="visitas-comment-form">
            <textarea
              className="visitas-comment-textarea"
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={5}
              minLength={1}
              aria-label="Texto do comentário"
            />
            <div className="visitas-comment-form-actions">
              <Button
                variant="primary"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="visitas-add-comment-button"
              >
                <FiPlus size={18} />
                Adicionar Comentário
              </Button>
            </div>
          </div>
        </section>

        <section className="visitas-comments-list" aria-label="Lista de comentários">
          <h2 className="visitas-comments-list-title">
            Comentários
            <span className="visitas-comments-count">
              {selectedReport?.comments.length || 0}
            </span>
          </h2>
          {!selectedReport?.comments.length ? (
            <div className="visitas-no-comments">
              <div className="visitas-no-comments-icon" aria-hidden>
                <FiMessageCircle size={48} />
              </div>
              <p className="visitas-no-comments-title">Nenhum comentário ainda</p>
              <p className="visitas-no-comments-desc">
                Seja o primeiro a comentar sobre esta visita.
              </p>
            </div>
          ) : (
            <ol className="visitas-comments-list-inner">
              {selectedReport?.comments.map((comment) => (
                <li key={comment.id} className="visitas-comment-item">
                  <div className="visitas-comment-item-avatar" aria-hidden>
                    {getInitials(comment.author)}
                  </div>
                  <div className="visitas-comment-item-body">
                    <div className="visitas-comment-header">
                      <div className="visitas-comment-author">
                        <strong className="visitas-comment-author-name">{comment.author}</strong>
                        <span className="visitas-comment-date">
                          {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}{" "}
                          às{" "}
                          {new Date(comment.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          comment.id && handleDeleteComment(comment.id)
                        }
                        className="visitas-delete-comment-button"
                      >
                        <FiTrash2 size={14} />
                      </Button>
                    </div>
                    <div className="visitas-comment-text">{comment.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
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
                >
                  {viewMode === "edit" ? (
                    <FiSave size={16} />
                  ) : formData.q6 ===
                    "Fazer o relatório de uma visita realizada" ? (
                    <FiCheck size={16} />
                  ) : (
                    <FiCalendar size={16} />
                  )}
                  {viewMode === "edit"
                    ? "Atualizar"
                    : formData.q6 ===
                        "Fazer o relatório de uma visita realizada"
                      ? "Enviar Relatório"
                      : "Agendar Visita"}
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
      {loading && <LoadingScreen message="Processando..." />}

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* 'Header' */}
      <div className="visitas-header">
        <Button
          variant="secondary"
          className="visitas-back-button"
          onClick={handleBack}
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="visitas-company-brand">
          <h1 className="visitas-company-title">RELATÓRIO DE VISITAS</h1>
          <span className="visitas-company-subtitle">
            Gestão de visitas técnicas e comerciais
          </span>
          <div className="visitas-company-underline"></div>
        </div>
        <div className="visitas-header-spacer "></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {viewMode === "schedule" && renderSchedule()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "comments" && renderComments()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}

      {/* Footer */}
      <div className="visitas-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="visitas-footer-logo"
        />
      </div>
    </div>
  );
}
