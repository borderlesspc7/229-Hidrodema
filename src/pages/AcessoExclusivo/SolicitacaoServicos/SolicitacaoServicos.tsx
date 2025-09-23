import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
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

interface ServiceRequest {
  id: string;
  title: string;
  status: "draft" | "submitted" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export default function SolicitacaoServicos() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [newComment, setNewComment] = useState("");

  // Placeholder para as 70 perguntas - será preenchido quando você passar as perguntas
  const questions: Question[] = [
    {
      id: "q1",
      type: "text",
      question: "Pergunta exemplo 1",
      section: "Seção 1",
      required: true,
    },
    // Mais perguntas serão adicionadas aqui...
  ];

  const sections = [
    "Dados Iniciais",
    "Informações Técnicas",
    "Especificações",
    "Requisitos",
    "Observações Finais",
  ];

  // Carregar solicitações do localStorage
  const loadServiceRequests = () => {
    const saved = localStorage.getItem("serviceRequests");
    if (saved) {
      setServiceRequests(JSON.parse(saved));
    }
  };

  // Salvar solicitações no localStorage
  const saveServiceRequests = (requests: ServiceRequest[]) => {
    localStorage.setItem("serviceRequests", JSON.stringify(requests));
    setServiceRequests(requests);
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
    const title =
      formData.q1 || `Solicitação ${new Date().toLocaleDateString()}`;
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      title: title as string,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: { ...formData },
      comments: [],
    };

    const updatedRequests = [...serviceRequests, newRequest];
    saveServiceRequests(updatedRequests);
    alert("Rascunho salvo com sucesso!");
  };

  const handleSubmit = () => {
    const title =
      formData.q1 || `Solicitação ${new Date().toLocaleDateString()}`;
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      title: title as string,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: { ...formData },
      comments: [],
    };

    const updatedRequests = [...serviceRequests, newRequest];
    saveServiceRequests(updatedRequests);
    alert("Solicitação enviada com sucesso!");
    setViewMode("menu");
    setFormData({});
    setCurrentSection(0);
  };

  const handleEditRequest = (request: ServiceRequest) => {
    setEditingRequest(request);
    setFormData(request.formData);
    setViewMode("edit");
  };

  const handleUpdateRequest = () => {
    if (!editingRequest) return;

    const updatedRequest = {
      ...editingRequest,
      formData: { ...formData },
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = serviceRequests.map((req) =>
      req.id === editingRequest.id ? updatedRequest : req
    );

    saveServiceRequests(updatedRequests);
    alert("Solicitação atualizada com sucesso!");
    setViewMode("history");
    setEditingRequest(null);
    setFormData({});
    setCurrentSection(0);
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm("Tem certeza que deseja excluir esta solicitação?")) {
      const updatedRequests = serviceRequests.filter(
        (req) => req.id !== requestId
      );
      saveServiceRequests(updatedRequests);
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
              `
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
                      comment.createdAt
                    ).toLocaleDateString()}
                    <p>${comment.text}</p>
                  </div>
                `
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

  const handleViewComments = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setViewMode("comments");
  };

  const handleAddComment = () => {
    if (!selectedRequest || !newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: "Usuário", // Em uma implementação real, pegaria do contexto de autenticação
      createdAt: new Date().toISOString(),
    };

    const updatedRequest = {
      ...selectedRequest,
      comments: [...selectedRequest.comments, comment],
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = serviceRequests.map((req) =>
      req.id === selectedRequest.id ? updatedRequest : req
    );

    saveServiceRequests(updatedRequests);
    setSelectedRequest(updatedRequest);
    setNewComment("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedRequest) return;

    const updatedRequest = {
      ...selectedRequest,
      comments: selectedRequest.comments.filter((c) => c.id !== commentId),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = serviceRequests.map((req) =>
      req.id === selectedRequest.id ? updatedRequest : req
    );

    saveServiceRequests(updatedRequests);
    setSelectedRequest(updatedRequest);
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
      case "text":
        return (
          <div className="form-question" key={question.id}>
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
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
                          currentValues.filter((v) => v !== option)
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
    (q) => q.section === sections[currentSection]
  );
  const progress = ((currentSection + 1) / sections.length) * 100;

  // Carregar dados na inicialização
  useEffect(() => {
    loadServiceRequests();
  }, []);

  // Renderizar menu principal
  const renderMenu = () => (
    <div className="menu-container">
      <div className="menu-cards">
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
                    onClick={() => handleDeleteComment(comment.id)}
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
        <span className="footer-company">HIDRODEMA®</span>
      </div>
    </div>
  );
}
