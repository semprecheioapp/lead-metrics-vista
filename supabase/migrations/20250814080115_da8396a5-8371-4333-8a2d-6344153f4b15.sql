-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  empresa_id BIGINT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('lead_urgente', 'followup_atrasado', 'oportunidade', 'meta_performance', 'problema_critico')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  urgencia TEXT NOT NULL DEFAULT 'media' CHECK (urgencia IN ('baixa', 'media', 'alta', 'critica')),
  dados_contexto JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de configurações de notificações
CREATE TABLE public.configuracoes_notificacoes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  empresa_id BIGINT NOT NULL UNIQUE,
  tipos_ativos JSONB NOT NULL DEFAULT '{"lead_urgente": true, "followup_atrasado": true, "oportunidade": true, "meta_performance": true, "problema_critico": true}'::jsonb,
  canais_preferidos JSONB NOT NULL DEFAULT '{"dashboard": true, "email": false, "whatsapp": false, "push": false}'::jsonb,
  horarios_permitidos JSONB NOT NULL DEFAULT '{"inicio": "08:00", "fim": "18:00", "dias_semana": [1,2,3,4,5,6]}'::jsonb,
  limites_por_tipo JSONB NOT NULL DEFAULT '{"lead_urgente": 10, "followup_atrasado": 5, "oportunidade": 8, "meta_performance": 3, "problema_critico": 999}'::jsonb,
  configuracoes_personalizadas JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para notificações
CREATE POLICY "Users can view own empresa notifications" 
ON public.notificacoes 
FOR SELECT 
USING (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert own empresa notifications" 
ON public.notificacoes 
FOR INSERT 
WITH CHECK (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update own empresa notifications" 
ON public.notificacoes 
FOR UPDATE 
USING (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can delete own empresa notifications" 
ON public.notificacoes 
FOR DELETE 
USING (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

-- Políticas para configurações de notificações
CREATE POLICY "Users can view own empresa notification config" 
ON public.configuracoes_notificacoes 
FOR SELECT 
USING (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert own empresa notification config" 
ON public.configuracoes_notificacoes 
FOR INSERT 
WITH CHECK (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update own empresa notification config" 
ON public.configuracoes_notificacoes 
FOR UPDATE 
USING (empresa_id IN (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

-- Índices para performance
CREATE INDEX idx_notificacoes_empresa_id ON public.notificacoes(empresa_id);
CREATE INDEX idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX idx_notificacoes_urgencia ON public.notificacoes(urgencia);
CREATE INDEX idx_notificacoes_created_at ON public.notificacoes(created_at);
CREATE INDEX idx_configuracoes_notificacoes_empresa_id ON public.configuracoes_notificacoes(empresa_id);

-- Trigger para updated_at
CREATE TRIGGER update_configuracoes_notificacoes_updated_at
BEFORE UPDATE ON public.configuracoes_notificacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();