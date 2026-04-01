import type {
  AnalyticsDataset,
  Chamado,
  ChamadoTipo,
  DashboardSummary,
  FinanceiroResumo,
  Locadora,
  PedidoVenda,
  Produto,
  Profissional,
  Transacao,
} from '@/types/domain'
import { computeDashboardSummary } from '@/mocks/services/computeDashboard'
import { getDb } from '@/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'

// ============================================================================
// Funções de LEITURA
// ============================================================================


export async function fetchDashboard(): Promise<DashboardSummary> {
  const dataset = await fetchAnalyticsDataset()
  return computeDashboardSummary(dataset)
}

export async function listLocadoras() {
  const db = getDb()
  const collRef = collection(db, 'locadoras')
  const snap = await getDocs(collRef)
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Locadora, 'id'>) } as Locadora),
  )
}

export async function getLocadoraById(id: string) {
  const db = getDb()
  const snap = await getDoc(doc(db, 'locadoras', id))
  if (!snap.exists()) return null
  const data = snap.data() as Locadora
  return { ...data, id: snap.id }
}

export async function listProfissionais() {
  const db = getDb()
  const collRef = collection(db, 'profissionais')
  const snap = await getDocs(collRef)
  return snap.docs.map(
    (d) =>
      ({ id: d.id, ...(d.data() as Omit<Profissional, 'id'>) } as Profissional),
  )
}

export async function listChamados(tipo?: ChamadoTipo) {
  const db = getDb()
  const collRef = collection(db, 'chamados')
  const snap = await getDocs(collRef)
  const chamados = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Chamado, 'id'>) } as Chamado),
  )
  return tipo ? chamados.filter((c) => c.tipo === tipo) : chamados
}

export async function getChamadoById(id: string) {
  const db = getDb()
  const snap = await getDoc(doc(db, 'chamados', id))
  if (!snap.exists()) return null
  const data = snap.data() as Chamado
  return { ...data, id: snap.id }
}

export async function fetchFinanceiro() {
  const db = getDb()
  const transacoes = await fetchTransacoes()
  const resumoSnap = await getDoc(doc(db, 'financeiroResumo', 'default'))
  const resumo = resumoSnap.exists()
    ? (resumoSnap.data() as FinanceiroResumo)
    : {
        repassesPendentes: 0,
        taxaPlataformaMes: 0,
        proximosPagamentos: [],
      }
  return { resumo, transacoes }
}

export async function listProdutos() {
  const db = getDb()
  const collRef = collection(db, 'produtos')
  const snap = await getDocs(collRef)
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Produto, 'id'>) } as Produto),
  )
}

export async function fetchTransacoes() {
  const db = getDb()
  const collRef = collection(db, 'transacoes')
  const snap = await getDocs(collRef)
  return snap.docs.map(
    (d) =>
      ({ id: d.id, ...(d.data() as Omit<Transacao, 'id'>) } as Transacao),
  )
}

export async function fetchAnalyticsDataset(): Promise<AnalyticsDataset> {
  const [chamados, transacoes, pedidos, locadoras, profissionais] =
    await Promise.all([
      (async () => {
        const db = getDb()
        const snap = await getDocs(collection(db, 'chamados'))
        return snap.docs.map(
          (d) =>
            ({ id: d.id, ...(d.data() as Omit<Chamado, 'id'>) } as Chamado),
        )
      })(),
      fetchTransacoes(),
      (async () => {
        const db = getDb()
        const snap = await getDocs(collection(db, 'pedidosVenda'))
        return snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...(d.data() as Omit<PedidoVenda, 'id'>),
            } as PedidoVenda),
        )
      })(),
      listLocadoras(),
      listProfissionais(),
    ])

  return {
    chamados,
    transacoes,
    pedidos,
    locadoras,
    profissionais,
  }
}

// ============================================================================
// Funções de CREATE/UPDATE (com suporte a userId)
// ============================================================================

export async function createLocadora(
  userId: string,
  data: Omit<Locadora, 'id'>,
) {
  const db = getDb()
  const docRef = await addDoc(collection(db, 'locadoras'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateLocadora(id: string, data: Partial<Locadora>) {
  const db = getDb()
  await updateDoc(doc(db, 'locadoras', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function createProduto(
  userId: string,
  data: Omit<Produto, 'id'>,
) {
  const db = getDb()
  const docRef = await addDoc(collection(db, 'produtos'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateProduto(id: string, data: Partial<Produto>) {
  const db = getDb()
  await updateDoc(doc(db, 'produtos', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function createTransacao(
  userId: string,
  data: Omit<Transacao, 'id'>,
) {
  const db = getDb()
  const docRef = await addDoc(collection(db, 'transacoes'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateTransacao(id: string, data: Partial<Transacao>) {
  const db = getDb()
  await updateDoc(doc(db, 'transacoes', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function fetchTransacoesByUserId(userId: string) {
  const db = getDb()
  const q = query(
    collection(db, 'transacoes'),
    where('createdBy', '==', userId),
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) =>
      ({ id: d.id, ...(d.data() as Omit<Transacao, 'id'>) } as Transacao),
  )
}

export async function fetchLocadorasByUserId(userId: string) {
  const db = getDb()
  const q = query(
    collection(db, 'locadoras'),
    where('createdBy', '==', userId),
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Locadora, 'id'>) } as Locadora),
  )
}

export async function fetchProdutosByUserId(userId: string) {
  const db = getDb()
  const q = query(
    collection(db, 'produtos'),
    where('createdBy', '==', userId),
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Produto, 'id'>) } as Produto),
  )
}

