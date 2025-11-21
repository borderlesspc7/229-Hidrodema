// Este arquivo contém todos os handlers CRUD para os módulos do Gerenciamento de Obras
// Importado e usado no componente principal

import type {
  Supplier,
  TeamMember,
  Equipment,
  Schedule,
  SafetyRecord,
  Measurement,
  Issue,
  DocumentRecord,
  QualityChecklist,
} from "../../../services/obrasService";

// Helper para criar handlers genéricos
export const createGenericHandlers = <T extends { id?: string }>(
  service: {
    create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>;
    update: (id: string, data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    delete: (id: string) => Promise<void>;
  },
  showToast: (message: string, type: "success" | "error" | "warning" | "info") => void,
  refreshData: () => Promise<void>,
  entityName: string
) => {
  const handleCreate = async (
    data: Omit<T, "id" | "createdAt" | "updatedAt">,
    editingItem: T | null
  ) => {
    try {
      if (editingItem && editingItem.id) {
        await service.update(editingItem.id, data);
        showToast(`${entityName} atualizado com sucesso!`, "success");
      } else {
        await service.create(data);
        showToast(`${entityName} cadastrado com sucesso!`, "success");
      }
      await refreshData();
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${entityName}:`, error);
      showToast(`Erro ao salvar ${entityName}. Tente novamente.`, "error");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Tem certeza que deseja excluir este ${entityName}?`)) {
      try {
        await service.delete(id);
        await refreshData();
        showToast(`${entityName} excluído com sucesso!`, "success");
      } catch (error) {
        console.error(`Erro ao excluir ${entityName}:`, error);
        showToast(`Erro ao excluir ${entityName}. Tente novamente.`, "error");
      }
    }
  };

  return {
    handleCreate,
    handleDelete,
  };
};

