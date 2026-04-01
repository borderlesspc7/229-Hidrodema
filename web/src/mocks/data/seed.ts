import type {
  Chamado,
  ChamadoStatus,
  ChamadoTipo,
  FinanceiroResumo,
  Locadora,
  PedidoVenda,
  Produto,
  Profissional,
  Transacao,
  TransacaoCategoria,
} from '@/types/domain'

export const locadorasSeed: Locadora[] = [
  {
    id: '1',
    nomeFantasia: 'CleanRent Recife',
    razaoSocial: 'CleanRent Serviços Ltda',
    cnpj: '12.345.678/0001-90',
    cidade: 'Recife',
    estado: 'PE',
    responsavel: 'Maria Silva',
    email: 'contato@cleanrent.example',
    telefone: '(81) 99999-1111',
    endereco: 'Av. Boa Viagem, 1200 — Boa Viagem',
    status: 'ativa',
  },
  {
    id: '2',
    nomeFantasia: 'Lavanderia Pro Sul',
    razaoSocial: 'Lavanderia Pro Sul ME',
    cnpj: '98.765.432/0001-10',
    cidade: 'Porto Alegre',
    estado: 'RS',
    responsavel: 'João Cardoso',
    email: 'ops@lavprosul.example',
    telefone: '(51) 98888-2222',
    endereco: 'Rua dos Andradas, 450 — Centro Histórico',
    status: 'ativa',
  },
  {
    id: '3',
    nomeFantasia: 'Máquinas SP Express',
    razaoSocial: 'SP Express Locações SA',
    cnpj: '11.222.333/0001-44',
    cidade: 'São Paulo',
    estado: 'SP',
    responsavel: 'Ana Pereira',
    email: 'comercial@spexpress.example',
    telefone: '(11) 97777-3333',
    endereco: 'Rua Vergueiro, 2100 — Vila Mariana',
    status: 'inativa',
  },
  {
    id: '4',
    nomeFantasia: 'Rio Clean Equipamentos',
    razaoSocial: 'Rio Clean LTDA',
    cnpj: '22.333.444/0001-55',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    responsavel: 'Paulo Nunes',
    email: 'vendas@rioclean.example',
    telefone: '(21) 96666-4444',
    endereco: 'Av. das Américas, 3200 — Barra',
    status: 'ativa',
  },
  {
    id: '5',
    nomeFantasia: 'Nordeste Higienização',
    razaoSocial: 'Nordeste Higienização EIRELI',
    cnpj: '33.444.555/0001-66',
    cidade: 'Salvador',
    estado: 'BA',
    responsavel: 'Larissa Azevedo',
    email: 'operacoes@nordeste-hig.example',
    telefone: '(71) 95555-5555',
    endereco: 'Rua Chile, 45 — Comércio',
    status: 'ativa',
  },
  {
    id: '6',
    nomeFantasia: 'Brasília Carpet Center',
    razaoSocial: 'BCC Locações SA',
    cnpj: '44.555.666/0001-77',
    cidade: 'Brasília',
    estado: 'DF',
    responsavel: 'Eduardo Mattos',
    email: 'central@bcc-df.example',
    telefone: '(61) 94444-6666',
    endereco: 'SHS EQ, Bloco C — Asa Sul',
    status: 'ativa',
  },
]

const nomesProf = [
  ['p1', 'Carlos Mendes'],
  ['p2', 'Fernanda Lima'],
  ['p3', 'Ricardo Souza'],
  ['p4', 'Juliana Costa'],
  ['p5', 'Amanda Rocha'],
  ['p6', 'Bruno Alves'],
  ['p7', 'Patrícia Nogueira'],
  ['p8', 'Felipe Duarte'],
  ['p9', 'Camila Freitas'],
  ['p10', 'Gustavo Ramos'],
  ['p11', 'Tatiane Melo'],
  ['p12', 'Diego Fernandes'],
] as const

