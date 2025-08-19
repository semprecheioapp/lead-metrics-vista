// chat_mbk Popup Script
class ChatMBKPopup {
  constructor() {
    this.sessionData = null;
    this.init();
  }

  async init() {
    console.log('Inicializando popup chat_mbk');
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Verificar status da sessão
    await this.checkSession();
    
    // Carregar agendamentos do dia
    await this.loadTodayAppointments();
    
    // Carregar configurações
    this.loadSettings();
  }

  setupEventListeners() {
    // Ações rápidas
    document.getElementById('open-whatsapp').addEventListener('click', () => {
      this.openWhatsApp();
    });

    document.getElementById('open-dashboard').addEventListener('click', () => {
      this.openDashboard();
    });

    document.getElementById('new-appointment').addEventListener('click', () => {
      this.openNewAppointment();
    });

    document.getElementById('sync-data').addEventListener('click', () => {
      this.syncData();
    });

    // Configurações
    document.getElementById('auto-detect').addEventListener('change', (e) => {
      this.updateSetting('autoDetect', e.target.checked);
    });

    document.getElementById('notifications').addEventListener('change', (e) => {
      this.updateSetting('notifications', e.target.checked);
    });

    document.getElementById('sidebar-auto').addEventListener('change', (e) => {
      this.updateSetting('sidebarAuto', e.target.checked);
    });

    // Links do footer
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    document.getElementById('feedback-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedback();
    });
  }

  async checkSession() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'check_auth' });
      this.sessionData = response.session;
      this.updateConnectionStatus(response.authenticated);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      this.updateConnectionStatus(false);
    }
  }

  updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('status');
    const connectionInfo = document.getElementById('connection-info');
    const indicator = statusElement.querySelector('.status-indicator');
    const statusText = statusElement.querySelector('.status-text');

    if (isConnected && this.sessionData?.logged) {
      // Conectado
      indicator.className = 'status-indicator connected';
      statusText.textContent = 'Conectado';
      
      connectionInfo.className = 'connection-info connected';
      connectionInfo.innerHTML = `
        <div class="connection-details">
          <div class="connection-user">${this.sessionData.user?.email || 'Usuário'}</div>
          <div class="connection-company">Empresa ID: ${this.sessionData.empresaId || 'N/A'}</div>
        </div>
      `;
    } else {
      // Desconectado
      indicator.className = 'status-indicator disconnected';
      statusText.textContent = 'Desconectado';
      
      connectionInfo.className = 'connection-info disconnected';
      connectionInfo.innerHTML = `
        <div class="info-loading">
          Não autenticado. Clique em "Dashboard" para fazer login.
        </div>
      `;
    }
  }

  async loadTodayAppointments() {
    const container = document.getElementById('today-appointments');
    
    if (!this.sessionData?.logged) {
      container.innerHTML = '<div class="no-appointments">Faça login para ver agendamentos</div>';
      return;
    }

    try {
      // Mostrar loading
      container.innerHTML = '<div class="info-loading">Carregando agendamentos...</div>';

      const response = await chrome.runtime.sendMessage({ action: 'get_agendamentos' });
      
      if (response.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = response.data.filter(apt => apt.data === today);
        this.renderAppointments(todayAppointments);
      } else {
        container.innerHTML = '<div class="no-appointments">Erro ao carregar agendamentos</div>';
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      container.innerHTML = '<div class="no-appointments">Erro ao carregar agendamentos</div>';
    }
  }

  renderAppointments(appointments) {
    const container = document.getElementById('today-appointments');
    
    if (appointments.length === 0) {
      container.innerHTML = '<div class="no-appointments">Nenhum agendamento hoje</div>';
      return;
    }

    container.innerHTML = appointments.map(apt => `
      <div class="appointment-item">
        <div class="appointment-info">
          <div class="appointment-time">${apt.hora}</div>
          <div class="appointment-name">${apt.name}</div>
          <div class="appointment-service">${apt.serviço || 'Serviço'}</div>
        </div>
        <div class="appointment-status">
          ${apt.compareceu ? '✅' : '⏰'}
        </div>
      </div>
    `).join('');
  }

  async openWhatsApp() {
    try {
      // Verificar se já existe uma aba do WhatsApp Web
      const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
      
      if (tabs.length > 0) {
        // Ativar aba existente
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        // Criar nova aba
        await chrome.tabs.create({ url: 'https://web.whatsapp.com/' });
      }
      
      // Fechar popup
      window.close();
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
    }
  }

  openDashboard() {
    console.log('openDashboard chamado');
    try {
      // Abrir dashboard da Vercel
      chrome.tabs.create({ 
        url: 'https://dashboardmbk.vercel.app/auth'
      });
      console.log('Tentando abrir dashboard...');
      window.close();
    } catch (error) {
      console.error('Erro ao abrir dashboard:', error);
    }
  }

  openNewAppointment() {
    // Abrir formulário de novo agendamento no dashboard
    chrome.tabs.create({ 
      url: 'https://dashboardmbk.vercel.app/agendamentos'
    });
    window.close();
  }

  async syncData() {
    const button = document.getElementById('sync-data');
    const originalText = button.querySelector('.btn-text').textContent;
    
    // Mostrar loading
    button.querySelector('.btn-icon').textContent = '⏳';
    button.querySelector('.btn-text').textContent = 'Sincronizando...';
    button.disabled = true;

    try {
      // Recarregar sessão
      await this.checkSession();
      
      // Recarregar agendamentos
      await this.loadTodayAppointments();
      
      // Mostrar sucesso temporariamente
      button.querySelector('.btn-icon').textContent = '✅';
      button.querySelector('.btn-text').textContent = 'Sincronizado!';
      
      setTimeout(() => {
        button.querySelector('.btn-icon').textContent = '🔄';
        button.querySelector('.btn-text').textContent = originalText;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      
      // Mostrar erro
      button.querySelector('.btn-icon').textContent = '❌';
      button.querySelector('.btn-text').textContent = 'Erro';
      
      setTimeout(() => {
        button.querySelector('.btn-icon').textContent = '🔄';
        button.querySelector('.btn-text').textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }

  loadSettings() {
    chrome.storage.local.get(['chatmbk_settings'], (result) => {
      const settings = result.chatmbk_settings || {
        autoDetect: true,
        notifications: true,
        sidebarAuto: true
      };

      document.getElementById('auto-detect').checked = settings.autoDetect;
      document.getElementById('notifications').checked = settings.notifications;
      document.getElementById('sidebar-auto').checked = settings.sidebarAuto;
    });
  }

  updateSetting(key, value) {
    chrome.storage.local.get(['chatmbk_settings'], (result) => {
      const settings = result.chatmbk_settings || {};
      settings[key] = value;
      
      chrome.storage.local.set({ chatmbk_settings: settings }, () => {
        console.log(`Configuração ${key} atualizada para ${value}`);
        
        // Notificar content script sobre mudança
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'settings_updated',
              settings: settings
            }).catch(() => {}); // Ignorar erros se tab não está pronta
          });
        });
      });
    });
  }

  openHelp() {
    chrome.tabs.create({ 
      url: 'https://dashboardmbk.vercel.app/help'
    });
    window.close();
  }

  openFeedback() {
    chrome.tabs.create({ 
      url: 'https://dashboardmbk.vercel.app/feedback'
    });
    window.close();
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new ChatMBKPopup();
});