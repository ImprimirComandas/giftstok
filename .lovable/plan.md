

## Plano: Pagina /install + Confetti na Primeira Calculação

### 1. Criar página `/install` (`src/pages/Install.tsx`)
- Instruções visuais para instalar o app no celular
- Seções separadas para **iOS** (Safari → Compartilhar → Adicionar à Tela Inicial) e **Android** (Chrome → Menu → Instalar app)
- Ícones ilustrativos com lucide-react (Share, MoreVertical, Download, Smartphone)
- Botão "Instalar Agora" que dispara o prompt nativo `beforeinstallprompt` (quando disponível no Android/Chrome)
- Design mobile-first com cards glassmorphism, consistente com o tema atual
- Botão de voltar para a home

### 2. Adicionar rota no `App.tsx`
- `<Route path="/install" element={<Install />} />`

### 3. Adicionar link para `/install` no header da `Index.tsx`
- Ícone discreto de download no header ao lado do título "GiftsTok"

### 4. Animação de Confetti (`src/components/Calculator.tsx`)
- Instalar `canvas-confetti` (leve, ~6KB)
- Na função `handleCalculate`, verificar se é a primeira vez usando `localStorage` (chave `giftstok_first_calc`)
- Se for a primeira vez: disparar confetti por 2-3 segundos após o cálculo, salvar flag no localStorage
- Confetti com cores neon do tema (cyan, pink, purple)

### Arquivos Alterados
- `src/pages/Install.tsx` — nova página
- `src/App.tsx` — nova rota
- `src/pages/Index.tsx` — link para /install no header
- `src/components/Calculator.tsx` — confetti na primeira calculação
- `package.json` — adicionar `canvas-confetti`