export const profissionaisSeed: Profissional[] = nomesProf.map(([id, nome], i) => ({
  id,
  nome,
  cpf: String((10000000000 + i * 9990457) % 99999999999).padStart(11, '0'),
  email: `${nome.split(' ')[0].toLowerCase()}.${id}@example.com`,
  telefone: `(81) 9${1000 + i}-${2000 + i}`,
  status:
    i === 10
      ? 'reprovado'
      : i % 5 === 1 || i % 7 === 3
        ? 'pendente'
        : 'aprovado',
  saldoTaxaHabilitacao: i % 4 === 1 ? Math.round(450 + i * 120) : 0,
}))

const statusRotacao: ChamadoStatus[] = [
  'aberto',
  'em_selecao',
  'em_andamento',
  'concluido',
  'cancelado',
]

function lancesPara(
  tipo: ChamadoTipo,
  i: number,
): Chamado['lances'] | undefined {
  if (tipo !== 'lance') return undefined
  if (i % 5 === 2) return []
  const base = 4000 + (i % 12) * 350
  return [
    { profissionalId: 'p1', profissionalNome: 'Carlos Mendes', valor: base + 200 },
    { profissionalId: 'p4', profissionalNome: 'Juliana Costa', valor: base - 150 },
    { profissionalId: 'p6', profissionalNome: 'Bruno Alves', valor: base + 80 },
  ]
}

function profDireto(i: number): string | undefined {
  if (i % 3 !== 0) return undefined
  return nomesProf[i % nomesProf.length][1]
}

export const chamadosSeed: Chamado[] = (() => {
  const out: Chamado[] = []
  for (let i = 0; i < 56; i++) {
    const loc = locadorasSeed[i % locadorasSeed.length]
    const tipo: ChamadoTipo = i % 3 === 0 ? 'direto' : 'lance'
    const status = statusRotacao[i % statusRotacao.length]
    const m2 = 90 + ((i * 37) % 920)
    const baseM2 = 14 + (i % 11) * 0.85
    const id = `c${i + 1}`
    const diasAtras = (i * 5) % 104
    const d = new Date(2026, 0, 4)
    d.setDate(d.getDate() + diasAtras)
    out.push({
      id,
      tipo,
      status,
      localizacao: `${['Shopping', 'Hospital', 'Hotel', 'Corporate', 'Condomínio'][i % 5]} ${loc.cidade} — Ref. ${i + 1}`,
      metragemM2: m2,
      valorBaseM2: Math.round(baseM2 * 10) / 10,
      valorTotal: Math.round(m2 * baseM2),
      criadoEm: d.toISOString(),
      locadoraId: loc.id,
      regiao: loc.estado,
      lances: lancesPara(tipo, i),
      profissionalAtribuido:
        tipo === 'direto' && status !== 'aberto' && status !== 'cancelado'
          ? profDireto(i) ?? 'Carlos Mendes'
          : undefined,
    })
  }
  return out
})()

const tipoLabel: Record<TransacaoCategoria, string> = {
  taxa_plataforma: 'Taxa plataforma',
  repasse_profissional: 'Repasse profissional',
  repasse_locadora: 'Pagamento locadora',
  venda_produto: 'Venda marketplace',
  desconto_habilitacao: 'Desconto taxa habilitação',
  outro: 'Ajuste / outro',
}

function categoriaFromIdx(i: number): TransacaoCategoria {
  const r = i % 11
  if (r <= 2) return 'taxa_plataforma'
  if (r <= 5) return 'repasse_profissional'
  if (r <= 7) return 'repasse_locadora'
  if (r === 8) return 'venda_produto'
  if (r === 9) return 'desconto_habilitacao'
  return 'outro'
}

