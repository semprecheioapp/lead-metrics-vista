-- Habilitar RLS na tabela agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna empresa_id se não existir
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS empresa_id bigint;

-- Criar política de SELECT para agendamentos
CREATE POLICY "Users can view own empresa agendamentos"
ON public.agendamentos
FOR SELECT
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Criar política de INSERT para agendamentos
CREATE POLICY "Users can insert own empresa agendamentos"
ON public.agendamentos
FOR INSERT
WITH CHECK (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Criar política de UPDATE para agendamentos
CREATE POLICY "Users can update own empresa agendamentos"
ON public.agendamentos
FOR UPDATE
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Criar política de DELETE para agendamentos
CREATE POLICY "Users can delete own empresa agendamentos"
ON public.agendamentos
FOR DELETE
USING (empresa_id IN (
  SELECT profiles.empresa_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));