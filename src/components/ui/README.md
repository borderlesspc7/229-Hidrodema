# Componentes UI - Hidrodema

Este diretório contém todos os componentes de interface reutilizáveis do sistema.

## 📦 Componentes Disponíveis

### LoadingScreen

Componente de tela de carregamento com animação de spinner e suporte a diferentes tamanhos.

**Uso:**

```tsx
import LoadingScreen from "../components/ui/LoadingScreen/LoadingScreen";

// Exemplo básico
{loading && <LoadingScreen />}

// Com mensagem personalizada
{loading && <LoadingScreen message="Salvando dados..." />}

// Tamanho pequeno
{loading && <LoadingScreen message="Aguarde..." size="small" />}

// Tamanho grande
{loading && <LoadingScreen message="Processando..." size="large" />}

// Sem fullscreen (relativo ao container)
{loading && <LoadingScreen fullscreen={false} />}
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `message` | `string` | `"Carregando..."` | Mensagem exibida durante o loading |
| `fullscreen` | `boolean` | `true` | Se `true`, cobre toda a tela. Se `false`, cobre apenas o container pai |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | Tamanho do spinner e da mensagem |

---

### Breadcrumb

Componente de navegação breadcrumb que mostra a localização atual do usuário no sistema.

**Uso:**

```tsx
import Breadcrumb from "../components/ui/Breadcrumb/Breadcrumb";

// Modo automático (gera breadcrumb baseado na URL atual)
<Breadcrumb />

// Com itens customizados
<Breadcrumb
  items={[
    { label: "Menu", path: "/menu" },
    { label: "HidroService", path: "/service" },
    { label: "Resistência Química", path: "/service/resistencia-quimica" },
  ]}
  autoGenerate={false}
/>
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `items` | `BreadcrumbItem[]` | `undefined` | Array de itens customizados para o breadcrumb |
| `autoGenerate` | `boolean` | `true` | Se `true`, gera automaticamente baseado na URL. Se `false`, usa os `items` fornecidos |

**BreadcrumbItem:**

```tsx
interface BreadcrumbItem {
  label: string;  // Texto exibido
  path: string;   // Caminho para navegação
}
```

**Mapeamento de Rotas:**

O breadcrumb possui um mapeamento interno de rotas para nomes amigáveis:

- `/menu` → "Menu Principal"
- `/service` → "HidroService"
- `/resistencia-quimica` → "Resistência Química"
- `/acesso-exclusivo` → "Acesso Exclusivo"
- `/equalizador-servicos` → "Equalizador de Serviços"
- E mais...

---

### Button

Componente de botão customizado com múltiplas variantes.

**Uso:**

```tsx
import Button from "../components/ui/Button/Button";

<Button variant="primary" onClick={handleClick}>
  Confirmar
</Button>
```

---

### Card

Componente de card com suporte a diferentes variantes e tamanhos.

**Uso:**

```tsx
import Card from "../components/ui/Card/Card";

<Card
  variant="service"
  title="Título do Card"
  onClick={handleClick}
/>
```

---

### Input

Componente de input com validação e máscaras.

**Uso:**

```tsx
import Input from "../components/ui/Input/Input";

<Input
  type="text"
  placeholder="Digite aqui..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

### Toast

Componente de notificação toast.

**Uso:**

```tsx
import Toast from "../components/ui/Toast/Toast";

<Toast
  message="Operação realizada com sucesso!"
  type="success"
  onClose={handleClose}
/>
```

---

## 🎨 Padrões de Design

### Cores

- **Primary:** `#1e40af` (Azul principal)
- **Primary Light:** `#3b82f6`
- **Accent:** `#60a5fa`
- **Background Dark:** `#0f1419`

### Responsividade

Todos os componentes são responsivos e adaptam-se a diferentes tamanhos de tela:

- **Mobile:** < 480px
- **Tablet:** 480px - 768px
- **Desktop:** > 768px

### Animações

Os componentes utilizam animações suaves para melhorar a experiência do usuário:

- **Fade In:** Componentes aparecem com transição de opacidade
- **Scale In:** Componentes crescem suavemente ao aparecer
- **Spin:** Spinners de loading com rotação contínua

---

## 📱 Acessibilidade

Todos os componentes seguem boas práticas de acessibilidade:

- **ARIA labels** apropriados
- **Navegação por teclado** suportada
- **Contraste de cores** adequado
- **Semântica HTML** correta

---

## 🔧 Manutenção

Ao adicionar novos componentes:

1. Crie uma pasta com o nome do componente
2. Inclua o arquivo `.tsx` e `.css`
3. Documente as props e uso neste README
4. Adicione exemplos de uso
5. Teste em diferentes tamanhos de tela

---

## 📝 Exemplos Práticos

### Loading com Requisições

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.saveData(data);
  } finally {
    setLoading(false);
  }
};

return (
  <>
    {loading && <LoadingScreen message="Salvando dados..." />}
    <button onClick={handleSubmit}>Salvar</button>
  </>
);
```

### Breadcrumb em Páginas

```tsx
// Em cada página, adicione no topo do retorno:
return (
  <div className="page-container">
    <Breadcrumb />
    {/* Resto do conteúdo */}
  </div>
);
```

---

**Desenvolvido para Hidrodema © 2024**

