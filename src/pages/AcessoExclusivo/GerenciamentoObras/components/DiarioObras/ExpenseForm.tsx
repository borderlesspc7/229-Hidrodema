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
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  CommentEntry,
  Photo,
} from "../../../../../services/obrasService";
import { pluralize } from "../../../../../utils/pluralize";

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

  // Comentários/Gastos — inicializa a partir de editingEntry quando existir
  const parseCommentsToExpense = (entries: { id: string; author: string; text: string; date: string }[]): ExpenseComment[] => {
    return entries.map((c) => {
      const items: { description: string; value: number }[] = [];
      const lines = c.text.split("\n").filter(Boolean);
      for (const line of lines) {
        const match = line.match(/^(.+?)\s*-\s*R\$\s*([\d.,]+)$/);
        if (match) {
          const value = parseFloat(match[2].replace(".", "").replace(",", ".")) || 0;
          items.push({ description: match[1].trim(), value });
        }
      }
      return { id: c.id, author: c.author, text: c.text, date: c.date, items };
    });
  };
  const [comments, setComments] = useState<ExpenseComment[]>(() =>
    editingEntry?.comments?.length
      ? parseCommentsToExpense(editingEntry.comments)
      : []
  );
  const [newExpenseItem, setNewExpenseItem] = useState({
    description: "",
    value: 0,
  });
  const [currentExpenseItems, setCurrentExpenseItems] = useState<
    { description: string; value: number }[]
  >([]);

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>(editingEntry?.photos || []);

  // Aprovação e assinatura
  const [approvalStatus, setApprovalStatus] = useState<
    DiaryEntry["approvalStatus"]
  >(editingEntry?.approvalStatus || "preenchendo");
  const [signature, setSignature] = useState(editingEntry?.signature || "");
  const [responsibleName, setResponsibleName] = useState(
    editingEntry?.responsible || editingEntry?.signedBy || ""
  );

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
      responsible: responsibleName,
      approvalStatus,
      signature,
      signedBy: responsibleName || undefined,
      status: "em-andamento",
      materials: [],
      activities: "",
    };
    onSave(data);
  };

  // Seções do menu lateral
  const sections = [
    { id: "details", label: "Informações básicas", icon: FiFileText },
    {
      id: "expenses",
      label: "Itens de gasto",
      icon: FiDollarSign,
      count: comments.reduce((acc, c) => acc + c.items.length, 0) || comments.length,
    },
    { id: "photos", label: "Fotos / Comprovantes", icon: FiCamera, count: photos.length },
    { id: "approval", label: "Aprovação e assinatura", icon: FiCheck },
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
                src="/HIDRODEMA_LogoNovo_Branco (2).png"
                alt="HIDRODEMA"
                style={{ maxHeight: 56 }}
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

          <h2 className="obras-rdo-title obras-rdo-title-expense">
            <FiDollarSign size={28} /> Lançamento de Gastos
          </h2>

          {obraName && (
            <p className="obras-rdo-subtitle">{obraName}</p>
          )}

          {/* Seção: Informações básicas */}
          {activeSection === "details" && (
            <div className="obras-rdo-section obras-rdo-details-section">
              <h3 className="obras-section-title">Informações básicas</h3>
              <div className="obras-rdo-details-grid">
                <div className="obras-rdo-field">
                  <label>Obra / Projeto</label>
                  <ProjectSelector
                    projects={projects}
                    value={projectId}
                    onChange={(id) => {
                      setProjectId(id);
                      const project = projects.find((p) => p.id === id);
                      if (project) setObraName(project.name);
                    }}
                    required
                    label=""
                  />
                </div>
                <div className="obras-rdo-field">
                  <label>Número do relatório</label>
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
                <div className="obras-rdo-field">
                  <label>Status de aprovação</label>
                  <span
                    className={`obras-rdo-status-badge obras-status-${approvalStatus}`}
                  >
                    {approvalStatus === "preenchendo" && "Preenchendo"}
                    {approvalStatus === "revisao" && "Em Revisão"}
                    {approvalStatus === "aprovado" && "Aprovado"}
                  </span>
                </div>
              </div>
              <p className="obras-rdo-instructions">
                Use o menu lateral para adicionar <strong>itens de gasto</strong>, anexar <strong>fotos/comprovantes</strong> e concluir <strong>aprovação e assinatura</strong>.
              </p>
            </div>
          )}

          {/* Seção: Itens de gasto */}
          {activeSection === "expenses" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3 className="obras-section-title obras-section-title-expense">
                  <FiDollarSign /> Itens de gasto
                </h3>
                <div className="obras-rdo-section-header-right">
                  <span className="obras-rdo-section-count">
                    {pluralize(comments.reduce((acc, c) => acc + c.items.length, 0), "item", "itens")} · Total R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleSaveExpense}
                    disabled={currentExpenseItems.length === 0}
                  >
                    <FiPlus size={16} /> Confirmar itens
                  </Button>
                </div>
              </div>

              {/* Formulário para adicionar itens de gasto */}
              <div className="obras-expense-form">
                <h4 className="obras-expense-form-title">Adicionar item de gasto</h4>
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
                    <h5>Itens a adicionar ao relatório</h5>
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
                <h3 className="obras-section-title obras-section-title-photos">
                  <FiCamera /> Fotos / Comprovantes
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

          {/* Seção: Aprovação e assinatura */}
          {activeSection === "approval" && (
            <div className="obras-rdo-section">
              <h3 className="obras-section-title obras-section-title-approval">
                <FiCheck /> Aprovação e assinatura
              </h3>
              <div className="obras-rdo-approval">
                <div className="obras-rdo-field">
                  <label>Status de aprovação</label>
                  <span
                    className={`obras-rdo-approval-badge obras-status-${approvalStatus}`}
                  >
                    {approvalStatus === "aprovado"
                      ? "Aprovado"
                      : approvalStatus === "revisao"
                      ? "Em Revisão"
                      : "Preenchendo"}
                  </span>
                </div>
                <div className="obras-rdo-approval-options">
                  <label className="obras-rdo-radio-label">
                    <input
                      type="radio"
                      name="approval-expense"
                      checked={approvalStatus === "preenchendo"}
                      onChange={() => setApprovalStatus("preenchendo")}
                    />
                    <span>1° Preenchendo relatório</span>
                  </label>
                  <label className="obras-rdo-radio-label">
                    <input
                      type="radio"
                      name="approval-expense"
                      checked={approvalStatus === "revisao"}
                      onChange={() => setApprovalStatus("revisao")}
                    />
                    <span>2° Em revisão</span>
                  </label>
                  <label className="obras-rdo-radio-label">
                    <input
                      type="radio"
                      name="approval-expense"
                      checked={approvalStatus === "aprovado"}
                      onChange={() => setApprovalStatus("aprovado")}
                    />
                    <span>3° Aprovado</span>
                  </label>
                </div>
                <div className="obras-rdo-signature-area">
                  <div className="obras-rdo-field">
                    <label>Responsável / Assinante</label>
                    <Input
                      type="text"
                      placeholder="Nome do responsável pela aprovação"
                      value={responsibleName}
                      onChange={setResponsibleName}
                    />
                  </div>
                  <div className="obras-rdo-signature-row">
                    <div className="obras-rdo-signature-box">
                      {signature ? (
                        <img src={signature} alt="Assinatura" />
                      ) : (
                        <span className="obras-rdo-signature-placeholder">
                          Assinatura (opcional — use campo responsável acima)
                        </span>
                      )}
                    </div>
                    <div className="obras-rdo-signature-actions">
                      <label className="obras-upload-btn">
                        <FiEdit2 size={16} /> Carregar imagem
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setSignature(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {signature && (
                        <Button
                          variant="secondary"
                          onClick={() => setSignature("")}
                        >
                          <FiTrash2 size={14} /> Limpar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer com ações */}
          <div className="obras-rdo-footer obras-rdo-footer-actions">
            <div className="obras-rdo-meta">
              {editingEntry && (
                <>
                  <span>
                    Criado por {editingEntry.createdBy ?? "—"} em{" "}
                    {new Date(editingEntry.createdAt).toLocaleString("pt-BR")}
                  </span>
                  {editingEntry.lastModifiedBy && (
                    <span>
                      Última alteração: {editingEntry.lastModifiedBy} (
                      {new Date(editingEntry.updatedAt).toLocaleString("pt-BR")})
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="obras-rdo-footer-buttons">
              <Button
                variant="secondary"
                onClick={onBack}
                className="obras-cancel-btn"
              >
                <FiX size={16} /> Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="obras-save-btn"
              >
                <FiSave size={16} /> Salvar relatório
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
