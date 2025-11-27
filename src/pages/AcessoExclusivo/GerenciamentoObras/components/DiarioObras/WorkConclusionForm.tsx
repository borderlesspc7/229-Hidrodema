import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import ProjectSelector from "../shared/ProjectSelector";
import {
  FiFileText,
  FiActivity,
  FiAlertTriangle,
  FiMessageSquare,
  FiCamera,
  FiVideo,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiArrowLeft,
  FiSave,
  FiX,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  CommentEntry,
  Photo,
  VideoEntry,
  ConclusionActivityEntry,
  ConclusionOccurrenceEntry,
  SignatureEntry,
} from "../../../../../services/obrasService";
import { OCCURRENCE_TAGS as TAGS } from "../../../../../services/obrasService";

interface WorkConclusionFormProps {
  projects: Project[];
  editingEntry: DiaryEntry | null;
  onSave: (data: Partial<DiaryEntry>) => void;
  onBack: () => void;
}

export default function WorkConclusionForm({
  projects,
  editingEntry,
  onSave,
  onBack,
}: WorkConclusionFormProps) {
  // Estados básicos
  const [projectId, setProjectId] = useState(editingEntry?.projectId || "");
  const [obraName, setObraName] = useState(editingEntry?.obraName || "");
  const [date, setDate] = useState(
    editingEntry?.date || new Date().toISOString().split("T")[0]
  );
  const [reportNumber, setReportNumber] = useState(
    editingEntry?.reportNumber || 1
  );

  // Atividades
  const [activities, setActivities] = useState<ConclusionActivityEntry[]>(
    editingEntry?.conclusionActivities || []
  );
  const [newActivity, setNewActivity] = useState({
    description: "",
    progress: 0,
    status: "nao-iniciada" as ConclusionActivityEntry["status"],
    details: "",
  });

  // Ocorrências
  const [occurrences, setOccurrences] = useState<ConclusionOccurrenceEntry[]>(
    editingEntry?.conclusionOccurrences || []
  );
  const [newOccurrence, setNewOccurrence] = useState({
    description: "",
    tags: [] as string[],
    date: new Date().toISOString().split("T")[0],
  });
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Comentários
  const [comments, setComments] = useState<CommentEntry[]>(
    editingEntry?.comments || []
  );
  const [newComment, setNewComment] = useState("");

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>(editingEntry?.photos || []);

  // Vídeos
  const [videos, setVideos] = useState<VideoEntry[]>(
    editingEntry?.videos || []
  );

  // Assinaturas
  const [signatures, setSignatures] = useState<SignatureEntry[]>(
    editingEntry?.signatures || [
      {
        id: "1",
        name: "",
        company: "",
        role: "empresa",
      },
      {
        id: "2",
        name: "",
        company: "",
        role: "cliente",
      },
    ]
  );

  // Aprovação
  const [approvalStatus, setApprovalStatus] = useState<
    DiaryEntry["approvalStatus"]
  >(editingEntry?.approvalStatus || "preenchendo");

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
  const handleAddActivity = () => {
    if (newActivity.description) {
      setActivities([
        ...activities,
        { id: Date.now().toString(), ...newActivity },
      ]);
      setNewActivity({
        description: "",
        progress: 0,
        status: "nao-iniciada",
        details: "",
      });
    }
  };

  const handleToggleTag = (tag: string) => {
    setNewOccurrence((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  const handleAddOccurrence = () => {
    if (newOccurrence.description) {
      setOccurrences([
        ...occurrences,
        { id: Date.now().toString(), ...newOccurrence },
      ]);
      setNewOccurrence({
        description: "",
        tags: [],
        date: new Date().toISOString().split("T")[0],
      });
      setShowTagSelector(false);
    }
  };

  const handleAddComment = () => {
    if (newComment) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: "Usuário",
          text: newComment,
          date: new Date().toISOString(),
        },
      ]);
      setNewComment("");
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideos((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              description: "",
              dataUrl: reader.result as string,
              size: file.size,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdateSignature = (
    id: string,
    field: "name" | "company",
    value: string
  ) => {
    setSignatures(
      signatures.map((sig) =>
        sig.id === id ? { ...sig, [field]: value } : sig
      )
    );
  };

  const handleSave = () => {
    const data: Partial<DiaryEntry> = {
      projectId,
      reportType: "conclusao-obra",
      reportNumber,
      obraName,
      date,
      dayOfWeek: getDayOfWeek(date),
      conclusionActivities: activities,
      conclusionOccurrences: occurrences,
      comments,
      photos,
      videos,
      signatures,
      observations: "",
      weather: "",
      responsible: "",
      approvalStatus,
      status: "concluida",
      materials: [],
      activities: activities.map((a) => a.description).join("; "),
    };
    onSave(data);
  };

  // Seções do menu lateral
  const sections = [
    { id: "details", label: "Detalhes do relatório", icon: FiFileText },
    {
      id: "activities",
      label: "Atividades",
      icon: FiActivity,
      count: activities.length,
    },
    {
      id: "occurrences",
      label: "Ocorrências",
      icon: FiAlertTriangle,
      count: occurrences.length,
    },
    {
      id: "comments",
      label: "Comentários",
      icon: FiMessageSquare,
      count: comments.length,
    },
    { id: "photos", label: "Fotos", icon: FiCamera, count: photos.length },
    { id: "videos", label: "Vídeos", icon: FiVideo, count: videos.length },
    { id: "approval", label: "Aprovação", icon: FiCheck },
  ];

  const getStatusLabel = (status: ConclusionActivityEntry["status"]) => {
    const labels: Record<ConclusionActivityEntry["status"], string> = {
      iniciada: "Iniciada",
      "em-andamento": "Em andamento",
      concluida: "Concluída",
      "nao-iniciada": "Não iniciada",
      paralisada: "Paralisada",
      "nao-executada": "Não executada",
    };
    return labels[status];
  };

  const getStatusColor = (status: ConclusionActivityEntry["status"]) => {
    const colors: Record<ConclusionActivityEntry["status"], string> = {
      iniciada: "#3b82f6",
      "em-andamento": "#f59e0b",
      concluida: "#10b981",
      "nao-iniciada": "#6b7280",
      paralisada: "#ef4444",
      "nao-executada": "#9ca3af",
    };
    return colors[status];
  };

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

        <Card
          variant="service"
          className="obras-rdo-card"
          title=""
          textColor="#1e293b"
        >
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

          <h2 className="obras-rdo-title">RELATÓRIO DE CONCLUSÃO DE OBRA</h2>

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

          {/* Seção: Atividades */}
          {activeSection === "activities" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiActivity /> Atividades ({activities.length})
                </h3>
                <Button variant="primary" onClick={handleAddActivity}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              <div className="obras-rdo-add-form obras-rdo-add-form-vertical">
                <Input
                  type="text"
                  placeholder="Descrição da atividade"
                  value={newActivity.description}
                  onChange={(v) =>
                    setNewActivity({ ...newActivity, description: v })
                  }
                />
                <div className="obras-rdo-add-form-row">
                  <div className="obras-rdo-field">
                    <label>Status</label>
                    <select
                      value={newActivity.status}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          status: e.target
                            .value as ConclusionActivityEntry["status"],
                        })
                      }
                      className="obras-select"
                    >
                      <option value="nao-iniciada">Não iniciada</option>
                      <option value="iniciada">Iniciada</option>
                      <option value="em-andamento">Em andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="paralisada">Paralisada</option>
                      <option value="nao-executada">Não executada</option>
                    </select>
                  </div>
                  <div className="obras-rdo-field">
                    <label>Progresso (%)</label>
                    <Input
                      type="text"
                      placeholder="0-100"
                      value={newActivity.progress.toString()}
                      onChange={(v) =>
                        setNewActivity({
                          ...newActivity,
                          progress: parseInt(v) || 0,
                        })
                      }
                      mask="number"
                    />
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Detalhes adicionais (opcional)"
                  value={newActivity.details || ""}
                  onChange={(v) =>
                    setNewActivity({ ...newActivity, details: v })
                  }
                />
              </div>
              <div className="obras-rdo-activities-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="obras-rdo-activity-item">
                    <div className="obras-rdo-activity-header">
                      <strong>{activity.description}</strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="obras-rdo-progress"
                          style={{
                            backgroundColor: `${getStatusColor(
                              activity.status
                            )}20`,
                            color: getStatusColor(activity.status),
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {activity.progress}% {getStatusLabel(activity.status)}
                        </span>
                      </div>
                    </div>
                    {activity.details && (
                      <p className="obras-rdo-activity-details">
                        {activity.details}
                      </p>
                    )}
                    <div className="obras-rdo-activity-actions">
                      <button
                        onClick={() =>
                          setActivities(
                            activities.filter((a) => a.id !== activity.id)
                          )
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Ocorrências */}
          {activeSection === "occurrences" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiAlertTriangle /> Ocorrências ({occurrences.length})
                </h3>
                <Button variant="primary" onClick={handleAddOccurrence}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              <div className="obras-rdo-add-form obras-rdo-add-form-vertical">
                <Input
                  type="text"
                  placeholder="Descrição da ocorrência"
                  value={newOccurrence.description}
                  onChange={(v) =>
                    setNewOccurrence({ ...newOccurrence, description: v })
                  }
                />
                <div className="obras-rdo-field">
                  <label>Data</label>
                  <Input
                    type="date"
                    value={newOccurrence.date}
                    onChange={(v) =>
                      setNewOccurrence({ ...newOccurrence, date: v })
                    }
                    placeholder=""
                  />
                </div>
                <div
                  className="obras-rdo-field"
                  style={{ position: "relative" }}
                >
                  <label>Tipos de ocorrência (tags)</label>
                  <div
                    className="obras-tag-selector"
                    onClick={() => setShowTagSelector(!showTagSelector)}
                  >
                    <Input
                      type="text"
                      placeholder="Selecione as tags"
                      value={
                        newOccurrence.tags.length > 0
                          ? `${newOccurrence.tags.length} tag(s) selecionada(s)`
                          : ""
                      }
                      readOnly
                      onChange={() => {
                        /* campo apenas para exibir seleção */
                      }}
                    />
                    <span className="obras-tag-selector-arrow">▼</span>
                  </div>
                  {showTagSelector && (
                    <div className="obras-tag-selector-dropdown">
                      {TAGS.map((tag) => (
                        <label
                          key={tag}
                          className="obras-tag-option"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={newOccurrence.tags.includes(tag)}
                            onChange={() => handleToggleTag(tag)}
                          />
                          <span>{tag}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {newOccurrence.tags.length > 0 && (
                  <div className="obras-selected-tags">
                    {newOccurrence.tags.map((tag) => (
                      <span
                        key={tag}
                        className="obras-tag-badge"
                        onClick={() => handleToggleTag(tag)}
                      >
                        {tag}
                        <FiX size={12} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="obras-rdo-list">
                {occurrences.map((occurrence) => (
                  <div key={occurrence.id} className="obras-rdo-list-item">
                    <div className="obras-rdo-item-info">
                      <strong>{occurrence.description}</strong>
                      <span>
                        {new Date(occurrence.date).toLocaleDateString("pt-BR")}
                      </span>
                      {occurrence.tags.length > 0 && (
                        <div className="obras-occurrence-tags">
                          {occurrence.tags.map((tag) => (
                            <span key={tag} className="obras-tag-badge-small">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="obras-rdo-remove-btn"
                      onClick={() =>
                        setOccurrences(
                          occurrences.filter((o) => o.id !== occurrence.id)
                        )
                      }
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Comentários */}
          {activeSection === "comments" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiMessageSquare /> Comentários ({comments.length})
                </h3>
                <Button variant="primary" onClick={handleAddComment}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              <div className="obras-rdo-add-form">
                <textarea
                  className="obras-textarea"
                  placeholder="Digite seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="obras-rdo-comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="obras-rdo-comment-item">
                    <div className="obras-rdo-comment-header">
                      <strong>{comment.author}</strong>
                      <span>{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    <p>{comment.text}</p>
                    <div className="obras-rdo-comment-actions">
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

          {/* Seção: Vídeos */}
          {activeSection === "videos" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiVideo /> Vídeos ({videos.length})
                </h3>
                <label className="obras-upload-btn">
                  <FiPlus size={16} /> Adicionar
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <div className="obras-rdo-videos-grid">
                {videos.map((video) => (
                  <div key={video.id} className="obras-rdo-video-item">
                    <div className="obras-rdo-video-preview">
                      <video
                        src={video.dataUrl}
                        controls
                        style={{ width: "100%", maxHeight: "200px" }}
                      />
                      <button
                        className="obras-rdo-video-remove"
                        onClick={() =>
                          setVideos(videos.filter((v) => v.id !== video.id))
                        }
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      className="obras-textarea-small"
                      placeholder="Descrição"
                      value={video.description}
                      onChange={(e) =>
                        setVideos(
                          videos.map((v) =>
                            v.id === video.id
                              ? { ...v, description: e.target.value }
                              : v
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
                <div className="obras-signatures-grid">
                  {signatures.map((signature) => (
                    <div key={signature.id} className="obras-signature-block">
                      <div className="obras-signature-header">
                        <strong>NOME:</strong>
                        <Input
                          type="text"
                          placeholder="Nome"
                          value={signature.name}
                          onChange={(v) =>
                            handleUpdateSignature(signature.id, "name", v)
                          }
                        />
                      </div>
                      <div className="obras-signature-header">
                        <strong>EMPRESA:</strong>
                        <Input
                          type="text"
                          placeholder="Empresa"
                          value={signature.company}
                          onChange={(v) =>
                            handleUpdateSignature(signature.id, "company", v)
                          }
                        />
                      </div>
                      <div className="obras-rdo-signature-box">
                        {signature.signature ? (
                          <img src={signature.signature} alt="Assinatura" />
                        ) : (
                          <span>Assinatura</span>
                        )}
                      </div>
                      <Button variant="primary" onClick={() => {}}>
                        <FiEdit2 size={16} /> Assinar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mostrar detalhes por padrão */}
          {activeSection === "details" && (
            <div className="obras-rdo-section">
              <p className="obras-rdo-instructions">
                Use o menu lateral para navegar entre as seções do relatório.
                Preencha todas as informações necessárias sobre a conclusão da
                obra e salve quando terminar.
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
