import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
}

type ViewMode = "menu" | "new" | "history" | "edit" | "comments" | "schedule";

interface VisitReport {
  id: string;
  title: string;
  status: "scheduled" | "awaiting-report" | "cancelled" | "completed";
  visitType: "technical" | "commercial";
  client: string;
  salesperson: string;
  engineer?: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  comments: Comment[];
  followUpDate?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export default function RelatorioVisitas() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [visitReports, setVisitReports] = useState<VisitReport[]>([]);
  const [editingReport, setEditingReport] = useState<VisitReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<VisitReport | null>(
    null
  );
  const [newComment, setNewComment] = useState("");

  // Estrutura preparada para receber 25 perguntas sobre visitas
  const questions: Question[] = [
    // Seção 1: Dados da Visita
    {
      id: "q1",
      type: "radio",
      question: "1 - Tipo de Visita",
      section: "Dados da Visita",
      required: true,
      options: ["Técnica", "Comercial", "Técnica e Comercial"],
    },
    {
      id: "q2",
      type: "text",
      question: "2 - Cliente/Empresa",
      section: "Dados da Visita",
      required: true,
    },
    {
      id: "q3",
      type: "text",
      question: "3 - Vendedor Responsável",
      section: "Dados da Visita",
      required: true,
    },
    {
      id: "q4",
      type: "date",
      question: "4 - Data da Visita",
      section: "Dados da Visita",
      required: true,
    },
    {
      id: "q5",
      type: "time",
      question: "5 - Horário da Visita",
      section: "Dados da Visita",
      required: true,
    },
    // Placeholder para as demais 20 perguntas que serão adicionadas
    // Elas serão distribuídas em outras seções como:
    // - Dados do Cliente
    // - Objetivos da Visita
    // - Relatório da Visita
    // - Follow-up
    // - Observações
  ];

  const sections = [
    "Dados da Visita",
    "Dados do Cliente",
    "Objetivos da Visita",
    "Relatório da Visita",
    "Follow-up",
    "Observações",
  ];

  // Carregar relatórios do localStorage
  const loadVisitReports = () => {
    const saved = localStorage.getItem("visitReports");
    if (saved) {
      setVisitReports(JSON.parse(saved));
    }
  };

  // Salvar relatórios no localStorage
  const saveVisitReports = (reports: VisitReport[]) => {
    localStorage.setItem("visitReports", JSON.stringify(reports));
    setVisitReports(reports);
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
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

  const handleSaveDraft = () => {
    const title = formData.q2 || `Visita ${new Date().toLocaleDateString()}`;
    const newReport: VisitReport = {
      id: Date.now().toString(),
      title: title as string,
      status: "scheduled",
      visitType: formData.q1 === "Técnica" ? "technical" : "commercial",
      client: (formData.q2 as string) || "Cliente não informado",
      salesperson: (formData.q3 as string) || "Vendedor não informado",
      scheduledDate:
        (formData.q4 as string) || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: { ...formData },
      comments: [],
    };

    const updatedReports = [...visitReports, newReport];
    saveVisitReports(updatedReports);
    alert("Rascunho salvo com sucesso!");
  };

  const handleSubmit = () => {
    const title = formData.q2 || `Visita ${new Date().toLocaleDateString()}`;
    const newReport: VisitReport = {
      id: Date.now().toString(),
      title: title as string,
      status: "scheduled",
      visitType: formData.q1 === "Técnica" ? "technical" : "commercial",
      client: (formData.q2 as string) || "Cliente não informado",
      salesperson: (formData.q3 as string) || "Vendedor não informado",
      scheduledDate:
        (formData.q4 as string) || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: { ...formData },
      comments: [],
    };

    const updatedReports = [...visitReports, newReport];
    saveVisitReports(updatedReports);
    alert("Visita agendada com sucesso!");
    setViewMode("menu");
    setFormData({});
    setCurrentSection(0);
  };

  const handleEditReport = (report: VisitReport) => {
    setEditingReport(report);
    setFormData(report.formData);
    setViewMode("edit");
  };

  const handleUpdateReport = () => {
    if (!editingReport) return;

    const updatedReport = {
      ...editingReport,
      formData: { ...formData },
      updatedAt: new Date().toISOString(),
    };

    const updatedReports = visitReports.map((rep) =>
      rep.id === editingReport.id ? updatedReport : rep
    );

    saveVisitReports(updatedReports);
    alert("Relatório atualizado com sucesso!");
    setViewMode("history");
    setEditingReport(null);
    setFormData({});
    setCurrentSection(0);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
      const updatedReports = visitReports.filter((rep) => rep.id !== reportId);
      saveVisitReports(updatedReports);
    }
  };

