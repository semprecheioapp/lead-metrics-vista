// chat_mbk Extension - Content Script para WhatsApp Web
console.log('chat_mbk Content Script carregado');

class WhatsAppCRMIntegration {
  constructor() {
    this.sessionData = null;
    this.sidebarInjected = false;
    this.appointmentDetector = new AppointmentDetector();
    this.init();
  }

  async init() {
    console.log('Inicializando integração WhatsApp CRM');
    
    // Aguardar carregamento do WhatsApp Web
    this.waitForWhatsApp().then(() => {
      this.setupMessageListener();
      this.injectCRMSidebar();
      this.startAppointmentDetection();
    });

    // Verificar sessão periodicamente 
    this.checkSession();
    setInterval(() => this.checkSession(), 5000); // Verificar a cada 5 segundos
  }

  waitForWhatsApp() {
    return new Promise((resolve) => {
      const checkWhatsApp = () => {
        const chatList = document.querySelector('[data-testid="chat-list"]');
        const mainPanel = document.querySelector('#main');
        
        if (chatList && mainPanel) {
          console.log('WhatsApp Web carregado');
          resolve();
        } else {
          setTimeout(checkWhatsApp, 1000);
        }
      };
      checkWhatsApp();
    });
  }

  async checkSession() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'check_auth' });
      const wasAuthenticated = this.sessionData?.logged;
      this.sessionData = response.session;
      
      console.log('Status de autenticação:', response.authenticated);
      
      if (!response.authenticated) {
        if (!document.getElementById('chatmbk-auth-modal')) {
          this.showAuthPrompt();
        }
      } else {
        // Remover modal de auth se estiver aberto
        const authModal = document.getElementById('chatmbk-auth-modal');
        if (authModal) {
          authModal.remove();
        }
        
        // Se acabou de fazer login, recriar a sidebar
        if (!wasAuthenticated && response.authenticated) {
          this.sidebarInjected = false;
          this.injectCRMSidebar();
        }
        
        this.updateUI();
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Mensagem recebida no content script:', message);
      
      switch (message.action) {
        case 'session_updated':
          this.sessionData = message.data;
          this.updateUI();
          break;
          
        case 'create_appointment_form':
          this.showAppointmentForm(message.data);
          break;
      }
    });
  }

  injectCRMSidebar() {
    if (this.sidebarInjected) return;

    const rightPanel = document.querySelector('#app > div > div');
    if (!rightPanel) return;

    // Criar sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'chatmbk-sidebar';
    sidebar.className = 'chatmbk-sidebar';
    sidebar.innerHTML = this.getSidebarHTML();

    // Inserir na interface
    rightPanel.appendChild(sidebar);
    this.sidebarInjected = true;

    // Configurar eventos
    this.setupSidebarEvents();
    console.log('Sidebar CRM injetada');
  }

  getSidebarHTML() {
    if (!this.sessionData?.logged) {
      return `
        <div class="chatmbk-sidebar-content">
          <div class="chatmbk-header">
            <div class="chatmbk-logo">
              <span class="chatmbk-icon">📱</span>
              <span class="chatmbk-title">Chat MBK CRM</span>
            </div>
            <div class="chatmbk-status offline">
              <span class="chatmbk-status-dot"></span>
              <span>Desconectado</span>
            </div>
          </div>
          
          <div class="chatmbk-auth-section">
            <div class="chatmbk-auth-content">
              <div class="chatmbk-auth-icon">🔐</div>
              <p>Faça login para acessar todas as funcionalidades do CRM</p>
              <button id="chatmbk-login-btn" class="chatmbk-btn chatmbk-btn-primary">
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="chatmbk-sidebar-content">
        <div class="chatmbk-header">
          <div class="chatmbk-logo">
            <span class="chatmbk-icon">📱</span>
            <span class="chatmbk-title">Chat MBK CRM</span>
          </div>
          <div class="chatmbk-status online">
            <span class="chatmbk-status-dot"></span>
            <span>Conectado</span>
          </div>
          <div class="chatmbk-user-info">
            <small>${this.sessionData.empresa?.name_empresa || 'Empresa'}</small>
          </div>
        </div>
        
        <!-- Menu Principal -->
        <div class="chatmbk-section">
          <h3 class="chatmbk-section-title">📋 Menu Principal</h3>
          <div class="chatmbk-menu-grid">
            <button class="chatmbk-menu-item" id="chatmbk-leads">
              <span class="chatmbk-menu-icon">👥</span>
              <span>Leads</span>
            </button>
            <button class="chatmbk-menu-item" id="chatmbk-agendamentos">
              <span class="chatmbk-menu-icon">📅</span>
              <span>Agendamentos</span>
            </button>
            <button class="chatmbk-menu-item" id="chatmbk-conversas">
              <span class="chatmbk-menu-icon">💬</span>
              <span>Conversas</span>
            </button>
            <button class="chatmbk-menu-item" id="chatmbk-metricas">
              <span class="chatmbk-menu-icon">📊</span>
              <span>Métricas</span>
            </button>
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="chatmbk-section">
          <h3 class="chatmbk-section-title">⚡ Ações Rápidas</h3>
          <div class="chatmbk-quick-actions">
            <button class="chatmbk-btn chatmbk-btn-primary" id="chatmbk-new-appointment">
              📅 Novo Agendamento
            </button>
            <button class="chatmbk-btn chatmbk-btn-secondary" id="chatmbk-quick-message">
              💬 Mensagem Rápida
            </button>
            <button class="chatmbk-btn chatmbk-btn-secondary" id="chatmbk-add-lead">
              👤 Adicionar Lead
            </button>
          </div>
        </div>

        <!-- Contato Atual -->
        <div class="chatmbk-section">
          <h3 class="chatmbk-section-title">👤 Contato Atual</h3>
          <div id="chatmbk-current-contact">
            <div class="chatmbk-contact-card">
              <div class="chatmbk-contact-avatar">
                <span class="chatmbk-avatar-placeholder">?</span>
              </div>
              <div class="chatmbk-contact-details">
                <div class="chatmbk-contact-name">Selecione um chat</div>
                <div class="chatmbk-contact-number">-</div>
                <div class="chatmbk-contact-status">-</div>
              </div>
            </div>
            <div class="chatmbk-contact-actions" style="display: none;">
              <button class="chatmbk-btn-small" id="chatmbk-view-lead">Ver Lead</button>
              <button class="chatmbk-btn-small" id="chatmbk-schedule-contact">Agendar</button>
            </div>
          </div>
        </div>

        <!-- Agendamentos Hoje -->
        <div class="chatmbk-section">
          <h3 class="chatmbk-section-title">📅 Hoje</h3>
          <div id="chatmbk-appointments">
            <div class="chatmbk-loading">Carregando...</div>
          </div>
        </div>

        <!-- Ferramentas -->
        <div class="chatmbk-section">
          <h3 class="chatmbk-section-title">🛠️ Ferramentas</h3>
          <div class="chatmbk-tools">
            <button class="chatmbk-tool-btn" id="chatmbk-templates">
              <span class="chatmbk-tool-icon">📝</span>
              <span>Templates</span>
            </button>
            <button class="chatmbk-tool-btn" id="chatmbk-automacao">
              <span class="chatmbk-tool-icon">🤖</span>
              <span>Automação</span>
            </button>
            <button class="chatmbk-tool-btn" id="chatmbk-etiquetas">
              <span class="chatmbk-tool-icon">🏷️</span>
              <span>Etiquetas</span>
            </button>
            <button class="chatmbk-tool-btn" id="chatmbk-dashboard">
              <span class="chatmbk-tool-icon">🏠</span>
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupSidebarEvents() {
    // Login button
    document.getElementById('chatmbk-login-btn')?.addEventListener('click', () => {
      this.openDashboard();
    });

    // Menu Principal
    document.getElementById('chatmbk-leads')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app/leads', '_blank');
    });
    
    document.getElementById('chatmbk-agendamentos')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app/agendamentos', '_blank');
    });
    
    document.getElementById('chatmbk-conversas')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app/conversas', '_blank');
    });
    
    document.getElementById('chatmbk-metricas')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app/metricas', '_blank');
    });

    // Ações Rápidas
    document.getElementById('chatmbk-new-appointment')?.addEventListener('click', () => {
      this.showAppointmentForm();
    });
    
    document.getElementById('chatmbk-quick-message')?.addEventListener('click', () => {
      this.showQuickMessageForm();
    });
    
    document.getElementById('chatmbk-add-lead')?.addEventListener('click', () => {
      this.showAddLeadForm();
    });

    // Ferramentas
    document.getElementById('chatmbk-templates')?.addEventListener('click', () => {
      this.showTemplatesModal();
    });
    
    document.getElementById('chatmbk-automacao')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app/configuracoes', '_blank');
    });
    
    document.getElementById('chatmbk-etiquetas')?.addEventListener('click', () => {
      this.showTagsModal();
    });
    
    document.getElementById('chatmbk-dashboard')?.addEventListener('click', () => {
      window.open('https://dashboardmbk.vercel.app', '_blank');
    });

    // Carregar agendamentos se logado
    if (this.sessionData?.logged) {
      this.loadTodayAppointments();
    }

    // Monitor de mudança de chat
    this.monitorChatChanges();
  }

  async loadTodayAppointments() {
    if (!this.sessionData?.logged) return;

    try {
      const response = await chrome.runtime.sendMessage({ action: 'get_agendamentos' });
      
      if (response.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = response.data.filter(apt => apt.data === today);
        this.updateAppointmentsList(todayAppointments);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  }

  updateAppointmentsList(appointments) {
    const container = document.getElementById('chatmbk-appointments');
    if (!container) return;

    if (appointments.length === 0) {
      container.innerHTML = '<div class="chatmbk-no-appointments">Nenhum agendamento hoje</div>';
      return;
    }

    container.innerHTML = appointments.map(apt => `
      <div class="chatmbk-appointment-item">
        <div class="chatmbk-appointment-time">${apt.hora}</div>
        <div class="chatmbk-appointment-name">${apt.name}</div>
        <div class="chatmbk-appointment-service">${apt.serviço || 'Serviço'}</div>
        <div class="chatmbk-appointment-status ${apt.compareceu ? 'completed' : 'pending'}">
          ${apt.compareceu ? '✅' : '⏰'}
        </div>
      </div>
    `).join('');
  }

  monitorChatChanges() {
    const observer = new MutationObserver(() => {
      const currentChat = this.getCurrentChatInfo();
      this.updateCurrentContact(currentChat);
    });

    const chatContainer = document.querySelector('#main');
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  }

  getCurrentChatInfo() {
    try {
      // Extrair nome do contato
      const nameElement = document.querySelector('[data-testid="conversation-header"] span[title]');
      const name = nameElement?.getAttribute('title') || nameElement?.textContent;

      // Extrair número (se disponível)
      const numberElement = document.querySelector('[data-testid="conversation-header"] [title*="+"]');
      const number = numberElement?.getAttribute('title') || numberElement?.textContent;

      return { name, number };
    } catch (error) {
      console.error('Erro ao extrair info do chat:', error);
      return null;
    }
  }

  updateCurrentContact(contact) {
    const container = document.getElementById('chatmbk-current-contact');
    if (!container) return;

    if (!contact?.name) {
      container.innerHTML = `
        <div class="chatmbk-contact-card">
          <div class="chatmbk-contact-avatar">
            <span class="chatmbk-avatar-placeholder">?</span>
          </div>
          <div class="chatmbk-contact-details">
            <div class="chatmbk-contact-name">Selecione um chat</div>
            <div class="chatmbk-contact-number">-</div>
            <div class="chatmbk-contact-status">-</div>
          </div>
        </div>
      `;
      return;
    }

    const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    container.innerHTML = `
      <div class="chatmbk-contact-card">
        <div class="chatmbk-contact-avatar">
          <span class="chatmbk-avatar-placeholder">${initials}</span>
        </div>
        <div class="chatmbk-contact-details">
          <div class="chatmbk-contact-name">${contact.name}</div>
          <div class="chatmbk-contact-number">${contact.number || 'Número não disponível'}</div>
          <div class="chatmbk-contact-status">🟢 Online</div>
        </div>
      </div>
      <div class="chatmbk-contact-actions">
        <button class="chatmbk-btn-small" id="chatmbk-view-lead">Ver Lead</button>
        <button class="chatmbk-btn-small" id="chatmbk-schedule-contact">Agendar</button>
      </div>
    `;
    
    // Adicionar event listeners para as ações
    document.getElementById('chatmbk-view-lead')?.addEventListener('click', () => {
      window.open(`https://dashboardmbk.vercel.app/leads?search=${encodeURIComponent(contact.name)}`, '_blank');
    });
    
    document.getElementById('chatmbk-schedule-contact')?.addEventListener('click', () => {
      this.showAppointmentForm(contact.name, contact.number || '');
    });
    
    // Mostrar as ações
    const actions = container.querySelector('.chatmbk-contact-actions');
    if (actions) {
      actions.style.display = 'flex';
    }
  }

  startAppointmentDetection() {
    // Monitor para novas mensagens
    const messagesContainer = document.querySelector('#main [data-testid="conversation-panel-messages"]');
    
    if (messagesContainer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkForAppointmentIntent(node);
            }
          });
        });
      });

      observer.observe(messagesContainer, { childList: true, subtree: true });
    }
  }

  checkForAppointmentIntent(messageNode) {
    const messageText = messageNode.textContent?.toLowerCase();
    if (!messageText) return;

    const appointmentIntent = this.appointmentDetector.detectIntent(messageText);
    
    if (appointmentIntent.detected) {
      console.log('Intenção de agendamento detectada:', appointmentIntent);
      this.showAppointmentSuggestion(appointmentIntent);
    }
  }

  showAppointmentSuggestion(intent) {
    // Criar notificação flutuante
    const notification = document.createElement('div');
    notification.className = 'chatmbk-appointment-suggestion';
    notification.innerHTML = `
      <div class="chatmbk-suggestion-content">
        <div class="chatmbk-suggestion-title">🤖 Agendamento Detectado</div>
        <div class="chatmbk-suggestion-text">
          Detectei uma possível solicitação de agendamento.
        </div>
        <div class="chatmbk-suggestion-actions">
          <button class="chatmbk-btn chatmbk-btn-primary" onclick="chatMBK.createAppointmentFromSuggestion('${JSON.stringify(intent).replace(/'/g, "\\'")}')">
            Criar Agendamento
          </button>
          <button class="chatmbk-btn chatmbk-btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Ignorar
          </button>
        </div>
      </div>
    `;

    // Inserir na tela
    document.body.appendChild(notification);

    // Auto-remover após 10 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  showAppointmentForm(contactName = '', contactNumber = '', suggestedData = null) {
    const modal = document.createElement('div');
    modal.className = 'chatmbk-modal';
    modal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Novo Agendamento</h2>
          <button class="chatmbk-modal-close" onclick="this.closest('.chatmbk-modal').remove()">×</button>
        </div>
        <form id="chatmbk-appointment-form" class="chatmbk-form">
          <div class="chatmbk-form-group">
            <label>Nome do Cliente</label>
            <input type="text" name="name" value="${contactName}" required>
          </div>
          <div class="chatmbk-form-group">
            <label>Telefone</label>
            <input type="tel" name="number" value="${contactNumber}">
          </div>
          <div class="chatmbk-form-group">
            <label>Email</label>
            <input type="email" name="email">
          </div>
          <div class="chatmbk-form-group">
            <label>Data</label>
            <input type="date" name="data" value="${suggestedData?.date || ''}" required>
          </div>
          <div class="chatmbk-form-group">
            <label>Hora</label>
            <input type="time" name="hora" value="${suggestedData?.time || ''}" required>
          </div>
          <div class="chatmbk-form-group">
            <label>Serviço</label>
            <input type="text" name="servico" placeholder="Ex: Corte de cabelo">
          </div>
          <div class="chatmbk-form-actions">
            <button type="submit" class="chatmbk-btn chatmbk-btn-primary">Criar Agendamento</button>
            <button type="button" class="chatmbk-btn chatmbk-btn-secondary" onclick="this.closest('.chatmbk-modal').remove()">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Configurar envio do formulário
    document.getElementById('chatmbk-appointment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAppointmentSubmit(e.target);
    });
  }

  async handleAppointmentSubmit(form) {
    const formData = new FormData(form);
    const appointmentData = Object.fromEntries(formData.entries());

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'create_agendamento',
        data: appointmentData
      });

      if (response.success) {
        this.showSuccessMessage('Agendamento criado com sucesso!');
        form.closest('.chatmbk-modal').remove();
        this.loadTodayAppointments(); // Recarregar lista
      } else {
        this.showErrorMessage(response.error || 'Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      this.showErrorMessage('Erro interno. Tente novamente.');
    }
  }

  createAppointmentFromSuggestion(intentData) {
    const intent = JSON.parse(intentData);
    const contact = this.getCurrentChatInfo();
    
    this.showAppointmentForm(
      contact?.name || '',
      contact?.number || '',
      {
        date: intent.suggestedDate,
        time: intent.suggestedTime
      }
    );
    
    // Remover sugestão
    document.querySelector('.chatmbk-appointment-suggestion')?.remove();
  }

  showAuthPrompt() {
    const authModal = document.createElement('div');
    authModal.id = 'chatmbk-auth-modal';
    authModal.className = 'chatmbk-modal-overlay';
    authModal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Autenticação chat_mbk</h2>
        </div>
        <div class="chatmbk-auth-content">
          <p>Para usar o CRM integrado, faça login em sua conta:</p>
          <button id="chatmbk-login-btn" class="chatmbk-btn chatmbk-btn-primary">
            Fazer Login
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(authModal);
    
    // Adicionar event listener após inserir no DOM
    document.getElementById('chatmbk-login-btn').addEventListener('click', () => {
      console.log('Login clicado no WhatsApp Web');
      this.openDashboard();
    });
  }

  openDashboard() {
    console.log('Abrindo dashboard do WhatsApp Web');
    window.open('https://dashboardmbk.vercel.app/auth', '_blank');
  }

  updateUI() {
    const statusElement = document.getElementById('chatmbk-status');
    if (statusElement) {
      statusElement.textContent = this.sessionData?.logged ? '🟢 Conectado' : '🔴 Desconectado';
    }

    if (this.sessionData?.logged) {
      this.loadTodayAppointments();
    }
  }

  showSuccessMessage(message) {
    this.showToast(message, 'success');
  }

  showErrorMessage(message) {
    this.showToast(message, 'error');
  }

  showQuickMessageForm() {
    const modal = document.createElement('div');
    modal.className = 'chatmbk-modal';
    modal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Mensagem Rápida</h2>
          <button class="chatmbk-modal-close" onclick="this.closest('.chatmbk-modal').remove()">×</button>
        </div>
        <div class="chatmbk-quick-messages">
          <button class="chatmbk-quick-msg-btn" onclick="chatMBK.insertMessage('Olá! Como posso ajudá-lo hoje?')">Saudação</button>
          <button class="chatmbk-quick-msg-btn" onclick="chatMBK.insertMessage('Muito obrigado pelo contato!')">Agradecimento</button>
          <button class="chatmbk-quick-msg-btn" onclick="chatMBK.insertMessage('Posso agendar um horário para você. Que dia seria melhor?')">Agendamento</button>
          <button class="chatmbk-quick-msg-btn" onclick="chatMBK.insertMessage('Nosso horário de funcionamento é de segunda a sexta, das 8h às 18h.')">Horário</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showAddLeadForm() {
    const contact = this.getCurrentChatInfo();
    const modal = document.createElement('div');
    modal.className = 'chatmbk-modal';
    modal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Adicionar Lead</h2>
          <button class="chatmbk-modal-close" onclick="this.closest('.chatmbk-modal').remove()">×</button>
        </div>
        <form id="chatmbk-lead-form" class="chatmbk-form">
          <div class="chatmbk-form-group">
            <label>Nome</label>
            <input type="text" name="nome" value="${contact?.name || ''}" required>
          </div>
          <div class="chatmbk-form-group">
            <label>Telefone</label>
            <input type="tel" name="telefone" value="${contact?.number || ''}" required>
          </div>
          <div class="chatmbk-form-group">
            <label>Email</label>
            <input type="email" name="email">
          </div>
          <div class="chatmbk-form-group">
            <label>Status</label>
            <select name="status">
              <option value="novo">Novo</option>
              <option value="contato">Em contato</option>
              <option value="interessado">Interessado</option>
              <option value="convertido">Convertido</option>
            </select>
          </div>
          <div class="chatmbk-form-actions">
            <button type="submit" class="chatmbk-btn chatmbk-btn-primary">Adicionar Lead</button>
            <button type="button" class="chatmbk-btn chatmbk-btn-secondary" onclick="this.closest('.chatmbk-modal').remove()">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showTemplatesModal() {
    const modal = document.createElement('div');
    modal.className = 'chatmbk-modal';
    modal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Templates de Mensagem</h2>
          <button class="chatmbk-modal-close" onclick="this.closest('.chatmbk-modal').remove()">×</button>
        </div>
        <div class="chatmbk-templates-grid">
          <div class="chatmbk-template-item" onclick="chatMBK.insertMessage('Bom dia! Espero que esteja tudo bem. Gostaria de agendar um horário?')">
            <h4>Agendamento Manhã</h4>
            <p>Bom dia! Espero que esteja tudo bem...</p>
          </div>
          <div class="chatmbk-template-item" onclick="chatMBK.insertMessage('Boa tarde! Como foi seu dia? Podemos marcar um horário?')">
            <h4>Agendamento Tarde</h4>
            <p>Boa tarde! Como foi seu dia?...</p>
          </div>
          <div class="chatmbk-template-item" onclick="chatMBK.insertMessage('Obrigado pelo interesse! Vou enviar mais informações em breve.')">
            <h4>Follow-up</h4>
            <p>Obrigado pelo interesse! Vou enviar...</p>
          </div>
          <div class="chatmbk-template-item" onclick="chatMBK.insertMessage('Oi! Vi que você estava interessado em nossos serviços. Posso tirar alguma dúvida?')">
            <h4>Retomada de Contato</h4>
            <p>Oi! Vi que você estava interessado...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showTagsModal() {
    const modal = document.createElement('div');
    modal.className = 'chatmbk-modal';
    modal.innerHTML = `
      <div class="chatmbk-modal-content">
        <div class="chatmbk-modal-header">
          <h2>Etiquetas do Contato</h2>
          <button class="chatmbk-modal-close" onclick="this.closest('.chatmbk-modal').remove()">×</button>
        </div>
        <div class="chatmbk-tags-container">
          <div class="chatmbk-tag-item">
            <input type="checkbox" id="tag-interessado">
            <label for="tag-interessado">🔥 Interessado</label>
          </div>
          <div class="chatmbk-tag-item">
            <input type="checkbox" id="tag-cliente">
            <label for="tag-cliente">⭐ Cliente</label>
          </div>
          <div class="chatmbk-tag-item">
            <input type="checkbox" id="tag-urgente">
            <label for="tag-urgente">🚨 Urgente</label>
          </div>
          <div class="chatmbk-tag-item">
            <input type="checkbox" id="tag-followup">
            <label for="tag-followup">📞 Follow-up</label>
          </div>
        </div>
        <div class="chatmbk-form-actions">
          <button class="chatmbk-btn chatmbk-btn-primary" onclick="this.closest('.chatmbk-modal').remove()">Salvar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  insertMessage(message) {
    // Encontrar o campo de entrada de mensagem do WhatsApp
    const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (messageInput) {
      messageInput.textContent = message;
      messageInput.focus();
      
      // Simular evento de input para ativar o botão de enviar
      const event = new Event('input', { bubbles: true });
      messageInput.dispatchEvent(event);
    }
    
    // Fechar modal
    document.querySelector('.chatmbk-modal')?.remove();
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `chatmbk-toast chatmbk-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('chatmbk-toast-show');
    }, 100);

    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Detector de intenções de agendamento
class AppointmentDetector {
  constructor() {
    this.patterns = [
      /agendar\s+para\s+(amanh[ãa]|hoje|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)/i,
      /marcar\s+para\s+as?\s*(\d{1,2}):?(\d{2})?/i,
      /pode\s+ser\s+(amanh[ãa]|hoje)\s+[àa]s?\s*(\d{1,2})/i,
      /quer[oa]?\s+agendar/i,
      /vamos\s+marcar/i,
      /horário\s+disponível/i
    ];

    this.timePatterns = [
      /(\d{1,2}):(\d{2})/g,
      /(\d{1,2})\s*h(?:oras?)?/g,
      /meio[- ]dia/g,
      /manh[ãa]/g,
      /tarde/g,
      /noite/g
    ];

    this.datePatterns = [
      /amanh[ãa]/i,
      /hoje/i,
      /segunda/i,
      /ter[çc]a/i,
      /quarta/i,
      /quinta/i,
      /sexta/i,
      /s[áa]bado/i,
      /domingo/i
    ];
  }

  detectIntent(text) {
    const result = {
      detected: false,
      confidence: 0,
      suggestedDate: null,
      suggestedTime: null,
      rawText: text
    };

    // Verificar padrões de agendamento
    for (const pattern of this.patterns) {
      if (pattern.test(text)) {
        result.detected = true;
        result.confidence += 0.3;
        break;
      }
    }

    // Detectar horários
    const timeMatch = this.extractTime(text);
    if (timeMatch) {
      result.suggestedTime = timeMatch;
      result.confidence += 0.2;
    }

    // Detectar datas
    const dateMatch = this.extractDate(text);
    if (dateMatch) {
      result.suggestedDate = dateMatch;
      result.confidence += 0.2;
    }

    // Palavras-chave adicionais
    const keywords = ['agendar', 'marcar', 'horário', 'consulta', 'atendimento', 'visita'];
    const keywordCount = keywords.filter(keyword => text.toLowerCase().includes(keyword)).length;
    result.confidence += keywordCount * 0.1;

    return result;
  }

  extractTime(text) {
    const timeRegex = /(\d{1,2}):?(\d{2})?\s*h?/g;
    const match = timeRegex.exec(text);
    
    if (match) {
      const hours = match[1];
      const minutes = match[2] || '00';
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    return null;
  }

  extractDate(text) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (/amanh[ãa]/i.test(text)) {
      return tomorrow.toISOString().split('T')[0];
    }

    if (/hoje/i.test(text)) {
      return today.toISOString().split('T')[0];
    }

    // Dias da semana (implementar lógica mais complexa se necessário)
    const weekDays = {
      'segunda': 1, 'terça': 2, 'terca': 2, 'quarta': 3,
      'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
    };

    for (const [day, dayIndex] of Object.entries(weekDays)) {
      if (text.toLowerCase().includes(day)) {
        const nextWeekDay = this.getNextWeekDay(dayIndex);
        return nextWeekDay.toISOString().split('T')[0];
      }
    }

    return null;
  }

  getNextWeekDay(targetDay) {
    const today = new Date();
    const currentDay = today.getDay();
    let daysToAdd = targetDay - currentDay;

    if (daysToAdd <= 0) {
      daysToAdd += 7; // Próxima semana
    }

    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + daysToAdd);
    return nextDay;
  }
}

// Instância global
window.chatMBK = new WhatsAppCRMIntegration();