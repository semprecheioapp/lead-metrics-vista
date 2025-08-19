# chat_mbk - Extensão Chrome CRM para WhatsApp

## 📋 Sobre

A extensão **chat_mbk** é uma solução completa de CRM integrada ao WhatsApp Web, desenvolvida especificamente para automatizar e otimizar o gerenciamento de agendamentos e relacionamento com clientes.

## 🚀 Funcionalidades Principais

### ✅ Auto-Captura de Agendamentos
- Detecção automática de intenções de agendamento nas conversas
- NLP básico para identificar datas, horários e serviços
- Confirmação inteligente antes de criar agendamentos
- Sincronização em tempo real com o dashboard

### 📊 CRM Sidebar Integrada
- Painel lateral no WhatsApp Web com informações do lead
- Visualização de agendamentos do dia
- Ações rápidas (reagendar, confirmar presença)
- Histórico de interações e métricas

### 🔄 Sincronização Completa
- Integração nativa com Supabase
- Autenticação JWT unificada
- Updates em tempo real entre extensão e dashboard
- Cache local para performance

### 🤖 Automações Inteligentes
- Lembretes automáticos (1 dia antes, dia do agendamento)
- Follow-up pós-atendimento
- Reagendamento inteligente
- Notificações contextuais

## 🛠️ Tecnologias Utilizadas

- **Chrome Extension API** - Manifest V3
- **Supabase** - Backend e banco de dados
- **JavaScript ES6+** - Lógica da aplicação
- **CSS3** - Interface e animações
- **WebSocket** - Comunicação em tempo real

## 📁 Estrutura do Projeto

```
chrome-extension/
├── manifest.json          # Configuração da extensão
├── background.js          # Service Worker
├── content.js            # Script injetado no WhatsApp Web
├── popup.html            # Interface do popup
├── popup.css             # Estilos do popup
├── popup.js              # Lógica do popup
├── styles.css            # Estilos da sidebar e modals
├── icons/                # Ícones da extensão
└── README.md             # Documentação
```

## 🔧 Instalação

### 1. Preparar os Arquivos
1. Clone ou baixe todos os arquivos da extensão
2. Certifique-se de que todos os arquivos estão na pasta `chrome-extension/`

### 2. Configurar Ícones
Crie uma pasta `icons/` e adicione os ícones:
- `icon16.png` (16x16px)
- `icon32.png` (32x32px) 
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

### 3. Instalar no Chrome
1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `chrome-extension/`
5. A extensão aparecerá na lista e na barra de ferramentas

## ⚙️ Configuração

### 1. Autenticação
- Faça login no seu dashboard MBK
- A extensão detectará automaticamente sua sessão
- Token JWT será sincronizado automaticamente

### 2. Permissões
A extensão solicita as seguintes permissões:
- **WhatsApp Web** - Para injetar o CRM
- **Storage** - Para cache local
- **Tabs** - Para gerenciar abas
- **Supabase** - Para API calls

### 3. Configurações Personalizadas
Acesse o popup da extensão para:
- Ativar/desativar auto-detecção
- Configurar notificações
- Personalizar sidebar

## 🎯 Como Usar

### 1. Abertura Automática
- Clique no ícone da extensão para abrir WhatsApp Web
- A sidebar CRM será injetada automaticamente

### 2. Auto-Captura
- Digite mensagens com intenções de agendamento
- A extensão detectará automaticamente
- Confirme ou edite os dados antes de salvar

### 3. Gerenciamento
- Use a sidebar para ver agendamentos do dia
- Acesse ações rápidas para reagendar
- Monitore métricas em tempo real

## 🔗 Integração com Supabase

### Configuração da API
```javascript
const SUPABASE_URL = "https://mycjqmnvyphnarjoriux.supabase.co";
const SUPABASE_ANON_KEY = "sua_chave_aqui";
```

### Tabelas Utilizadas
- `agendamentos` - Dados dos agendamentos
- `profiles` - Perfis de usuários
- `empresas` - Informações das empresas

### Políticas RLS
A extensão respeita todas as políticas de Row Level Security configuradas no Supabase.

## 🚀 Recursos Avançados

### 1. Detecção de Intenções (NLP)
```javascript
// Padrões detectados automaticamente:
- "agendar para amanhã às 14h"
- "marcar para segunda-feira"
- "pode ser hoje às 15:30"
- "quero agendar um horário"
```

### 2. Cache Inteligente
- Armazenamento local para performance
- Sincronização automática em background
- Fallback para dados offline

### 3. Interface Responsiva
- Sidebar adaptável ao tamanho da tela
- Mobile-friendly para telas menores
- Animações suaves e modernas

## 🎨 Personalização

### Temas e Cores
Edite `styles.css` para personalizar:
```css
/* Gradient principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cores de status */
--success-color: #4CAF50;
--warning-color: #FFC107;
--error-color: #f44336;
```

### Padrões de Detecção
Modifique `AppointmentDetector` em `content.js`:
```javascript
this.patterns = [
  /seu_padrao_customizado/i,
  // Adicione novos padrões aqui
];
```

## 🔍 Debug e Logs

### Console do Background
```javascript
// Verificar logs do service worker
chrome.runtime.getBackgroundPage(console.log);
```

### Console do Content Script
```javascript
// Logs aparecem no DevTools da aba do WhatsApp
console.log('chat_mbk Debug:', dados);
```

## 📊 Métricas e Analytics

A extensão coleta automaticamente:
- Agendamentos detectados vs criados
- Taxa de sucesso da detecção
- Tempo de resposta da API
- Uso das funcionalidades

## 🛡️ Segurança

### Dados Sensíveis
- Tokens JWT armazenados localmente de forma segura
- Comunicação HTTPS com Supabase
- Validação de dados antes do envio

### Privacidade
- Não coleta dados pessoais desnecessários
- Respeita políticas do WhatsApp
- Dados processados localmente quando possível

## 🔄 Atualizações

### Versioning
- v1.0.0 - Lançamento inicial
- Atualizações automáticas via Chrome Web Store (futuro)
- Changelog detalhado para cada versão

## 🐛 Troubleshooting

### Problemas Comuns

1. **Extensão não aparece**
   - Verifique se o modo desenvolvedor está ativo
   - Recarregue a extensão em `chrome://extensions/`

2. **Não detecta agendamentos**
   - Verifique se a auto-detecção está ativa
   - Teste com padrões conhecidos

3. **Erro de autenticação**
   - Faça logout/login no dashboard
   - Limpe cache da extensão

### Logs de Debug
```javascript
// Ativar logs detalhados
localStorage.setItem('chatmbk_debug', 'true');
```

## 🤝 Contribuição

### Desenvolvimento Local
1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Teste extensivamente
5. Envie um Pull Request

### Reportar Bugs
- Use as issues do GitHub
- Inclua logs e screenshots
- Descreva passos para reproduzir

## 📞 Suporte

- **Email**: suporte@seusistema.com
- **Documentação**: https://docs.seusistema.com/chat-mbk
- **Status**: https://status.seusistema.com

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**chat_mbk** - Transformando WhatsApp em uma central de CRM profissional! 🚀