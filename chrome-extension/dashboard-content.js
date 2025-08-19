// Content script para detectar login no dashboard
console.log('Dashboard content script carregado');

let lastAuthCheck = null;

// Função para verificar se está logado
function checkAuthStatus() {
  try {
    // Verificar se tem dados no localStorage do Supabase
    const supabaseSession = localStorage.getItem('sb-mycjqmnvyphnarjoriux-auth-token');
    
    if (supabaseSession) {
      const session = JSON.parse(supabaseSession);
      
      if (session.access_token && session.access_token !== lastAuthCheck) {
        console.log('Token detectado no dashboard:', session.access_token);
        lastAuthCheck = session.access_token;
        
        // Enviar token para a extensão
        chrome.runtime.sendMessage({
          action: 'store_token',
          token: session.access_token
        }).then(response => {
          console.log('Token enviado para extensão:', response);
        }).catch(error => {
          console.error('Erro ao enviar token:', error);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar auth status:', error);
  }
}

// Verificar auth status periodicamente
setInterval(checkAuthStatus, 2000);

// Verificar também quando a página carrega
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Verificar quando há mudanças no localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'sb-mycjqmnvyphnarjoriux-auth-token') {
    console.log('Auth token mudou no localStorage');
    setTimeout(checkAuthStatus, 500);
  }
});

// Verificar auth status inicial
checkAuthStatus();