// chat_mbk Extension - Service Worker
const SUPABASE_URL = "https://mycjqmnvyphnarjoriux.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Y2pxbW52eXBobmFyam9yaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODk0MTYsImV4cCI6MjA3MDI2NTQxNn0.2J4W2hsBj9R--BsGjFBQ5iKJJf0HM0JpQ-DgagC_Xv4";

let sessionData = {
  logged: false,
  user: null,
  empresaId: null
};

// Função para verificar autenticação
async function checkAuthentication() {
  try {
    const token = await chrome.storage.local.get(['access_token']);
    
    if (!token.access_token) {
      console.log('Token não encontrado');
      return false;
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      const userData = await response.json();
      sessionData.logged = true;
      sessionData.user = userData;
      
      // Buscar empresa_id do perfil
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}&select=empresa_id`, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'apikey': SUPABASE_ANON_KEY
        }
      });
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles.length > 0) {
          sessionData.empresaId = profiles[0].empresa_id;
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return false;
  }
}

// Função para criar agendamento
async function createAgendamento(data) {
  try {
    const token = await chrome.storage.local.get(['access_token']);
    
    if (!token.access_token || !sessionData.empresaId) {
      throw new Error('Usuário não autenticado');
    }

    const agendamentoData = {
      empresa_id: sessionData.empresaId,
      name: data.name,
      number: data.number,
      email: data.email,
      data: data.data,
      hora: data.hora,
      serviço: data.servico,
      status: true,
      lembrete_enviado: false,
      lembrete_enviado_2: false,
      compareceu: false
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(agendamentoData)
    });

    if (!response.ok) {
      throw new Error('Erro ao criar agendamento');
    }

    const result = await response.json();
    console.log('Agendamento criado:', result);
    
    return result;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

// Função para buscar agendamentos
async function getAgendamentos() {
  try {
    const token = await chrome.storage.local.get(['access_token']);
    
    if (!token.access_token || !sessionData.empresaId) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos?empresa_id=eq.${sessionData.empresaId}&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar agendamentos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
}

// Event listeners
chrome.runtime.onInstalled.addListener(async () => {
  console.log('chat_mbk Extension instalada');
  
  // Verificar autenticação na instalação
  await checkAuthentication();
  
  // Configurar alarme para verificação mais frequente (a cada 2 minutos)
  chrome.alarms.create('authCheck', { periodInMinutes: 2 });
});

chrome.action.onClicked.addListener(async (tab) => {
  // Abrir WhatsApp Web se não estiver aberto
  const whatsappTabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  
  if (whatsappTabs.length > 0) {
    chrome.tabs.update(whatsappTabs[0].id, { active: true });
  } else {
    chrome.tabs.create({ url: 'https://web.whatsapp.com/' });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'authCheck') {
    const wasAuthenticated = sessionData.logged;
    await checkAuthentication();
    
    // Se mudou o status de autenticação, notificar todas as abas do WhatsApp
    if (wasAuthenticated !== sessionData.logged) {
      console.log('Status de autenticação mudou:', sessionData.logged);
      
      const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'session_updated',
          data: sessionData
        }).catch(() => {}); // Ignorar erros se tab não está pronta
      }
    }
  }
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Mensagem recebida no background:', message);
  
  switch (message.action) {
    case 'get_session':
      sendResponse(sessionData);
      break;
      
    case 'check_auth':
      checkAuthentication().then(result => {
        sendResponse({ authenticated: result, session: sessionData });
      });
      return true; // Mantém a conexão aberta para resposta assíncrona
      
    case 'create_agendamento':
      createAgendamento(message.data).then(result => {
        sendResponse({ success: true, data: result });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    case 'get_agendamentos':
      getAgendamentos().then(result => {
        sendResponse({ success: true, data: result });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    case 'store_token':
      chrome.storage.local.set({ access_token: message.token }).then(() => {
        checkAuthentication().then(() => {
          sendResponse({ success: true, session: sessionData });
        });
      });
      return true;
  }
  
  return false;
});