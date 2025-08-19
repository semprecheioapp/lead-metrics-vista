# PRD - Sistema de Design de Cores Dashboard MBK

## 📋 Visão Geral
Este documento detalha o sistema completo de cores, gradientes e efeitos visuais do HyperiaDash, baseado em tokens HSL semânticos para suporte completo a temas claro e escuro.

## 🎨 Cores Principais da Marca

### HyperiaDash Core Colors
```css
--hyperia-purple: 263 96% 55%  /* Roxo vibrante principal */
--hyperia-blue: 217 91% 60%    /* Azul complementar */
```

**Uso:** Logo, elementos de destaque, gradientes principais

## 🌈 Sistema de Cores Semânticas

### Theme Light (Padrão)

#### Cores de Background
- **Background Principal:** `0 0% 100%` (Branco puro)
- **Cards:** `0 0% 100%` (Branco puro)
- **Dashboard BG:** `0 0% 98%` (Branco suave)
- **Sidebar BG:** `0 0% 100%` (Branco puro)

#### Cores de Texto
- **Foreground Principal:** `222.2 84% 4.9%` (Quase preto)
- **Muted Foreground:** `215.4 16.3% 46.9%` (Cinza médio)
- **Sidebar Foreground:** `240 5.3% 26.1%` (Cinza escuro)

#### Cores de Ação
- **Primary:** `263 96% 55%` (Roxo HyperiaDash)
- **Primary Glow:** `263 96% 65%` (Roxo mais claro)
- **Secondary:** `210 40% 96.1%` (Cinza muito claro)
- **Accent:** `210 40% 96.1%` (Cinza muito claro)

#### Estados e Feedback
- **Success:** `142.1 76.2% 36.3%` (Verde)
- **Warning:** `32.2 94.6% 43.7%` (Laranja)
- **Destructive:** `0 84.2% 60.2%` (Vermelho)

#### Métricas
- **Metric Positive:** `142.1 76.2% 36.3%` (Verde para valores positivos)
- **Metric Negative:** `0 84.2% 60.2%` (Vermelho para valores negativos)
- **Metric Neutral:** `217.2 91.2% 59.8%` (Azul para valores neutros)

### Theme Dark

#### Cores de Background
- **Background Principal:** `222.2 84% 4.9%` (Azul escuro profundo)
- **Cards:** `222.2 84% 4.9%` (Azul escuro profundo)
- **Dashboard BG:** `222.2 84% 4.9%` (Azul escuro profundo)
- **Sidebar BG:** `217.2 32.6% 17.5%` (Azul escuro médio)

#### Cores de Texto
- **Foreground Principal:** `210 40% 98%` (Branco suave)
- **Muted Foreground:** `215 20.2% 65.1%` (Cinza claro)
- **Sidebar Foreground:** `210 20% 98%` (Branco suave)

#### Cores de Ação
- **Primary:** `210 40% 98%` (Branco suave no dark)
- **Primary Glow:** `217.2 91.2% 69.8%` (Azul brilhante)
- **Secondary:** `217.2 32.6% 17.5%` (Azul escuro médio)
- **Accent:** `217.2 32.6% 17.5%` (Azul escuro médio)

## 🎨 Gradientes e Efeitos

### Gradientes HyperiaDash
```css
.bg-hyperia-gradient {
  background: linear-gradient(135deg, 
    hsl(var(--hyperia-purple)) 0%, 
    hsl(var(--hyperia-blue)) 100%
  );
}

.text-hyperia-gradient {
  background: linear-gradient(135deg, 
    hsl(var(--hyperia-purple)) 0%, 
    hsl(var(--hyperia-blue)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Efeitos de Hover
```css
.hover-lift {
  /* Elevação suave */
  transition: all 300ms;
  hover: translate-y(-4px) + shadow-xl;
}

.hover-lift-strong {
  /* Elevação intensa */
  transition: all 300ms;
  hover: translate-y(-8px) + shadow-2xl;
}
```

## 🎯 Componentes e Uso das Cores

### Botões
- **Primary Button:** `bg-primary text-primary-foreground`
- **Secondary Button:** `bg-secondary text-secondary-foreground`
- **Destructive Button:** `bg-destructive text-destructive-foreground`
- **Outline Button:** `border-border text-foreground hover:bg-accent`

### Cards e Containers
- **Card:** `bg-card text-card-foreground border-border`
- **Popover:** `bg-popover text-popover-foreground border-border`
- **Muted Areas:** `bg-muted text-muted-foreground`

### Sidebar
- **Background:** `bg-sidebar-background text-sidebar-foreground`
- **Active Item:** `bg-sidebar-accent text-sidebar-accent-foreground`
- **Border:** `border-sidebar-border`

### Métricas e Status
- **Positive Trend:** `text-metric-positive` (Verde)
- **Negative Trend:** `text-metric-negative` (Vermelho)
- **Neutral Trend:** `text-metric-neutral` (Azul)

## 🔧 Animações Disponíveis

### Keyframes Definidos
- **accordion-down/up:** Para elementos expansíveis
- **shimmer-slide:** Efeito de brilho
- **spin-around:** Rotação complexa
- **fade-in/slide-up:** Entrada suave
- **pulse-gentle:** Pulsação sutil
- **border-beam:** Animação de borda
- **rainbow:** Gradiente animado

### Classes de Animação
```css
.animate-fade-in      /* Aparição suave */
.animate-slide-up     /* Deslize para cima */
.animate-pulse-gentle /* Pulsação suave */
.theme-transition     /* Transição de tema */
```

## 📱 Responsividade e Acessibilidade

### Mobile Optimizations
- **Touch Targets:** Mínimo 44px x 44px
- **Font Sizes:** Ajustados para legibilidade mobile
- **Hover Effects:** Removidos em dispositivos touch

### Preferências de Usuário
- **Reduced Motion:** Animações desabilitadas quando preferido
- **High Contrast:** Cores ajustadas automaticamente
- **Theme Switching:** Transição suave entre claro/escuro

## 🎯 Diretrizes de Uso

### ✅ Boas Práticas
1. **Sempre use tokens semânticos:** `bg-primary` ao invés de `bg-purple-600`
2. **Respeite a hierarquia:** `primary` > `secondary` > `muted`
3. **Mantenha contraste:** Use `foreground` colors apropriadas
4. **Use gradientes com moderação:** Apenas em elementos de destaque

### ❌ Evitar
1. **Cores hardcoded:** Nunca `text-white` ou `bg-black`
2. **Misturar sistemas:** Use apenas tokens HSL definidos
3. **Gradientes excessivos:** Podem causar fadiga visual
4. **Ignorar dark mode:** Sempre teste ambos os temas

## 🔄 Manutenção e Evolução

### Adicionando Novas Cores
1. Definir no `index.css` em formato HSL
2. Adicionar ao `tailwind.config.ts`
3. Documentar o uso neste PRD
4. Testar em ambos os temas

### Versionamento
- **v1.0:** Sistema atual com cores HyperiaDash
- **Futuro:** Possível expansão para temas personalizáveis

---

**Última atualização:** Dezembro 2024  
**Responsável:** Equipe de Design HyperiaDash