-- Criar tabela para conversas resolvidas
CREATE TABLE public.conversas_resolvidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  empresa_id bigint NOT NULL,
  resolvido_em timestamp with time zone NOT NULL DEFAULT now(),
  resolvido_por uuid REFERENCES auth.users(id),
  motivo text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conversas_resolvidas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own empresa resolved conversations"
ON public.conversas_resolvidas
FOR SELECT
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can insert own empresa resolved conversations"
ON public.conversas_resolvidas
FOR INSERT
WITH CHECK (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can update own empresa resolved conversations"
ON public.conversas_resolvidas
FOR UPDATE
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can delete own empresa resolved conversations"
ON public.conversas_resolvidas
FOR DELETE
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Criar índices para performance
CREATE INDEX idx_conversas_resolvidas_session_id ON public.conversas_resolvidas(session_id);
CREATE INDEX idx_conversas_resolvidas_empresa_id ON public.conversas_resolvidas(empresa_id);
CREATE INDEX idx_conversas_resolvidas_resolvido_em ON public.conversas_resolvidas(resolvido_em);

-- Criar trigger para updated_at
CREATE TRIGGER update_conversas_resolvidas_updated_at
  BEFORE UPDATE ON public.conversas_resolvidas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversas_resolvidas;