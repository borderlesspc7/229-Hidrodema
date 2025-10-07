import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import Input from "../../../components/ui/Input/Input";
import {
  FiArrowLeft,
  FiPlus,
  FiClock,
  FiList,
  FiEdit3,
  FiTrash2,
  FiFile,
  FiMessageCircle,
  FiSend,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiUpload,
  FiFileText,
  FiSettings,
  FiX,
} from "react-icons/fi";
import "./EqualizadorServicos.css";

// Interfaces
interface FormData {
  [key: string]: string | string[];
}

interface Question {
  id: string;
  type:
    | "text"
    | "textarea"
    | "radio"
    | "checkbox"
    | "select"
    | "date"
    | "time"
    | "responsibility-matrix";
  question: string;
  options?: string[];
  required?: boolean;
  section?: string;
  instruction?: string;
  placeholder?: string;
  matrix?: { item: string; key: string }[];
  columns?: string[];
}

type ViewMode = "menu" | "new" | "history" | "edit" | "comments" | "quotations";

interface ServiceMDS {
  id: string;
  number: string;
  client: string;
  project: string;
  status: "awaiting-quotes" | "open" | "lost" | "completed";
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  comments?: Comment[];
  quotations?: Quotation[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface Quotation {
  id: string;
  provider: string;
  value: number;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const EqualizadorServicos = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [serviceMDS, setServiceMDS] = useState<ServiceMDS[]>([]);
  const [editingService, setEditingService] = useState<ServiceMDS | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceMDS | null>(
    null
  );
  const [newComment, setNewComment] = useState("");

  // Estrutura preparada para receber perguntas do formulário MDS
  const questions: Question[] = [
    // Seção 1: Informações da Obra
    {
      id: "q1",
      type: "text",
      question: "1. Cliente",
      section: "Informações da Obra",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q2",
      type: "text",
      question: "2. Local da obra",
      section: "Informações da Obra",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q3",
      type: "date",
      question: "3. Data de emissão da visita",
      section: "Informações da Obra",
      required: true,
      placeholder: "Insira a data (dd/MM/yyyy)",
    },
    {
      id: "q4",
      type: "radio",
      question: "4. Responsável técnico HIDRODEMA",
      section: "Informações da Obra",
      required: true,
      options: [
        "Enrique Casa Vechia - projetos@hidrodema.com.br - 11 99294-4001",
        "Eduardo Zoéga - engenharia@hidrodema.com.br - 11 98311-3449",
        "Eduardo Amaral - engenharia2@hidrodema.com.br - 11 95428-5116",
      ],
    },
    // Seção 2: Escopo de Fornecimento
    {
      id: "q5",
      type: "textarea",
      question: "5. Descrição do serviço",
      section: "Escopo de Fornecimento",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q6",
      type: "checkbox",
      question: "6. Material das tubulações a ser instalada",
      section: "Escopo de Fornecimento",
      required: true,
      options: ["PVC-U", "CPVC", "PPR", "Outra"],
    },
    {
      id: "q7",
      type: "checkbox",
      question: "7. Diâmetro das Tubulações",
      section: "Escopo de Fornecimento",
      required: true,
      options: ['1/2" a 2"', '2.1/2" a 4"', '6" a 8"', '10" a 14"'],
    },
    {
      id: "q8",
      type: "text",
      question: "8. Comprimento aproximado das tubulações",
      section: "Escopo de Fornecimento",
      required: true,
      placeholder: "Insira sua resposta",
      instruction:
        '1/2" a 2" - xxx metros\n2.1/2" a 4" - xxx metros\n6" a 8" - xxx metros\n10" a 14" - xxx metros',
    },
    {
      id: "q9",
      type: "radio",
      question: "9. Tipo de instalação",
      section: "Escopo de Fornecimento",
      required: true,
      options: ["Nova", "Retrofit"],
    },
    {
      id: "q10",
      type: "radio",
      question: "10. Área da Instalação",
      section: "Escopo de Fornecimento",
      required: true,
      options: ["Externa", "Interna", "Interno e externo"],
    },
    {
      id: "q11",
      type: "checkbox",
      question: "11. Instalação",
      section: "Escopo de Fornecimento",
      required: true,
      options: [
        "Parede",
        "Pipe rack",
        "Canaleta",
        "Enterrado",
        "Suporte metálico suspenso",
        "Outra",
      ],
    },
    {
      id: "q12",
      type: "checkbox",
      question: "12. Altura das Tubulações",
      section: "Escopo de Fornecimento",
      required: true,
      options: ["Abaixo de 2 metros", "2 a 3 metros", "4 a 5 metros", "Outra"],
    },
    {
      id: "q13",
      type: "text",
      question: "13. Quantidade de pontos de instalação",
      section: "Escopo de Fornecimento",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q14",
      type: "text",
      question: "14. Prazo de execução",
      section: "Escopo de Fornecimento",
      required: true,
      placeholder: "Insira sua resposta",
    },
    {
      id: "q15",
      type: "checkbox",
      question: "15. Regime de Trabalho",
      section: "Escopo de Fornecimento",
      required: true,
      options: [
        "Segunda a Sexta - 8h as 17h",
        "Segunda a Sexta - 18h as 06h",
        "Finais de semana - 8h as 17h",
        "Finais de semana - 18h as 06h",
        "Outra",
      ],
    },
    // Seção 3: Quadro de Responsabilidades
    {
      id: "q16",
      type: "responsibility-matrix",
      question: "16. Aspectos Administrativos",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        { item: "Transporte (equipe)", key: "transporte" },
        { item: "Alimentação", key: "alimentacao" },
        { item: "Hospedagem", key: "hospedagem" },
        { item: "Emissão de ART", key: "art" },
        {
          item: "Fazer integração e apresentar documentação conforme exigência do cliente",
          key: "integracao",
        },
        { item: "Seguro de obra", key: "seguro" },
        { item: "Emissão de RDO", key: "rdo" },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q17",
      type: "responsibility-matrix",
      question: "17. Canteiro de Obras",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        { item: "Área para alocação de canteiro", key: "area_canteiro" },
        { item: "Energia elétrica para canteiro", key: "energia_canteiro" },
        {
          item: "Disponibilizar local seguro para guarda das ferramentas e equipamentos durante o período de serviços",
          key: "guarda_ferramentas",
        },
        {
          item: "Disponibilizar área (refeitório) para uso da equipe para alimentação",
          key: "refeitorio",
        },
        {
          item: "Fornecimento de banheiros e vestiários",
          key: "banheiros_vestiarios",
        },
        {
          item: "Água para consumo dos colaboradores da contratada",
          key: "agua_consumo",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q18",
      type: "responsibility-matrix",
      question: "18. Utilidades",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        {
          item: "Disponibilizar ponto de energia adequado para uso dos equipamentos 110V e 220V, em pontos até 30 metros da frente de serviço",
          key: "ponto_energia",
        },
        {
          item: "Quadros elétricos, painéis para alimentação de seus equipamentos com DR, e tomadas provisórias para execução dos serviços",
          key: "quadros_eletricos",
        },
        {
          item: "Isolamento das áreas de serviço",
          key: "isolamento_areas",
        },
        {
          item: "Iluminação do local",
          key: "iluminacao",
        },
        {
          item: "Rentabilizar-se pela disposição e movimentação dos equipamentos e linhas existentes",
          key: "movimentacao_equipamentos",
        },
        {
          item: "Retirada de tubulação a ser substituída",
          key: "retirada_tubulacao",
        },
        {
          item: "Descarte adequado de materiais removidos",
          key: "descarte_materiais",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q19",
      type: "responsibility-matrix",
      question: "19. Materiais e Equipamentos",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        {
          item: "Consumíveis necessários para montagem",
          key: "consumiveis_montagem",
        },
        {
          item: "Ferramentas e equipamentos necessários para corte, bisel e acoplamento da tubulação termoplástica industrial",
          key: "ferramentas_tubulacao",
        },
        {
          item: "Escadas para trabalho em altura",
          key: "escadas_altura",
        },
        {
          item: "Material de iluminação e refrigeração de espaço confinado conforme NR-33",
          key: "iluminacao_refrigeracao_nr33",
        },
        {
          item: "Posicionar e instalar todos os equipamentos que serão interligados com a tubulação (Skids, bombas, filtros, tanques etc.)",
          key: "posicionar_instalar_equipamentos",
        },
        {
          item: "Fornecer guindaste / caminhão munk para movimentação de máquinas ou tubulações",
          key: "guindaste_caminhao_munk",
        },
        {
          item: "Plataforma elevatória com diesel e/ou carregador elétrico",
          key: "plataforma_elevatoria",
        },
        {
          item: "Fornecimento de materiais e fabricação de suportes metálicos para tubulação termoplástica industrial",
          key: "fornecimento_suportes_metalicos",
        },
        {
          item: "Instalação de suportes para tubulação termoplástica industrial",
          key: "instalacao_suportes_tubulacao",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q20",
      type: "responsibility-matrix",
      question: "20. Mão de Obra e Serviços",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        {
          item: "Equipe certificada (SENAI) para instalação de tubulação termoplástica industrial",
          key: "equipe_certificada_senai",
        },
        {
          item: "Técnico para supervisão e gerenciamento de montagem",
          key: "tecnico_supervisao_montagem",
        },
        {
          item: "Técnico de segurança",
          key: "tecnico_seguranca",
        },
        {
          item: "Andaimes (material e mão de obra)",
          key: "andaimes_material_mao_obra",
        },
        {
          item: "Fornecimento de materiais de isolamento Térmico",
          key: "materiais_isolamento_termico",
        },
        {
          item: "Instalação de isolamento Térmico em tubulação termoplástica industrial",
          key: "instalacao_isolamento_termico",
        },
        {
          item: "Perfurações de paredes ou lajes, escavações ou qualquer atividade civil",
          key: "perfuracoes_escavacoes_civil",
        },
        {
          item: "Montagens e interligações elétricas",
          key: "montagens_interligacoes_eletricas",
        },
        {
          item: "Limpeza diária do local de serviços",
          key: "limpeza_diaria_servicos",
        },
        {
          item: "Serviços de Pintura de tubulação",
          key: "servicos_pintura_tubulacao",
        },
        {
          item: "Acompanhamento de comissionamento",
          key: "acompanhamento_comissionamento",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q21",
      type: "responsibility-matrix",
      question: "21. Segurança",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        {
          item: "Abertura / Fechamento da PT",
          key: "abertura_fechamento_pt",
        },
        {
          item: "Elaboração de APR",
          key: "elaboracao_apr",
        },
        {
          item: "Bloqueio / Desbloqueio de Equipamentos Rotativos e Elétricos.",
          key: "bloqueio_desbloqueio_equipamentos",
        },
        {
          item: "Isolamento, bloqueio e drenagem de tubulações em que serão realizados os serviços",
          key: "isolamento_bloqueio_drenagem",
        },
        {
          item: "EPI's (Capacete com jugular, calçado de segurança, óculos de proteção, protetor auricular, cinto de segurança com trava quedas)",
          key: "epis",
        },
        {
          item: "Fornecer EPI's especiais",
          key: "fornecer_epis_especiais",
        },
        {
          item: "Observador NR-33 (p/ trabalhos em espaço confinado).",
          key: "observador_nr33",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q22",
      type: "responsibility-matrix",
      question: "22. Aspectos de Planejamento de Qualidade",
      section: "Quadro de Responsabilidades",
      required: true,
      matrix: [
        {
          item: "Cronograma detalhado em dias dos serviços",
          key: "cronograma_detalhado_servicos",
        },
        {
          item: "Executar as atividades conforme escopo de trabalho",
          key: "executar_atividades_escopo",
        },
        {
          item: "Fornecer desenhos, projetos atualizados a serem seguidos para execução e informar responsável técnico pelo projeto.",
          key: "fornecer_desenhos_projetos",
        },
        {
          item: "Qualquer serviço ou atividade de suprimentos, inspeção e diligenciamento",
          key: "suprimentos_inspecao_diligenciamento",
        },
        {
          item: 'Emissão de projeto revisado como construído "as-built"',
          key: "emissao_projeto_as_built",
        },
        {
          item: "Emissão de relatório de entrega de obra",
          key: "emissao_relatorio_entrega_obra",
        },
      ],
      columns: ["Hidrodema", "Instaladora", "Cliente", "N/A"],
    },
    {
      id: "q23",
      type: "text",
      question: "23. LINK DE ARQUIVOS WETRANSFER / GOOGLE DRIVE",
      section: "Quadro de Responsabilidades",
      required: true,
      placeholder: "Insira sua resposta",
    },
  ];

  const sections = [
    "Informações da Obra",
    "Escopo de Fornecimento",
    "Quadro de Responsabilidades",
  ];

  // Carregar serviços MDS do localStorage
  const loadServiceMDS = () => {
    const saved = localStorage.getItem("serviceMDS");
    if (saved) {
      setServiceMDS(JSON.parse(saved));
    }
  };

  // Salvar serviços MDS no localStorage
  const saveServiceMDS = (services: ServiceMDS[]) => {
    localStorage.setItem("serviceMDS", JSON.stringify(services));
    setServiceMDS(services);
  };

  useEffect(() => {
    loadServiceMDS();
  }, []);

  // Navegação entre seções
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

  // Manipulação de dados do formulário
  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Salvar rascunho
  const handleSaveDraft = () => {
    const draftService: ServiceMDS = {
      id: editingService?.id || `MDS-${Date.now()}`,
      number: `MDS-${Date.now()}`,
      client: (formData.q1 as string) || "Cliente não informado",
      project: (formData.q2 as string) || "Local não informado",
      status: "open",
      createdAt: editingService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData,
      comments: editingService?.comments || [],
      quotations: editingService?.quotations || [],
    };

    const updatedServices = editingService
      ? serviceMDS.map((s) => (s.id === editingService.id ? draftService : s))
      : [...serviceMDS, draftService];

    saveServiceMDS(updatedServices);
    alert("Rascunho salvo com sucesso!");
  };

  // Submeter formulário
  const handleSubmit = () => {
    const newService: ServiceMDS = {
      id: editingService?.id || `MDS-${Date.now()}`,
      number: `MDS-${serviceMDS.length + 1}`,
      client: (formData.q1 as string) || "Cliente não informado",
      project: (formData.q2 as string) || "Local não informado",
      status: "awaiting-quotes",
      createdAt: editingService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData,
      comments: editingService?.comments || [],
      quotations: editingService?.quotations || [],
    };

    const updatedServices = editingService
      ? serviceMDS.map((s) => (s.id === editingService.id ? newService : s))
      : [...serviceMDS, newService];

    saveServiceMDS(updatedServices);

    alert(
      editingService ? "MDS atualizado com sucesso!" : "MDS criado com sucesso!"
    );
    setViewMode("menu");
    setFormData({});
    setEditingService(null);
    setCurrentSection(0);
  };

  // Editar serviço
  const handleEditService = (service: ServiceMDS) => {
    setEditingService(service);
    setFormData(service.formData);
    setCurrentSection(0);
    setViewMode("edit");
  };

  // Deletar serviço
  const handleDeleteService = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este MDS?")) {
      const updatedServices = serviceMDS.filter((s) => s.id !== id);
      saveServiceMDS(updatedServices);
    }
  };

  // Mudar status
  const handleChangeStatus = (id: string, status: ServiceMDS["status"]) => {
    const updatedServices = serviceMDS.map((s) =>
      s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
    );
    saveServiceMDS(updatedServices);
  };

  // Adicionar comentário
  const handleAddComment = () => {
    if (!selectedService || !newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      author: "Usuário Atual",
      createdAt: new Date().toISOString(),
    };

    const updatedServices = serviceMDS.map((s) =>
      s.id === selectedService.id
        ? { ...s, comments: [...(s.comments || []), comment] }
        : s
    );

    saveServiceMDS(updatedServices);
    setNewComment("");
    setSelectedService({
      ...selectedService,
      comments: [...(selectedService.comments || []), comment],
    });
  };

  // Deletar comentário
  const handleDeleteComment = (commentId: string) => {
    if (!selectedService) return;

    const updatedServices = serviceMDS.map((s) =>
      s.id === selectedService.id
        ? {
            ...s,
            comments: s.comments?.filter((c) => c.id !== commentId),
          }
        : s
    );

    saveServiceMDS(updatedServices);
    setSelectedService({
      ...selectedService,
      comments: selectedService.comments?.filter((c) => c.id !== commentId),
    });
  };

  // Exportar para PDF (implementação básica)
  const handleExportPDF = (service: ServiceMDS) => {
    alert(`Exportando MDS ${service.number} para PDF...`);
    // Implementação futura de geração de PDF
  };

  // Solicitar cotação (implementação básica)
  const handleRequestQuote = (service: ServiceMDS) => {
    alert(`Solicitando cotação para MDS ${service.number}...`);
    // Implementação futura de envio de email com PDF
  };

  const handleViewComments = (service: ServiceMDS) => {
    setSelectedService(service);
    setViewMode("comments");
  };

  // Voltar
  const handleBack = () => {
    if (viewMode === "menu") {
      navigate("/acesso-exclusivo");
    } else if (viewMode === "comments") {
      setViewMode("history");
      setSelectedService(null);
    } else {
      setViewMode("menu");
      setFormData({});
      setEditingService(null);
      setSelectedService(null);
      setCurrentSection(0);
    }
  };

  // Calcular progresso
  const currentQuestions = questions.filter(
    (q) => q.section === sections[currentSection]
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Renderizar pergunta dinamicamente
  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || "";

    switch (question.type) {
      case "text":
        return (
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            {question.instruction && (
              <div className="equalizador-question-instruction">
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
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            {question.instruction && (
              <div className="equalizador-question-instruction">
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
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            <Input
              type="time"
              placeholder="Selecione o horário"
              value={value as string}
              onChange={(newValue) => handleInputChange(question.id, newValue)}
              required={question.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            {question.instruction && (
              <div className="equalizador-question-instruction">
                {question.instruction}
              </div>
            )}
            <textarea
              className="equalizador-form-textarea"
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
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            <div className="equalizador-options-container">
              {question.options?.map((option, index) => (
                <label key={index} className="equalizador-radio-option">
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
                  <span className="equalizador-radio-custom"></span>
                  <span className="equalizador-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "checkbox": {
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            <div className="equalizador-options-container">
              {question.options?.map((option, index) => (
                <label key={index} className="equalizador-checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter((v) => v !== option);
                      handleInputChange(question.id, newValues);
                    }}
                  />
                  <span className="equalizador-checkbox-custom"></span>
                  <span className="equalizador-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }

      case "select":
        return (
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            <select
              className="equalizador-form-select"
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

      case "responsibility-matrix":
        return (
          <div className="equalizador-form-question" key={question.id}>
            <label className="equalizador-question-label">
              {question.question}
              {question.required && (
                <span className="equalizador-required">*</span>
              )}
            </label>
            <div className="equalizador-responsibility-matrix">
              <div className="equalizador-matrix-header">
                <div className="equalizador-matrix-item-header">Aspecto</div>
                {question.columns?.map((column) => (
                  <div
                    key={column}
                    className="equalizador-matrix-column-header"
                  >
                    {column}
                  </div>
                ))}
              </div>
              {question.matrix?.map((row, rowIndex) => (
                <div key={rowIndex} className="equalizador-matrix-row">
                  <div className="equalizador-matrix-item">{row.item}</div>
                  {question.columns?.map((column) => (
                    <div key={column} className="equalizador-matrix-cell">
                      <label className="equalizador-radio-option">
                        <input
                          type="radio"
                          name={`${question.id}_${row.key}`}
                          value={column}
                          checked={
                            (formData[
                              `${question.id}_${row.key}`
                            ] as string) === column
                          }
                          onChange={(e) =>
                            handleInputChange(
                              `${question.id}_${row.key}`,
                              e.target.value
                            )
                          }
                          required={question.required}
                        />
                        <span className="equalizador-radio-custom"></span>
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderizar Menu Principal
  const renderMenu = () => (
    <div className="equalizador-menu-container">
      <div className="equalizador-menu-cards">
        <Card
          variant="service"
          title="NOVO MDS"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="equalizador-menu-card"
          onClick={() => {
            setViewMode("new");
            setFormData({});
            setEditingService(null);
          }}
        >
          <div className="equalizador-menu-card-content">
            <div className="equalizador-menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Criar novo Memorial Descritivo de Serviços</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="PLANILHA DE COTAÇÕES"
          textColor="#059669"
          backgroundColor="#f0fdf4"
          size="large"
          className="equalizador-menu-card"
          onClick={() => setViewMode("quotations")}
        >
          <div className="equalizador-menu-card-content">
            <div className="equalizador-menu-icon">
              <FiList size={48} />
            </div>
            <p>Visualizar e gerenciar cotações de prestadores</p>
            <span className="equalizador-request-count">
              {serviceMDS.length} MDS
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="HISTÓRICO"
          textColor="#7c3aed"
          backgroundColor="#faf5ff"
          size="large"
          className="equalizador-menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="equalizador-menu-card-content">
            <div className="equalizador-menu-icon">
              <FiClock size={48} />
            </div>
            <p>Consultar serviços criados anteriormente</p>
          </div>
        </Card>
      </div>
    </div>
  );

  // Renderizar Planilha de Cotações
  const renderQuotations = () => (
    <div className="equalizador-quotations-container">
      <div className="equalizador-quotations-header">
        <h2>Planilha de Cotações</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="equalizador-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="equalizador-schedule-table">
        <div className="equalizador-table-header">
          <div className="equalizador-table-cell">N°</div>
          <div className="equalizador-table-cell">Cliente</div>
          <div className="equalizador-table-cell">Projeto</div>
          <div className="equalizador-table-cell">Status</div>
          <div className="equalizador-table-cell">Ações</div>
        </div>

        {serviceMDS.length === 0 ? (
          <div className="equalizador-empty-schedule">
            <div className="equalizador-empty-icon">
              <FiFileText size={64} />
            </div>
            <h3>Nenhum MDS cadastrado ainda</h3>
            <p>Crie seu primeiro MDS</p>
            <Button variant="primary" onClick={() => setViewMode("new")}>
              Novo MDS
            </Button>
          </div>
        ) : (
          serviceMDS.map((service) => (
            <div key={service.id} className="equalizador-table-row">
              <div className="equalizador-table-cell">{service.number}</div>
              <div className="equalizador-table-cell">{service.client}</div>
              <div className="equalizador-table-cell">{service.project}</div>
              <div className="equalizador-table-cell">
                <select
                  className={`equalizador-status-select status-${service.status}`}
                  value={service.status}
                  onChange={(e) =>
                    handleChangeStatus(
                      service.id,
                      e.target.value as ServiceMDS["status"]
                    )
                  }
                >
                  <option value="awaiting-quotes">Aguardando Orçamentos</option>
                  <option value="open">Aberto</option>
                  <option value="lost">Perdida</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div className="equalizador-table-cell">
                <div className="equalizador-table-actions">
                  <Button
                    variant="secondary"
                    onClick={() => handleEditService(service)}
                    className="equalizador-action-button"
                  >
                    <FiEdit3 size={14} />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleExportPDF(service)}
                    className="equalizador-action-button"
                  >
                    <FiFile size={14} />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleRequestQuote(service)}
                    className="equalizador-action-button"
                  >
                    <FiSend size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Renderizar Histórico
  const renderHistory = () => (
    <div className="equalizador-history-container">
      <div className="equalizador-history-header">
        <h2>Histórico de MDS</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="equalizador-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="equalizador-requests-list">
        {serviceMDS.length === 0 ? (
          <div className="equalizador-empty-state">
            <div className="equalizador-empty-icon">
              <FiFileText size={64} />
            </div>
            <h3>Nenhum MDS encontrado</h3>
            <p>Crie seu primeiro MDS</p>
            <Button variant="primary" onClick={() => setViewMode("new")}>
              Novo MDS
            </Button>
          </div>
        ) : (
          serviceMDS.map((service) => (
            <div key={service.id} className="equalizador-request-item">
              <div className="equalizador-request-info">
                <h3>MDS: {service.number}</h3>
                <div className="equalizador-request-meta">
                  <span
                    className={`equalizador-status equalizador-status-${service.status}`}
                  >
                    {service.status === "awaiting-quotes" && (
                      <>
                        <FiClock size={16} />
                        Aguardando Orçamentos
                      </>
                    )}
                    {service.status === "open" && (
                      <>
                        <FiSettings size={16} />
                        Aberto
                      </>
                    )}
                    {service.status === "lost" && (
                      <>
                        <FiX size={16} />
                        Perdida
                      </>
                    )}
                    {service.status === "completed" && (
                      <>
                        <FiCheck size={16} />
                        Concluída
                      </>
                    )}
                  </span>
                  <span className="equalizador-date">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>
                  <strong>Cliente:</strong> {service.client}
                </p>
                <p>
                  <strong>Projeto:</strong> {service.project}
                </p>
              </div>
              <div className="equalizador-request-actions">
                <Button
                  variant="secondary"
                  onClick={() => handleEditService(service)}
                  className="equalizador-action-button"
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleViewComments(service)}
                  className="equalizador-action-button"
                >
                  <FiMessageCircle size={16} />({service.comments?.length || 0})
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleExportPDF(service)}
                  className="equalizador-action-button"
                >
                  <FiFile size={16} />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteService(service.id)}
                  className="equalizador-action-button equalizador-delete"
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

  // Renderizar Comentários
  const renderComments = () => (
    <div className="equalizador-comments-container">
      <div className="equalizador-comments-header">
        <h2>Comentários - MDS {selectedService?.number}</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("history")}
          className="equalizador-back-to-history"
        >
          <FiArrowLeft size={16} />
          Voltar ao Histórico
        </Button>
      </div>

      <div className="equalizador-comments-content">
        <div className="equalizador-add-comment-section">
          <h3>Adicionar Comentário</h3>
          <div className="equalizador-comment-form">
            <textarea
              className="equalizador-comment-textarea"
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <Button
              variant="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="equalizador-add-comment-button"
            >
              <FiPlus size={16} />
              Adicionar Comentário
            </Button>
          </div>
        </div>

        <div className="equalizador-comments-list">
          <h3>Comentários ({selectedService?.comments?.length || 0})</h3>
          {!selectedService?.comments ||
          selectedService.comments.length === 0 ? (
            <div className="equalizador-no-comments">
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            selectedService.comments.map((comment) => (
              <div key={comment.id} className="equalizador-comment-item">
                <div className="equalizador-comment-header">
                  <div className="equalizador-comment-author">
                    <strong>{comment.author}</strong>
                    <span className="equalizador-comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()} às{" "}
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="equalizador-delete-comment-button"
                  >
                    <FiTrash2 size={16} />
                  </Button>
                </div>
                <div className="equalizador-comment-text">{comment.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Renderizar Formulário
  const renderForm = () => (
    <>
      {/* Progress Bar */}
      <div className="equalizador-progress-container">
        <div className="equalizador-progress-bar">
          <div
            className="equalizador-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="equalizador-progress-text">
          Seção {currentSection + 1} de {sections.length}:{" "}
          {sections[currentSection]}
        </span>
      </div>

      {/* Form Content */}
      <div className="equalizador-form-container">
        <Card
          variant="service"
          className="equalizador-form-card"
          title=""
          textColor="#1e293b"
        >
          <div className="equalizador-form-header">
            <h2 className="equalizador-form-title">
              {viewMode === "edit"
                ? "EDITAR MDS"
                : "MEMORIAL DESCRITIVO DE SERVIÇOS"}
            </h2>
            <p className="equalizador-form-subtitle">
              Preencha todas as informações do serviço
            </p>
          </div>

          <div className="equalizador-form-content">
            <div className="equalizador-section-title">
              <h3>{sections[currentSection]}</h3>
            </div>

            <div className="equalizador-questions-container">
              {currentQuestions.length > 0 ? (
                currentQuestions.map(renderQuestion)
              ) : (
                <div className="equalizador-placeholder-message">
                  <p>
                    As perguntas desta seção serão adicionadas quando
                    fornecidas.
                  </p>
                  <p>
                    Estrutura preparada para receber as perguntas do formulário
                    MDS distribuídas em {sections.length} seções.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="equalizador-form-navigation">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="equalizador-nav-button"
            >
              <FiChevronLeft size={16} />
              Anterior
            </Button>

            <div className="equalizador-section-indicators">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`equalizador-section-dot ${
                    index === currentSection ? "active" : ""
                  } ${index < currentSection ? "completed" : ""}`}
                  onClick={() => setCurrentSection(index)}
                />
              ))}
            </div>

            <div className="equalizador-form-actions">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                className="equalizador-nav-button"
              >
                <FiSave size={16} />
                Salvar Rascunho
              </Button>

              {currentSection === sections.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={viewMode === "edit" ? handleSubmit : handleSubmit}
                  className="equalizador-nav-button equalizador-submit-button"
                >
                  <FiUpload size={16} />
                  {viewMode === "edit" ? "Atualizar" : "Finalizar MDS"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="equalizador-nav-button"
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
    <div className="equalizador-container">
      {/* Header */}
      <div className="equalizador-header">
        <Button
          variant="secondary"
          className="equalizador-back-button"
          onClick={handleBack}
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="equalizador-company-brand">
          <h1 className="equalizador-company-title">EQUALIZADOR DE SERVIÇOS</h1>
          <span className="equalizador-company-subtitle">
            Memorial Descritivo de Serviços (MDS)
          </span>
          <div className="equalizador-company-underline"></div>
        </div>
        <div className="equalizador-header-spacer"></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {viewMode === "quotations" && renderQuotations()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "comments" && renderComments()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}

      {/* Footer */}
      <div className="equalizador-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="equalizador-footer-logo"
        />
      </div>
    </div>
  );
};

export default EqualizadorServicos;
