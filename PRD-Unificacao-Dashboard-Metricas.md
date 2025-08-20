# PRD: Unificação Dashboard e Métricas
**Product Requirements Document**

---

## 📋 Resumo Executivo

### Problema Atual
- Duas páginas separadas (Dashboard `/` e Métricas `/metricas`) com propósitos similares
- Redundância de informações e navegação confusa para usuários
- Dispersão de métricas importantes em locais diferentes
- Experiência de usuário fragmentada

### Solução Proposta
Unificar as páginas em um **Dashboard Único** que combine:
- Visão geral executiva (atual Dashboard)
- Métricas detalhadas (atual Métricas) 
- Análises avançadas em abas organizadas
- Interface responsiva e intuitiva

---

## 🎯 Objetivos

### Objetivos Primários
1. **Centralizar** todas as métricas em uma única página
2. **Eliminar** redundâncias e confusão na navegação
3. **Melhorar** a experiência do usuário (UX)
4. **Otimizar** performance com carregamento inteligente

### Objetivos Secundários
1. Manter compatibilidade com rotas existentes
2. Preservar funcionalidades atuais
3. Facilitar manutenção futura
4. Preparar base para novas funcionalidades

---

## 👥 Personas e Use Cases

### Personas
1. **Gestor/Admin**: Precisa de visão geral + métricas detalhadas
2. **Vendedor**: Foca em conversões e performance de leads
3. **Atendente**: Interessa-se por métricas de WhatsApp e tempo resposta
4. **Super Admin**: Necessita de todas as métricas consolidadas

### Use Cases Principais
1. **UC001**: Visualizar métricas gerais rapidamente (Dashboard cards)
2. **UC002**: Analisar performance detalhada (Gráficos e tendências)
3. **UC003**: Comparar períodos diferentes
4. **UC004**: Exportar/compartilhar insights
5. **UC005**: Navegar entre diferentes análises facilmente

---

## 🏗️ Arquitetura da Solução

### Estrutura da Nova Página Unificada

```
/dashboard (rota principal)
├── Header com filtros globais (período, empresa)
├── Cards de Métricas Principais (KPIs)
├── Navegação por Abas:
│   ├── 📊 Visão Geral
│   ├── 📈 Performance
│   ├── 💬 WhatsApp Analytics  
│   ├── 🎯 Conversões
│   ├── 📋 Follow-ups
│   └── 🤖 AI Insights
└── Footer com ações rápidas
```

### Componentes Reutilizáveis
- `MetricCard` - Cards de métricas principais
- `PerformanceChart` - Gráficos de performance
- `PeriodSelector` - Seletor de período
- `TabsContainer` - Container das abas principais
- `ExportActions` - Ações de exportar/compartilhar

---

## 🔧 Requisitos Funcionais

### RF001 - Dashboard Unificado
- [ ] Página única acessível em `/` (dashboard principal)
- [ ] Redirecionamento de `/metricas` para `/` 
- [ ] Manter breadcrumbs e navegação consistente

### RF002 - Métricas Principais (KPI Cards)
- [ ] Total de Atendimentos (Memória AI)
- [ ] Leads Qualificados 
- [ ] Taxa de Conversão
- [ ] Tempo Médio de Resposta
- [ ] Leads Convertidos
- [ ] Sessões Únicas

### RF003 - Sistema de Abas
- [ ] **Visão Geral**: Cards + gráfico principal
- [ ] **Performance**: Gráficos de tendência e comparações
- [ ] **WhatsApp**: Métricas específicas do WhatsApp
- [ ] **Conversões**: Análise de funil e conversões
- [ ] **Follow-ups**: Status e performance de follow-ups
- [ ] **AI Insights**: Dashboard de IA atual

### RF004 - Filtros e Controles
- [ ] Seletor de período (24h, 7d, 30d, 90d, personalizado)
- [ ] Filtro por empresa (se super admin)
- [ ] Refresh automático (30s)
- [ ] Botão de refresh manual

### RF005 - Responsividade
- [ ] Design mobile-first
- [ ] Adaptação para tablet
- [ ] Layout desktop otimizado
- [ ] Cards empilháveis em telas pequenas

---

## 🎨 Requisitos de Interface (UI/UX)

### RUI001 - Design System
- [ ] Usar tokens do design system (cores HSL)
- [ ] Componentes shadcn/ui consistentes
- [ ] Animações suaves entre abas
- [ ] Loading states elegantes

### RUI002 - Navegação
- [ ] Tabs com indicadores visuais claros
- [ ] Breadcrumbs atualizados
- [ ] Sidebar com item "Dashboard" ativo
- [ ] Atalhos de teclado (Tab, Arrows)

### RUI003 - Performance Visual
- [ ] Skeleton loading para cards
- [ ] Lazy loading para gráficos pesados
- [ ] Transições suaves (300ms)
- [ ] Estados de erro elegantes

---

## ⚡ Requisitos Não-Funcionais

### RNF001 - Performance
- [ ] Carregamento inicial < 2s
- [ ] Transição entre abas < 300ms
- [ ] Refresh de dados < 1s
- [ ] Cache inteligente (5min TTL)

### RNF002 - Acessibilidade
- [ ] ARIA labels em todos os componentes
- [ ] Navegação por teclado completa
- [ ] Contraste adequado (WCAG 2.1)
- [ ] Screen reader friendly

### RNF003 - Compatibilidade
- [ ] Chrome 90+, Firefox 88+, Safari 14+
- [ ] Dispositivos móveis iOS/Android
- [ ] Tablets em orientação portrait/landscape

