-- Criar enum para status de follow-up
CREATE TYPE public.followup_status AS ENUM ('agendado', 'enviado', 'erro');

-- Criar tabela de follow-ups dedicada
CREATE TABLE public.followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id BIGINT NOT NULL,
  lead_nome TEXT NOT NULL,
  lead_telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL,
  status followup_status NOT NULL DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enviado_em TIMESTAMP WITH TIME ZONE,
  erro_detalhes TEXT
);

-- Habilitar RLS
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view own empresa followups" 
ON public.followups 
FOR SELECT 
USING (empresa_id IN (
  SELECT profiles.empresa_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can insert own empresa followups" 
ON public.followups 
FOR INSERT 
WITH CHECK (empresa_id IN (
  SELECT profiles.empresa_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can update own empresa followups" 
ON public.followups 
FOR UPDATE 
USING (empresa_id IN (
  SELECT profiles.empresa_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can delete own empresa followups" 
ON public.followups 
FOR DELETE 
USING (empresa_id IN (
  SELECT profiles.empresa_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
));

-- Criar índices para performance
CREATE INDEX idx_followups_empresa_id ON public.followups(empresa_id);
CREATE INDEX idx_followups_data_envio ON public.followups(data_envio);
CREATE INDEX idx_followups_status ON public.followups(status);
CREATE INDEX idx_followups_empresa_data_status ON public.followups(empresa_id, data_envio, status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON public.followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar configurações de follow-up na tabela configuracoes_empresa
ALTER TABLE public.configuracoes_empresa 
ADD COLUMN IF NOT EXISTS followup_template TEXT DEFAULT 'Olá {nome}, notamos que você demonstrou interesse em nossos produtos. Podemos ajudá-lo a dar continuidade?',
ADD COLUMN IF NOT EXISTS followup_horario_inicio TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS followup_horario_fim TIME DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS followup_dias_uteis BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS followup_abandono_horas INTEGER DEFAULT 24;