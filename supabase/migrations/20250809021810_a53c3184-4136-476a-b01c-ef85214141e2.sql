-- Adicionar coluna empresa_id na tabela memoria_ai
ALTER TABLE public.memoria_ai ADD COLUMN IF NOT EXISTS empresa_id bigint;

-- Atualizar o formato das mensagens existentes para usar "type" ao invés de "role"
UPDATE public.memoria_ai 
SET message = jsonb_build_object(
  'type', CASE WHEN prompt IS NOT NULL THEN 'human' ELSE 'ai' END,
  'content', COALESCE(prompt, response),
  'additional_kwargs', '{}',
  'response_metadata', '{}'
)
WHERE message IS NULL AND (prompt IS NOT NULL OR response IS NOT NULL);

-- Atualizar mensagens que já estão no formato antigo com "role"
UPDATE public.memoria_ai 
SET message = jsonb_build_object(
  'type', message->>'role',
  'content', message->>'content',
  'additional_kwargs', '{}',
  'response_metadata', '{}'
)
WHERE message ? 'role' AND NOT (message ? 'type');

-- Recriar índices com o formato correto
DROP INDEX IF EXISTS idx_memoria_ai_message_role;
CREATE INDEX IF NOT EXISTS idx_memoria_ai_message_type ON public.memoria_ai USING GIN ((message->>'type'));
CREATE INDEX IF NOT EXISTS idx_memoria_ai_empresa_session ON public.memoria_ai(empresa_id, session_id);
CREATE INDEX IF NOT EXISTS idx_memoria_ai_created_at ON public.memoria_ai(created_at DESC);

-- Adicionar comentários atualizados
COMMENT ON COLUMN public.memoria_ai.session_id IS 'Número de telefone do lead/cliente';
COMMENT ON COLUMN public.memoria_ai.message IS 'Objeto JSON contendo type (ai/human), content, additional_kwargs e response_metadata';
COMMENT ON COLUMN public.memoria_ai.empresa_id IS 'ID da empresa para isolamento de dados';

-- Adicionar RLS policy para empresa_id se não existir
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;

-- Criar policy atualizada para incluir empresa_id
DROP POLICY IF EXISTS "Users can access own empresa memoria" ON public.memoria_ai;
CREATE POLICY "Users can access own empresa memoria" ON public.memoria_ai
  FOR ALL USING (
    empresa_id = (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()) 
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  );