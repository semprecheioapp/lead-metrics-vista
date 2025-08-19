-- Verificar e adicionar apenas a coluna empresa_id
ALTER TABLE public.memoria_ai ADD COLUMN IF NOT EXISTS empresa_id bigint;

-- Criar índices básicos para melhorar performance
CREATE INDEX IF NOT EXISTS idx_memoria_ai_empresa_session ON public.memoria_ai(empresa_id, session_id);
CREATE INDEX IF NOT EXISTS idx_memoria_ai_created_at ON public.memoria_ai(created_at DESC);

-- Adicionar comentários para documentar a estrutura
COMMENT ON COLUMN public.memoria_ai.session_id IS 'Número de telefone do lead/cliente';
COMMENT ON COLUMN public.memoria_ai.empresa_id IS 'ID da empresa para isolamento de dados';

-- Atualizar RLS policy para incluir empresa_id
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own empresa memoria" ON public.memoria_ai;
CREATE POLICY "Users can access own empresa memoria" ON public.memoria_ai
  FOR ALL USING (
    empresa_id = (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()) 
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  );