  const handleChangeStatus = (
    reportId: string,
    newStatus: VisitReport["status"]
  ) => {
    const updatedReports = visitReports.map((rep) =>
      rep.id === reportId
        ? { ...rep, status: newStatus, updatedAt: new Date().toISOString() }
        : rep
    );
    saveVisitReports(updatedReports);
  };

  const handleExportPDF = (report: VisitReport) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Visita - ${report.title}</title>
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
              <h1>RELATÓRIO DE VISITA</h1>
              <h2>Cliente: ${report.client}</h2>
              <p>Data: ${new Date(
                report.scheduledDate
              ).toLocaleDateString()}</p>
              <p>Vendedor: ${report.salesperson}</p>
            </div>
            <div class="section">
              <h3>Dados da Visita</h3>
              ${Object.entries(report.formData)
                .map(
                  ([key, value]) => `
                <div class="question">
                  <span class="label">${key}:</span>
                  <span class="value">${
                    Array.isArray(value) ? value.join(", ") : value
                  }</span>
                </div>
              `
                )
                .join("")}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewComments = (report: VisitReport) => {
    setSelectedReport(report);
    setViewMode("comments");
  };

  const handleAddComment = () => {
    if (!selectedReport || !newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: "Usuário",
      createdAt: new Date().toISOString(),
    };

    const updatedReport = {
      ...selectedReport,
      comments: [...selectedReport.comments, comment],
      updatedAt: new Date().toISOString(),
    };

    const updatedReports = visitReports.map((rep) =>
      rep.id === selectedReport.id ? updatedReport : rep
    );

    saveVisitReports(updatedReports);
    setSelectedReport(updatedReport);
    setNewComment("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedReport) return;

    const updatedReport = {
      ...selectedReport,
      comments: selectedReport.comments.filter((c) => c.id !== commentId),
      updatedAt: new Date().toISOString(),
    };

    const updatedReports = visitReports.map((rep) =>
      rep.id === selectedReport.id ? updatedReport : rep
    );

    saveVisitReports(updatedReports);
    setSelectedReport(updatedReport);
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
      case "text":
        return (
          <div className="visitas-form-question" key={question.id}>
            <label className="visitas-question-label">
              {question.question}
              {question.required && <span className="visitas-required">*</span>}
            </label>
            <Input
              type="text"
              placeholder="Digite sua resposta"
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
            <Input
              placeholder="Digite sua resposta"
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
            <textarea
              className="visitas-form-textarea"
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
    (q) => q.section === sections[currentSection]
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Carregar dados na inicialização
  useEffect(() => {
    loadVisitReports();
  }, []);

  // Renderizar menu principal
  const renderMenu = () => (
    <div className="visitas-menu-container">
      <div className="visitas-menu-cards">
        <Card
          variant="service"
          title="NOVA VISITA"
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
              {visitReports.length} visitas
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
            <Button variant="primary" onClick={() => setViewMode("new")}>
              Nova Visita
            </Button>
          </div>
        ) : (
          visitReports.map((report) => (
            <div key={report.id} className="visitas-table-row">
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
                  onChange={(e) =>
                    handleChangeStatus(
                      report.id,
                      e.target.value as VisitReport["status"]
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
                  <Button
                    variant="secondary"
                    onClick={() => handleEditReport(report)}
                    className="visitas-action-button"
                  >
                    <FiEdit3 size={14} />
                  </Button>
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
          ))
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
            <Button variant="primary" onClick={() => setViewMode("new")}>
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
                <Button
                  variant="secondary"
                  onClick={() => handleEditReport(report)}
                  className="visitas-action-button"
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
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
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteReport(report.id)}
                  className="visitas-action-button visitas-delete"
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
                    onClick={() => handleDeleteComment(comment.id)}
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
              {currentQuestions.length > 0 ? (
                currentQuestions.map(renderQuestion)
              ) : (
                <div className="visitas-placeholder-message">
                  <p>
                    As perguntas desta seção serão adicionadas quando
                    fornecidas.
                  </p>
                  <p>
                    Estrutura preparada para 25 perguntas distribuídas em{" "}
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
                  <FiUpload size={16} />
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
      {/* Header */}
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
        <div className="visitas-header-spacer"></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {viewMode === "schedule" && renderSchedule()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "comments" && renderComments()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}

      {/* Footer */}
      <div className="visitas-footer">
        <span className="visitas-footer-company">HIDRODEMA®</span>
      </div>
    </div>
  );
}
