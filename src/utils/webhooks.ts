interface WebhookResponse {
  success: string;
}

interface NPSWebhookData {
  empresa_id: number;
  numero: string;
  nome: string;
  data_agendamento: string;
  hora_agendamento: string;
  servico: string;
  email?: string;
}

interface PesquisaWebhookData {
  empresa_id: number;
  nome: string;
  numero: string;
  chat_id: string;
}

export async function sendNPSWebhook(data: NPSWebhookData): Promise<WebhookResponse> {
  try {
    const response = await fetch('https://wb.semprecheioapp.com.br/webhook/nps_pos_agendamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar webhook NPS:', error);
    throw error;
  }
}

export async function sendPesquisaSatisfacaoWebhook(data: PesquisaWebhookData): Promise<WebhookResponse> {
  try {
    const response = await fetch('https://wb.semprecheioapp.com.br/webhook/pesquisa_satisfacao_dashmbk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar webhook pesquisa:', error);
    throw error;
  }
}