---

## 📊 Estrutura de Dados

### Hooks Necessários
```typescript
// Dados consolidados
const { data: dashboardData } = useDashboardData(period);
const { data: whatsappStats } = useWhatsAppStats(period);
const { data: conversionMetrics } = useConversionMetrics(period);
const { data: followupStats } = useFollowupStats(period);

// Estados globais
const [activeTab, setActiveTab] = useState('overview');
const [period, setPeriod] = useState('7d');
const [autoRefresh, setAutoRefresh] = useState(true);
```

### Estrutura de Abas
```typescript
const dashboardTabs = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'conversions', label: 'Conversões', icon: Target },
  { id: 'followups', label: 'Follow-ups', icon: Clock },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain }
];
```

---

## 🚀 Plano de Implementação

### Fase 1: Preparação (1-2h)
1. [ ] Criar novo componente `UnifiedDashboard`
2. [ ] Migrar hooks e componentes necessários
3. [ ] Estruturar sistema de abas base
4. [ ] Implementar layout responsivo

### Fase 2: Migração de Conteúdo (2-3h)
1. [ ] **Aba Visão Geral**: Migrar cards principais do Index.tsx
2. [ ] **Aba Performance**: Migrar gráficos do Metricas.tsx
3. [ ] **Aba WhatsApp**: Criar nova com métricas específicas
4. [ ] **Aba Conversões**: Integrar `LeadConversionAnalytics`
5. [ ] **Aba Follow-ups**: Criar métricas de follow-up
6. [ ] **Aba AI Insights**: Migrar `AIInsightsDashboard`

### Fase 3: Integração e Testes (1h)
1. [ ] Configurar roteamento `/` → UnifiedDashboard
2. [ ] Implementar redirecionamento `/metricas` → `/`
3. [ ] Atualizar sidebar para destacar "Dashboard"
4. [ ] Testes de responsividade e performance

### Fase 4: Cleanup (30min)
1. [ ] Remover arquivos antigos (Metricas.tsx, parte do Index.tsx)
2. [ ] Limpar hooks não utilizados
3. [ ] Atualizar documentação
4. [ ] Verificar imports/exports

---

## ✅ Critérios de Aceitação

### CA001 - Funcionalidade Core
- [ ] Todas as métricas atuais estão visíveis na nova interface
- [ ] Filtros de período funcionam em todas as abas
- [ ] Dados são carregados corretamente
- [ ] Transições entre abas são suaves

### CA002 - Performance
- [ ] Página carrega em menos de 2 segundos
- [ ] Não há memory leaks ao trocar abas
- [ ] Refresh automático funciona corretamente
- [ ] Cache está otimizado

### CA003 - Compatibilidade
- [ ] Rota `/metricas` redireciona para `/`
- [ ] Sidebar mostra "Dashboard" como ativo
- [ ] Links externos ainda funcionam
- [ ] Breadcrumbs estão corretos

### CA004 - UX/UI
- [ ] Interface é intuitiva e clara
- [ ] Design é consistente com o sistema
- [ ] Responsividade funciona em todos os dispositivos
- [ ] Estados de loading/erro são adequados

---

## 🎯 Métricas de Sucesso

### Métricas Técnicas
- **Performance**: Tempo de carregamento < 2s
- **Bounce Rate**: < 5% na nova página unificada
- **Error Rate**: < 1% de erros JavaScript

### Métricas de Usuário
- **Tempo na Página**: Aumento de 40% comparado às páginas separadas
- **Cliques em Abas**: Média de 3+ abas visitadas por sessão
- **Feedback**: Score de usabilidade > 4.5/5

---

## 🔍 Considerações Técnicas

### Otimizações
- **Code Splitting**: Carregar componentes de abas sob demanda
- **Memoization**: React.memo para componentes pesados
- **Virtualization**: Para listas grandes de dados
- **Debouncing**: Para filtros e pesquisas

### Monitoramento
- **Analytics**: Tracking de uso de abas
- **Performance**: Core Web Vitals
- **Errors**: Sentry para erros JavaScript
- **User Flow**: Hotjar para comportamento do usuário

---

## 📋 Checklist de Implementação

### Desenvolvimento
- [ ] Componente `UnifiedDashboard` criado
- [ ] Sistema de abas implementado
- [ ] Todas as métricas migradas
- [ ] Filtros e controles funcionando
- [ ] Responsividade testada

### Qualidade
- [ ] Testes unitários para componentes críticos
- [ ] Testes de integração para hooks
- [ ] Testes de acessibilidade (a11y)
- [ ] Code review completo

### Deploy
- [ ] Roteamento atualizado
- [ ] Redirecionamentos configurados
- [ ] Cache invalidado
- [ ] Monitoramento ativado

---

## 🎉 Resultados Esperados

### Imediatos
1. **UX Melhorada**: Interface mais limpa e organizada
2. **Performance**: Carregamento mais rápido
3. **Manutenibilidade**: Código mais simples
4. **Consistência**: Design system aplicado

### Médio Prazo
1. **Produtividade**: Usuários encontram informações mais rapidamente
2. **Adoção**: Maior uso das funcionalidades analíticas
3. **Feedback**: Melhores avaliações de usabilidade
4. **Escalabilidade**: Base sólida para novas features

---

*Este PRD serve como guia completo para a unificação das páginas Dashboard e Métricas, garantindo uma implementação estruturada e uma experiência de usuário superior.*