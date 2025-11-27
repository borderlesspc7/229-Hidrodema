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
  FiCamera,
  FiVideo,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiArrowLeft,
  FiSave,
  FiDroplet,
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
  VideoEntry,
  HydrostaticTestItem,
  TestParameter,
} from "../../../../../services/obrasService";

interface HydrostaticTestFormProps {
  projects: Project[];
  editingEntry: DiaryEntry | null;
  onSave: (data: Partial<DiaryEntry>) => void;
  onBack: () => void;
}

export default function HydrostaticTestForm({
  projects,
  editingEntry,
  onSave,
  onBack,
}: HydrostaticTestFormProps) {
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
      breakStart: "",
      breakEnd: "",
      totalHours: "00:00",
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

  // Comentários/Testes
  const [comments, setComments] = useState<CommentEntry[]>(
    editingEntry?.comments || []
  );
  const [testItems, setTestItems] = useState<HydrostaticTestItem[]>(
    editingEntry?.testItems || []
  );
  const [newTestItem, setNewTestItem] = useState({
    itemName: "",
    result: "pendente" as HydrostaticTestItem["result"],
    notes: "",
  });
  const [currentTestParameters, setCurrentTestParameters] = useState<
    TestParameter[]
  >([]);
  const [newTestParameter, setNewTestParameter] = useState({
    pressure: 0,
    startTime: "",
    endTime: "",
  });

  // Fotos
  const [photos, setPhotos] = useState<Photo[]>(editingEntry?.photos || []);

  // Vídeos
  const [videos, setVideos] = useState<VideoEntry[]>(
    editingEntry?.videos || []
  );

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
      if (!workSchedule.entryTime || !workSchedule.exitTime) return;

      const [entryH, entryM] = workSchedule.entryTime.split(":").map(Number);
      const exitMinutes = workSchedule.exitTime
        ? workSchedule.exitTime.split(":").map(Number)
        : [entryH, entryM];
      const [exitH, exitM] = exitMinutes;

      let breakMinutes = 0;
      if (workSchedule.breakStart && workSchedule.breakEnd) {
        const [breakStartH, breakStartM] = workSchedule.breakStart
          .split(":")
          .map(Number);
        const [breakEndH, breakEndM] = workSchedule.breakEnd
          .split(":")
          .map(Number);
        breakMinutes =
          breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM);
      }

      const entryMinutes = entryH * 60 + entryM;
      const exitTotalMinutes = exitH * 60 + exitM;
      const totalMinutes = exitTotalMinutes - entryMinutes - breakMinutes;

      if (totalMinutes < 0) return;

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

  const handleAddTestParameter = () => {
    if (
      newTestParameter.pressure > 0 &&
      newTestParameter.startTime &&
      newTestParameter.endTime
    ) {
      setCurrentTestParameters([
        ...currentTestParameters,
        { id: Date.now().toString(), ...newTestParameter },
      ]);
      setNewTestParameter({ pressure: 0, startTime: "", endTime: "" });
    }
  };

  const handleAddTestItem = () => {
    if (newTestItem.itemName && currentTestParameters.length > 0) {
      const testItem: HydrostaticTestItem = {
        id: Date.now().toString(),
        itemName: newTestItem.itemName,
        testParameters: [...currentTestParameters],
        result: newTestItem.result,
        notes: newTestItem.notes,
      };

      // Criar comentário com os detalhes do teste
      const testDetails = [
        `Item testado: ${newTestItem.itemName}`,
        ...currentTestParameters.map(
          (param) =>
            `${param.pressure} bar - ${param.startTime}h - ${param.endTime}h`
        ),
        `Teste de estanqueidade: ${newTestItem.result.toUpperCase()}.`,
      ].join("\n");

      setTestItems([...testItems, testItem]);
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: "Usuário",
          text: testDetails,
          date: new Date().toISOString(),
        },
      ]);

      setNewTestItem({ itemName: "", result: "pendente", notes: "" });
      setCurrentTestParameters([]);
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

  const handleSave = () => {
    const data: Partial<DiaryEntry> = {
      projectId,
      reportType: "teste-hidrostatico",
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
      testItems,
      photos,
      videos,
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
      id: "tests",
      label: "Comentários",
      icon: FiDroplet,
      count: testItems.length,
    },
    { id: "photos", label: "Fotos", icon: FiCamera, count: photos.length },
    { id: "videos", label: "Vídeos", icon: FiVideo, count: videos.length },
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

          <h2 className="obras-rdo-title">
            RELATÓRIO DE TESTE HIDROSTÁTICO - RTH
          </h2>

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
                  <label>Entrada / Saída</label>
                  <div className="obras-rdo-time-range">
                    <Input
                      type="time"
                      value={workSchedule.entryTime}
                      onChange={(v) =>
                        setWorkSchedule({ ...workSchedule, entryTime: v })
                      }
                      placeholder=""
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={workSchedule.exitTime}
                      onChange={(v) =>
                        setWorkSchedule({ ...workSchedule, exitTime: v })
                      }
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="obras-rdo-field">
                  <label>Hs. intervalo</label>
                  <div className="obras-rdo-time-range">
                    <Input
                      type="time"
                      value={workSchedule.breakStart}
                      onChange={(v) =>
                        setWorkSchedule({ ...workSchedule, breakStart: v })
                      }
                      placeholder=""
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={workSchedule.breakEnd}
                      onChange={(v) =>
                        setWorkSchedule({ ...workSchedule, breakEnd: v })
                      }
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="obras-rdo-field obras-rdo-total-hours">
                  <label>Hs. trabalhadas</label>
                  <span className="obras-rdo-hours-value">
                    {workSchedule.totalHours || "00:00"}
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

          {/* Seção: Testes/Comentários */}
          {activeSection === "tests" && (
            <div className="obras-rdo-section">
              <div className="obras-rdo-section-header">
                <h3
                  className="obras-section-title"
                  style={{ color: "#ea580c" }}
                >
                  <FiDroplet /> Comentários ({testItems.length})
                </h3>
                <Button
                  variant="primary"
                  onClick={handleAddTestItem}
                  disabled={
                    !newTestItem.itemName || currentTestParameters.length === 0
                  }
                >
                  <FiPlus size={16} /> Adicionar
                </Button>
              </div>

              {/* Formulário para adicionar teste */}
              <div className="obras-test-form">
                <h4>Adicionar item de teste:</h4>
                <div className="obras-rdo-add-form obras-rdo-add-form-vertical">
                  <Input
                    type="text"
                    placeholder='Item testado (ex: Spool: ACQUASAN 8" x 2.1/2" - 53")'
                    value={newTestItem.itemName}
                    onChange={(v) =>
                      setNewTestItem({ ...newTestItem, itemName: v })
                    }
                  />

                  <div className="obras-test-parameters">
                    <h5>Parâmetros de teste:</h5>
                    <div className="obras-rdo-add-form">
                      <div className="obras-rdo-field">
                        <label>Pressão (bar)</label>
                        <Input
                          type="text"
                          placeholder="0"
                          value={
                            newTestParameter.pressure > 0
                              ? newTestParameter.pressure.toString()
                              : ""
                          }
                          onChange={(v) =>
                            setNewTestParameter({
                              ...newTestParameter,
                              pressure: parseFloat(v) || 0,
                            })
                          }
                          mask="number"
                        />
                      </div>
                      <div className="obras-rdo-field">
                        <label>Início</label>
                        <Input
                          type="time"
                          value={newTestParameter.startTime}
                          onChange={(v) =>
                            setNewTestParameter({
                              ...newTestParameter,
                              startTime: v,
                            })
                          }
                          placeholder=""
                        />
                      </div>
                      <div className="obras-rdo-field">
                        <label>Fim</label>
                        <Input
                          type="time"
                          value={newTestParameter.endTime}
                          onChange={(v) =>
                            setNewTestParameter({
                              ...newTestParameter,
                              endTime: v,
                            })
                          }
                          placeholder=""
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleAddTestParameter}
                      >
                        <FiPlus size={16} />
                      </Button>
                    </div>

                    {currentTestParameters.length > 0 && (
                      <div className="obras-test-parameters-list">
                        {currentTestParameters.map((param) => (
                          <div key={param.id} className="obras-test-param-item">
                            <span>
                              {param.pressure} bar - {param.startTime}h -{" "}
                              {param.endTime}h
                            </span>
                            <button
                              onClick={() =>
                                setCurrentTestParameters(
                                  currentTestParameters.filter(
                                    (p) => p.id !== param.id
                                  )
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

                  <div className="obras-rdo-add-form-row">
                    <div className="obras-rdo-field">
                      <label>Resultado</label>
                      <select
                        value={newTestItem.result}
                        onChange={(e) =>
                          setNewTestItem({
                            ...newTestItem,
                            result: e.target
                              .value as HydrostaticTestItem["result"],
                          })
                        }
                        className="obras-select"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="reprovado">Reprovado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de testes registrados */}
              <div className="obras-rdo-comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="obras-rdo-comment-item">
                    <div className="obras-rdo-comment-header">
                      <strong>{comment.author}</strong>
                      <span>{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    <pre className="obras-rdo-comment-text">{comment.text}</pre>
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
                Preencha todas as informações necessárias sobre o teste
                hidrostático e salve quando terminar.
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
