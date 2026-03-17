

## Plano: Redesign Completo Mobile-First + PWA

### Visao Geral
Recriar todo o design com abordagem mobile-first, transformar em PWA instalavel, e reorganizar a UX para fluxo de tela unica (sem Hero separado).

### 1. Configurar PWA
- Instalar `vite-plugin-pwa`
- Configurar em `vite.config.ts` com manifest, icons, service worker
- Adicionar `navigateFallbackDenylist: [/^\/~oauth/]`
- Atualizar `index.html` com meta tags mobile (theme-color, apple-mobile-web-app, viewport)
- Criar icones PWA em `/public` (192x192, 512x512 placeholder)

### 2. Redesign do Layout Principal (`Index.tsx`)
- Eliminar a tela Hero separada - ir direto para a calculadora
- Layout single-page mobile-first com scroll suave entre secoes
- Header compacto fixo no topo com logo/titulo
- Bottom navigation bar fixa no mobile (Calculadora, Niveis, Grafico)

### 3. Redesign da Calculadora (`Calculator.tsx`)
- Layout vertical compacto otimizado para tela de celular
- Card de preco menor e mais clean
- Input de pontos com tamanho grande e touch-friendly (min 48px height)
- Botao calcular full-width com visual mais moderno
- Botao de desconto como link sutil abaixo
- Remover padding excessivo, usar spacing mobile-friendly

### 4. Redesign dos StatsCards (`StatsCards.tsx`)
- Layout em coluna unica no mobile (stack vertical)
- Cards mais compactos com informacao essencial
- Swipeable cards no mobile (carrossel horizontal opcional)
- Grid 3 colunas apenas em desktop

### 5. Redesign da LevelsTable (`LevelsTable.tsx`)
- Transformar tabela em lista de cards no mobile (tabela nao funciona bem)
- Cada nivel como card compacto com info essencial
- Scroll virtual ou lazy load para performance (50 niveis)
- Manter tabela apenas para desktop (>768px)

### 6. Redesign do CoinPriceChart
- Chart responsivo que ocupa largura total
- Filtros de periodo como pills horizontais scrollaveis
- Tooltip adaptado para touch

### 7. Atualizar Estilos Globais (`index.css`)
- Ajustar font-sizes para mobile (base 14px)
- Safe area insets para notch/bottom bar
- Touch targets minimos de 44px
- Scrollbar customizada mais fina

### 8. Atualizar `index.html`
- Meta tags: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- Manifest link

### Arquivos Alterados
- `vite.config.ts` - PWA plugin
- `index.html` - meta tags mobile + manifest
- `src/main.tsx` - register SW
- `src/index.css` - estilos globais mobile-first
- `src/App.tsx` - layout wrapper
- `src/pages/Index.tsx` - remover Hero, layout direto
- `src/components/Calculator.tsx` - redesign mobile
- `src/components/StatsCards.tsx` - redesign mobile
- `src/components/LevelsTable.tsx` - cards no mobile
- `src/components/CoinPriceChart.tsx` - responsivo
- `src/components/Hero.tsx` - remover ou simplificar (manter apenas titulo inline)
- `public/manifest.json` - novo
- `public/pwa-192x192.png`, `public/pwa-512x512.png` - icones placeholder

### Detalhes Tecnicos
- `vite-plugin-pwa` com `registerType: 'autoUpdate'`, `workbox.navigateFallbackDenylist: [/^\/~oauth/]`
- Manifest com `display: standalone`, `theme_color`, `background_color` matching dark theme
- Breakpoints: mobile (<768px) como default, tablet/desktop como override
- Todos os touch targets >= 44px
- `env.d.ts` atualizar para `virtual:pwa-register`

