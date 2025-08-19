-- Criar nova tabela memoria_ai com estrutura correta
CREATE TABLE public.memoria_ai (
  id serial NOT NULL,
  session_id character varying(255) NOT NULL,
  message jsonb NOT NULL,
  data_atual date NULL,
  empresa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT memoria_ai_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Habilitar RLS
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso por empresa
CREATE POLICY "Users can access own empresa memoria" ON public.memoria_ai
  FOR ALL USING (
    empresa_id = (SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()) 
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  );

-- Criar índices para performance
CREATE INDEX idx_memoria_ai_empresa_session ON public.memoria_ai(empresa_id, session_id);
CREATE INDEX idx_memoria_ai_created_at ON public.memoria_ai(created_at DESC);
CREATE INDEX idx_memoria_ai_data_atual ON public.memoria_ai(data_atual);

-- Adicionar comentários para documentar a estrutura
COMMENT ON TABLE public.memoria_ai IS 'Armazena conversas de IA organizadas por empresa e sessão (número de telefone)';
COMMENT ON COLUMN public.memoria_ai.session_id IS 'Número de telefone do lead/cliente';
COMMENT ON COLUMN public.memoria_ai.message IS 'Objeto JSON contendo type (ai/human), content, additional_kwargs e response_metadata';
COMMENT ON COLUMN public.memoria_ai.empresa_id IS 'ID da empresa para isolamento de dados';
COMMENT ON COLUMN public.memoria_ai.data_atual IS 'Data da conversa';

-- Criar trigger para atualizar created_at automaticamente
CREATE TRIGGER update_memoria_ai_updated_at
  BEFORE UPDATE ON public.memoria_ai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();