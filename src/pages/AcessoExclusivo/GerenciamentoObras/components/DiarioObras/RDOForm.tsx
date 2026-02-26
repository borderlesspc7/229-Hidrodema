import { useState, useEffect } from "react";
import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import ProjectSelector from "../shared/ProjectSelector";
import {
  FiFileText,
  FiClock,
  FiUsers,
  FiTool,
  FiActivity,
  FiAlertTriangle,
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
  WorkSchedule,
  WorkforceEntry,
  EquipmentUsage,
  ActivityEntry,
  OccurrenceEntry,
  CommentEntry,
  Photo,
} from "../../../../../services/obrasService";
import { pluralize } from "../../../../../utils/pluralize";

interface RDOFormProps {
  projects: Project[];
  editingEntry: DiaryEntry | null;
  onSave: (data: Partial<DiaryEntry>) => void;
  onBack: () => void;
}

export default function RDOForm({
  projects,
  editingEntry,
  onSave,
  onBack,
}: RDOFormProps) {
  // Estados básicos
  const [projectId, setProjectId] = useState(editingEntry?.projectId || "");
  const [obraName, setObraName] = useState(editingEntry?.obraName || "");
  const [date, setDate] = useState(
    editingEntry?.date || new Date().toISOString().split("T")[0]
  );
  const [reportNumber, setReportNumber] = useState(
    editingEntry?.reportNumber || 1
  );

  // Horário de trabalho
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(
    editingEntry?.workSchedule || {
      entryTime: "08:00",
      exitTime: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      totalHours: "09:00",
    }
  );

  // Mão de obra
  const [workforce, setWorkforce] = useState<WorkforceEntry[]>(
    editingEntry?.workforce || []
  );
  const [newWorker, setNewWorker] = useState({
    name: "",
    company: "",
    quantity: 1,
  });

  // Equipamentos
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentUsage[]>(
    editingEntry?.equipmentUsed || []
  );
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    code: "",
    quantity: 1,
  });

  // Atividades
  const [activitiesList, setActivitiesList] = useState<ActivityEntry[]>(
    editingEntry?.activitiesList || []
  );
  const [newActivity, setNewActivity] = useState({
    description: "",
    progress: 0,
    status: "em-andamento" as ActivityEntry["status"],
    details: "",
  });

  // Ocorrências
  const [occurrences] = useState<OccurrenceEntry[]>(
    editingEntry?.occurrences || []
  );

  // Comentários
  const [comments, setComments] = useState<CommentEntry[]>(
    editingEntry?.comments || []
  );
  const [newComment, setNewComment] = useState("");

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>(editingEntry?.photos || []);

  // Aprovação
  const [approvalStatus, setApprovalStatus] = useState<
    DiaryEntry["approvalStatus"]
  >(editingEntry?.approvalStatus || "preenchendo");
  const [signature] = useState(editingEntry?.signature || "");

  // Seção ativa para navegação
  const [activeSection, setActiveSection] = useState("details");

  // Calcular horas trabalhadas
  useEffect(() => {
    const calculateHours = () => {
      const [entryH, entryM] = workSchedule.entryTime.split(":").map(Number);
      const [exitH, exitM] = workSchedule.exitTime.split(":").map(Number);
      const [breakStartH, breakStartM] = workSchedule.breakStart
        .split(":")
        .map(Number);
      const [breakEndH, breakEndM] = workSchedule.breakEnd
        .split(":")
        .map(Number);

      const entryMinutes = entryH * 60 + entryM;
      const exitMinutes = exitH * 60 + exitM;
      const breakMinutes =
        breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM);

      const totalMinutes = exitMinutes - entryMinutes - breakMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setWorkSchedule((prev) => ({
        ...prev,
        totalHours: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
      }));
    };

    calculateHours();
  }, [
    workSchedule.entryTime,
    workSchedule.exitTime,
    workSchedule.breakStart,
    workSchedule.breakEnd,
  ]);

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
  const handleAddWorker = () => {
    if (newWorker.name) {
      setWorkforce([...workforce, { id: Date.now().toString(), ...newWorker }]);
      setNewWorker({ name: "", company: "", quantity: 1 });
    }
  };

  const handleAddEquipment = () => {
    if (newEquipment.name) {
      setEquipmentUsed([
        ...equipmentUsed,
        { id: Date.now().toString(), ...newEquipment },
      ]);
      setNewEquipment({ name: "", code: "", quantity: 1 });
    }
  };

  const handleAddActivity = () => {
    if (newActivity.description) {
      setActivitiesList([
        ...activitiesList,
        { id: Date.now().toString(), ...newActivity },
      ]);
      setNewActivity({
        description: "",
        progress: 0,
        status: "em-andamento",
        details: "",
      });
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

  const handleSave = () => {
    const data: Partial<DiaryEntry> = {
      projectId,
      reportType: "rdo",
      reportNumber,
      obraName,
      date,
      dayOfWeek: getDayOfWeek(date),
      workSchedule,
      workforce,
      equipmentUsed,
      activities: activitiesList.map((a) => a.description).join("; "),
      activitiesList,
      occurrences,
      comments,
      photos,
      observations: "",
      weather: "",
      responsible: "",
      approvalStatus,
      signature,
      status: "em-andamento",
      materials: [],
    };
    onSave(data);
  };

  // Seções do menu lateral
  const sections = [
    { id: "details", label: "Detalhes do relatório", icon: FiFileText },
    { id: "schedule", label: "Horário de trabalho", icon: FiClock },
    {
      id: "workforce",
      label: "Mão de obra",
      icon: FiUsers,
      count: workforce.length,
    },
    {
      id: "equipment",
      label: "Equipamentos",
      icon: FiTool,
      count: equipmentUsed.length,
    },
    {
      id: "activities",
      label: "Atividades",
      icon: FiActivity,
      count: activitiesList.length,
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
                src="/HIDRODEMA_LogoNovo_Branco (2).png"
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

          <h2 className="obras-rdo-title">RELATÓRIO DIÁRIO DE OBRA - RDO</h2>

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

          {/* Seção: Horário de trabalho */}
          {activeSection === "schedule" && (
            <div className="obras-rdo-section">
              <h3 className="obras-section-title" style={{ color: "#ea580c" }}>
                <FiClock /> Horário de trabalho
              </h3>
              <div className="obras-rdo-schedule-grid">
                <div className="obras-rdo-field">
                  <label>Entrada</label>
                  <Input
                    type="time"
                    value={workSchedule.entryTime}
                    onChange={(v) =>
                      setWorkSchedule({ ...workSchedule, entryTime: v })
                    }
                    placeholder=""
                  />
                  <small>Jornada de trabalho</small>
                </div>
                <div className="obras-rdo-field">
                  <label>Saída</label>
                  <Input
                    type="time"
                    value={workSchedule.exitTime}
                    onChange={(v) =>
                      setWorkSchedule({ ...workSchedule, exitTime: v })
                    }
                    placeholder=""
                  />
                </div>
                <div className="obras-rdo-field">
                  <label>Intervalo entrada</label>
                  <Input
                    type="time"
                    value={workSchedule.breakStart}
                    onChange={(v) =>
                      setWorkSchedule({ ...workSchedule, breakStart: v })
                    }
                    placeholder=""
                  />
                  <small>Horário de almoço / janta / intervalo / pausa</small>
                </div>
                <div className="obras-rdo-field">
                  <label>Intervalo saída</label>
                  <Input
                    type="time"
                    value={workSchedule.breakEnd}
                    onChange={(v) =>
                      setWorkSchedule({ ...workSchedule, breakEnd: v })
                    }
                    placeholder=""
                  />
                </div>
                <div className="obras-rdo-field obras-rdo-total-hours">
                  <label>Hs. trabalhadas</label>
                  <span className="obras-rdo-hours-value">
                    {workSchedule.totalHours}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Seção: Mão de obra */}
          {activeSection === "workforce" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiUsers /> Mão de obra ({workforce.length})
                </h3>
                <Button variant="primary" onClick={handleAddWorker}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              <div className="obras-rdo-add-form">
                <Input
                  type="text"
                  placeholder="Nome do trabalhador"
                  value={newWorker.name}
                  onChange={(v) => setNewWorker({ ...newWorker, name: v })}
                />
                <Input
                  type="text"
                  placeholder="Empresa"
                  value={newWorker.company}
                  onChange={(v) => setNewWorker({ ...newWorker, company: v })}
                />
                <Input
                  type="text"
                  placeholder="Qtd"
                  value={newWorker.quantity.toString()}
                  onChange={(v) =>
                    setNewWorker({ ...newWorker, quantity: parseInt(v) || 1 })
                  }
                  mask="number"
                />
              </div>
              <div className="obras-rdo-list">
                {workforce.map((worker) => (
                  <div key={worker.id} className="obras-rdo-list-item">
                    <div className="obras-rdo-item-info">
                      <strong>{worker.name}</strong>
                      <span>{worker.company}</span>
                    </div>
                    <div className="obras-rdo-item-quantity">
                      <button
                        onClick={() =>
                          setWorkforce(
                            workforce.map((w) =>
                              w.id === worker.id
                                ? {
                                    ...w,
                                    quantity: Math.max(1, w.quantity - 1),
                                  }
                                : w
                            )
                          )
                        }
                      >
                        -
                      </button>
                      <span>{worker.quantity}</span>
                      <button
                        onClick={() =>
                          setWorkforce(
                            workforce.map((w) =>
                              w.id === worker.id
                                ? { ...w, quantity: w.quantity + 1 }
                                : w
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="obras-rdo-remove-btn"
                      onClick={() =>
                        setWorkforce(
                          workforce.filter((w) => w.id !== worker.id)
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

          {/* Seção: Equipamentos */}
          {activeSection === "equipment" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiTool /> Equipamentos ({equipmentUsed.length})
                </h3>
                <Button variant="primary" onClick={handleAddEquipment}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              <div className="obras-rdo-add-form">
                <Input
                  type="text"
                  placeholder="Nome do equipamento"
                  value={newEquipment.name}
                  onChange={(v) =>
                    setNewEquipment({ ...newEquipment, name: v })
                  }
                />
                <Input
                  type="text"
                  placeholder="Código"
                  value={newEquipment.code}
                  onChange={(v) =>
                    setNewEquipment({ ...newEquipment, code: v })
                  }
                />
                <Input
                  type="text"
                  placeholder="Qtd"
                  value={newEquipment.quantity.toString()}
                  onChange={(v) =>
                    setNewEquipment({
                      ...newEquipment,
                      quantity: parseInt(v) || 1,
                    })
                  }
                  mask="number"
                />
              </div>
              <div className="obras-rdo-list">
                {equipmentUsed.map((eq) => (
                  <div key={eq.id} className="obras-rdo-list-item">
                    <div className="obras-rdo-item-info">
                      <strong>{eq.name}</strong>
                      <span>{eq.code}</span>
                    </div>
                    <div className="obras-rdo-item-quantity">
                      <span>{eq.quantity}</span>
                    </div>
                    <button className="obras-rdo-edit-btn" onClick={() => {}}>
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="obras-rdo-remove-btn"
                      onClick={() =>
                        setEquipmentUsed(
                          equipmentUsed.filter((e) => e.id !== eq.id)
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

          {/* Seção: Atividades */}
          {activeSection === "activities" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiActivity /> Atividades ({activitiesList.length})
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
                  <div className="obras-rdo-field">
                    <label>Status</label>
                    <select
                      value={newActivity.status}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          status: e.target.value as ActivityEntry["status"],
                        })
                      }
                      className="obras-select"
                    >
                      <option value="em-andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                      <option value="pausado">Pausado</option>
                    </select>
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
                {activitiesList.map((activity) => (
                  <div key={activity.id} className="obras-rdo-activity-item">
                    <div className="obras-rdo-activity-header">
                      <strong>{activity.description}</strong>
                      <span
                        className={`obras-rdo-progress obras-progress-${activity.status}`}
                      >
                        {activity.progress}%{" "}
                        {activity.status === "em-andamento"
                          ? "Em andamento"
                          : activity.status === "concluido"
                          ? "Concluído"
                          : "Pausado"}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="obras-rdo-activity-details">
                        {activity.details}
                      </p>
                    )}
                    <div className="obras-rdo-activity-actions">
                      <button onClick={() => {}}>
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setActivitiesList(
                            activitiesList.filter((a) => a.id !== activity.id)
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
                <Button variant="primary" onClick={() => {}}>
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>
              {occurrences.length === 0 && (
                <p className="obras-rdo-empty">Nenhuma ocorrência registrada</p>
              )}
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
                  <FiMessageSquare /> {pluralize(comments.length, "Comentário", "Comentários")}
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
                Preencha todas as informações necessárias e salve quando
                terminar.
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
