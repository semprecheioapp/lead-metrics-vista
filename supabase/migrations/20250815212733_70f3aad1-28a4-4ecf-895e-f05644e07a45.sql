-- Habilitar realtime para a tabela memoria_ai
ALTER TABLE public.memoria_ai REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.memoria_ai;