export const transacoesSeed: Transacao[] = (() => {
  const out: Transacao[] = []
  for (let i = 0; i < 132; i++) {
    const cat = categoriaFromIdx(i)
    const loc = locadorasSeed[i % locadorasSeed.length]
    const dia = 1 + (i * 2) % 100
    const mes = (i % 4) as 0 | 1 | 2 | 3
    const ano = mes === 0 && i > 80 ? 2025 : 2026
    const d = new Date(ano, mes, Math.min(dia, 28))
    let valor = 800 + (i * 173) % 12000
    if (cat === 'desconto_habilitacao') valor = -Math.round(200 + (i % 5) * 90)
    if (cat === 'taxa_plataforma') valor = Math.round(valor * 0.18)
    const profId =
      cat === 'repasse_profissional' ? nomesProf[i % nomesProf.length][0] : undefined
    out.push({
      id: `t${i + 1}`,
      data: d.toISOString(),
      tipo: tipoLabel[cat],
      valor,
      referencia:
        cat === 'repasse_profissional'
          ? `Chamado #c${(i % 48) + 1} — 80%`
          : cat === 'taxa_plataforma'
            ? `Chamado #c${(i % 48) + 1} — 20%`
            : `${tipoLabel[cat]} — ${loc.nomeFantasia}`,
      categoria: cat,
      locadoraId:
        cat === 'repasse_profissional' || cat === 'desconto_habilitacao'
          ? undefined
          : loc.id,
      profissionalId: profId,
    })
  }
  return out
})()

export const pedidosVendaSeed: PedidoVenda[] = (() => {
  const skus = [
    ['CC-SOL-500', 'ClearCarpet Solution 500ml'],
    ['CC-SOL-5L', 'ClearCarpet Solution 5L'],
    ['CC-PRE-1L', 'Pré-limpeza Carpetes 1L'],
    ['CC-ODR-2L', 'Odor Block Pro 2L'],
  ] as const
  const out: PedidoVenda[] = []
  for (let i = 0; i < 86; i++) {
    const loc = locadorasSeed[i % locadorasSeed.length]
    const [sku, nome] = skus[i % skus.length]
    const q = 1 + (i % 12)
    const unit = 80 + (i % 8) * 45
    const mes = (i % 4) as 0 | 1 | 2 | 3
    const d = new Date(2026, mes, 3 + (i % 25))
    out.push({
      id: `pv${i + 1}`,
      data: d.toISOString(),
      valorTotal: Math.round(q * unit * 100) / 100,
      quantidade: q,
      locadoraId: loc.id,
      produtoSku: sku,
      produtoNome: nome,
    })
  }
  return out
})()

export const financeiroResumoSeed: FinanceiroResumo = {
  repassesPendentes: 28420.75,
  taxaPlataformaMes: 11240,
  proximosPagamentos: [
    { descricao: 'Repasse Carlos Mendes', data: '2026-03-28', valor: 5120 },
    { descricao: 'Repasse CleanRent Recife', data: '2026-03-29', valor: 3800 },
    { descricao: 'Repasse Rio Clean', data: '2026-03-30', valor: 2650 },
  ],
}

export const produtosSeed: Produto[] = [
  {
    id: 'pr1',
    sku: 'CC-SOL-500',
    nome: 'ClearCarpet Solution 500ml',
    preco: 89.9,
    estoqueAgregado: 412,
    linha: 'ClearCarpet Solution',
  },
  {
    id: 'pr2',
    sku: 'CC-SOL-5L',
    nome: 'ClearCarpet Solution 5L',
    preco: 720,
    estoqueAgregado: 76,
    linha: 'ClearCarpet Solution',
  },
  {
    id: 'pr3',
    sku: 'CC-PRE-1L',
    nome: 'Pré-limpeza Carpetes 1L',
    preco: 112.5,
    estoqueAgregado: 158,
    linha: 'Profissional',
  },
  {
    id: 'pr4',
    sku: 'CC-ODR-2L',
    nome: 'Odor Block Pro 2L',
    preco: 198,
    estoqueAgregado: 64,
    linha: 'Premium',
  },
]
