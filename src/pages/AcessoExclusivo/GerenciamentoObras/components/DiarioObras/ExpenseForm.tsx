import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import ProjectSelector from "../shared/ProjectSelector";
import {
  FiFileText,
  FiMessageSquare,
  FiCamera,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  CommentEntry,
  Photo,
} from "../../../../../services/obrasService";

interface ExpenseFormProps {
  projects: Project[];
  editingEntry: DiaryEntry | null;
  onSave: (data: Partial<DiaryEntry>) => void;
  onBack: () => void;
}

// Interface específica para gastos no contexto deste formulário
interface ExpenseComment {
  id: string;
  author: string;
  text: string; // Descrição do gasto com valor
  date: string;
  items: { description: string; value: number }[];
}

export default function ExpenseForm({
  projects,
  editingEntry,
  onSave,
  onBack,
}: ExpenseFormProps) {
  // Estados básicos
  const [projectId, setProjectId] = useState(editingEntry?.projectId || "");
  const [obraName, setObraName] = useState(editingEntry?.obraName || "");
  const [date, setDate] = useState(
    editingEntry?.date || new Date().toISOString().split("T")[0]
  );
  const [reportNumber, setReportNumber] = useState(
    editingEntry?.reportNumber || 1
  );

  // Comentários/Gastos
  const [comments, setComments] = useState<ExpenseComment[]>([]);
  const [newExpenseItem, setNewExpenseItem] = useState({
    description: "",
    value: 0,
  });
  const [currentExpenseItems, setCurrentExpenseItems] = useState<
    { description: string; value: number }[]
  >([]);

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>(editingEntry?.photos || []);

  // Aprovação
  const [approvalStatus, setApprovalStatus] = useState<
    DiaryEntry["approvalStatus"]
  >(editingEntry?.approvalStatus || "preenchendo");
  const [signature] = useState(editingEntry?.signature || "");

  // Seção ativa
  const [activeSection, setActiveSection] = useState("details");

  // Obter dia da semana
  const getDayOfWeek = (dateStr: string) => {
    const days = [
      "Domingo",
      "Segunda-Feira",
      "Terça-Feira",
      "Quarta-Feira",
      "Quinta-Feira",
      "Sexta-Feira",
      "Sábado",
    ];
    const d = new Date(dateStr + "T12:00:00");
    return days[d.getDay()];
  };

  // Handlers
  const handleAddExpenseItem = () => {
    if (newExpenseItem.description && newExpenseItem.value > 0) {
      setCurrentExpenseItems([...currentExpenseItems, { ...newExpenseItem }]);
      setNewExpenseItem({ description: "", value: 0 });
    }
  };

  const handleSaveExpense = () => {
    if (currentExpenseItems.length > 0) {
      const totalText = currentExpenseItems
        .map(
          (item) =>
            `${item.description} - R$ ${item.value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
        )
        .join("\n");

      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: "Usuário",
          text: totalText,
          date: new Date().toISOString(),
          items: [...currentExpenseItems],
        },
      ]);
      setCurrentExpenseItems([]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              description: "",
              dataUrl: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const calculateTotal = () => {
    return comments.reduce((total, comment) => {
      return total + comment.items.reduce((sum, item) => sum + item.value, 0);
    }, 0);
  };

  const handleSave = () => {
    // Converter ExpenseComment para CommentEntry
    const commentsData: CommentEntry[] = comments.map((c) => ({
      id: c.id,
      author: c.author,
      text: c.text,
      date: c.date,
    }));

    const data: Partial<DiaryEntry> = {
      projectId,
      reportType: "lancamento-gastos",
      reportNumber,
      obraName,
      date,
      dayOfWeek: getDayOfWeek(date),
      comments: commentsData,
      photos,
      observations: "",
      weather: "",
      responsible: "",
      approvalStatus,
      signature,
      status: "em-andamento",
      materials: [],
      activities: "",
    };
    onSave(data);
  };

  // Seções do menu lateral
  const sections = [
    { id: "details", label: "Detalhes do relatório", icon: FiFileText },
    {
      id: "expenses",
      label: "Comentários",
      icon: FiMessageSquare,
      count: comments.length,
    },
    { id: "photos", label: "Fotos", icon: FiCamera, count: photos.length },
    { id: "approval", label: "Aprovação", icon: FiCheck },
  ];

  return (
    <div className="obras-rdo-container">
      {/* Menu lateral de navegação */}
      <div className="obras-rdo-sidebar">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              className={`obras-rdo-nav-item ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="obras-rdo-nav-label">
                <IconComponent size={16} />
                {section.label}
              </span>
              {section.count !== undefined && (
                <span className="obras-rdo-nav-count">{section.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo principal */}
      <div className="obras-rdo-main">
        <Button variant="secondary" onClick={onBack} className="obras-back-btn">
          <FiArrowLeft size={16} />
          Voltar
        </Button>

        <Card variant="service" className="obras-rdo-card" title="">
          {/* Header com status */}
          <div className="obras-rdo-header">
            <div className="obras-rdo-logo">
              <img
                src="/HIDRODEMA_LogoNovo_Azul.png"
                alt="HIDRODEMA"
                style={{ maxHeight: 60 }}
              />
            </div>
            <div className="obras-rdo-header-info">
              <div className="obras-rdo-field">
                <label>Relatório n°</label>
                <Input
                  type="text"
                  value={reportNumber.toString()}
                  onChange={(v) => setReportNumber(parseInt(v) || 1)}
                  placeholder="N°"
                />
              </div>
              <div className="obras-rdo-field">
                <label>Data</label>
                <Input
                  type="date"
                  value={date}
                  onChange={setDate}
                  placeholder=""
                />
              </div>
              <div className="obras-rdo-field">
                <label>Dia da semana</label>
                <span className="obras-rdo-weekday">{getDayOfWeek(date)}</span>
              </div>
            </div>
            <span
              className={`obras-rdo-status-badge obras-status-${approvalStatus}`}
            >
              {approvalStatus === "preenchendo" && "Preenchendo"}
              {approvalStatus === "revisao" && "Em Revisão"}
              {approvalStatus === "aprovado" && "Aprovado"}
            </span>
          </div>

          <h2 className="obras-rdo-title">LANÇAMENTO DE GASTOS</h2>

          {/* Seleção de obra */}
          <div className="obras-rdo-section">
            <ProjectSelector
              projects={projects}
              value={projectId}
              onChange={(id) => {
                setProjectId(id);
                const project = projects.find((p) => p.id === id);
                if (project) setObraName(project.name);
              }}
              required
              label="Obra"
            />
          </div>

          {/* Seção: Gastos/Comentários */}
          {activeSection === "expenses" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiMessageSquare /> Comentários ({comments.length})
                </h3>
                <Button
                  variant="primary"
                  onClick={handleSaveExpense}
                  disabled={currentExpenseItems.length === 0}
                >
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>

              {/* Formulário para adicionar itens de gasto */}
              <div className="obras-expense-form">
                <h4>Adicionar item de gasto:</h4>
                <div className="obras-rdo-add-form">
                  <Input
                    type="text"
                    placeholder="Descrição do gasto"
                    value={newExpenseItem.description}
                    onChange={(v) =>
                      setNewExpenseItem({ ...newExpenseItem, description: v })
                    }
                  />
                  <div className="obras-expense-value-input">
                    <span>R$</span>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={
                        newExpenseItem.value > 0
                          ? newExpenseItem.value.toString()
                          : ""
                      }
                      onChange={(v) =>
                        setNewExpenseItem({
                          ...newExpenseItem,
                          value: parseFloat(v.replace(",", ".")) || 0,
                        })
                      }
                    />
                  </div>
                  <Button variant="secondary" onClick={handleAddExpenseItem}>
                    <FiPlus size={16} />
                  </Button>
                </div>

                {/* Lista de itens pendentes */}
                {currentExpenseItems.length > 0 && (
                  <div className="obras-expense-pending">
                    <h5>Itens a serem adicionados:</h5>
                    {currentExpenseItems.map((item, index) => (
                      <div key={index} className="obras-expense-pending-item">
                        <span>{item.description}</span>
                        <span>
                          R${" "}
                          {item.value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentExpenseItems(
                              currentExpenseItems.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de gastos registrados */}
              <div className="obras-rdo-comments-list">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="obras-rdo-comment-item obras-expense-item"
                  >
                    <div className="obras-rdo-comment-header">
                      <strong>{comment.author}</strong>
                      <span>{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    <div className="obras-expense-details">
                      {comment.items.map((item, index) => (
                        <p key={index}>
                          {item.description} -{" "}
                          <strong>
                            R${" "}
                            {item.value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </p>
                      ))}
                    </div>
                    <div className="obras-rdo-comment-actions">
                      <button onClick={() => {}}>
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setComments(
                            comments.filter((c) => c.id !== comment.id)
                          )
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              {comments.length > 0 && (
                <div className="obras-expense-total">
                  <strong>Total de Gastos:</strong>
                  <span>
                    R${" "}
                    {calculateTotal().toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Seção: Fotos */}
          {activeSection === "photos" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiCamera /> Fotos ({photos.length})
                </h3>
                <label className="obras-upload-btn">
                  <FiPlus size={16} /> Adicionar
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <div className="obras-rdo-photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="obras-rdo-photo-item">
                    <div className="obras-rdo-photo-preview">
                      <img src={photo.dataUrl} alt={photo.name} />
                      <button
                        className="obras-rdo-photo-remove"
                        onClick={() =>
                          setPhotos(photos.filter((p) => p.id !== photo.id))
                        }
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      className="obras-textarea-small"
                      placeholder="Descrição"
                      value={photo.description}
                      onChange={(e) =>
                        setPhotos(
                          photos.map((p) =>
                            p.id === photo.id
                              ? { ...p, description: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Aprovação */}
          {activeSection === "approval" && (
            <div className="obras-rdo-section">
              <h3 className="obras-section-title" style={{ color: "#ea580c" }}>
                <FiCheck /> Assinatura manual
              </h3>
              <div className="obras-rdo-approval">
                <span
                  className={`obras-rdo-approval-badge obras-status-${approvalStatus}`}
                >
                  {approvalStatus === "aprovado"
                    ? "Aprovado"
                    : approvalStatus === "revisao"
                    ? "Em Revisão"
                    : "Pendente"}
                </span>
                <div className="obras-rdo-approval-options">
                  <label>
                    <input
                      type="radio"
                      name="approval"
                      checked={approvalStatus === "preenchendo"}
                      onChange={() => setApprovalStatus("preenchendo")}
                    />
                    1° Preenchendo Relatório
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="approval"
                      checked={approvalStatus === "revisao"}
                      onChange={() => setApprovalStatus("revisao")}
                    />
                    2° Revisar Relatório
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="approval"
                      checked={approvalStatus === "aprovado"}
                      onChange={() => setApprovalStatus("aprovado")}
                    />
                    3° Aprovado
                  </label>
                </div>
                <div className="obras-rdo-signature-area">
                  <div className="obras-rdo-signature-box">
                    {signature ? (
                      <img src={signature} alt="Assinatura" />
                    ) : (
                      <span>Assinatura</span>
                    )}
                  </div>
                  <Button variant="primary" onClick={() => {}}>
                    <FiEdit2 size={16} /> Assinar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar detalhes por padrão */}
          {activeSection === "details" && (
            <div className="obras-rdo-section">
              <p className="obras-rdo-instructions">
                Use o menu lateral para navegar entre as seções do relatório.
                Registre os gastos na seção "Comentários" e anexe comprovantes
                na seção "Fotos".
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="obras-rdo-footer">
            <div className="obras-rdo-meta">
              {editingEntry && (
                <>
                  <span>
                    Criado por: {editingEntry.createdBy} (
                    {new Date(editingEntry.createdAt).toLocaleString()})
                  </span>
                  <span>
                    Última modificação: {editingEntry.lastModifiedBy} (
                    {new Date(editingEntry.updatedAt).toLocaleString()})
                  </span>
                </>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleSave}
              className="obras-save-btn"
            >
              <FiSave size={16} /> Salvar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
