-- Adicionar colunas para attachments na tabela memoria_ai
ALTER TABLE public.memoria_ai 
ADD COLUMN attachment_type TEXT,
ADD COLUMN attachment_url TEXT;

-- Criar bucket para armazenar mídia do WhatsApp
INSERT INTO storage.buckets (id, name, public) 
VALUES ('whatsapp-media', 'whatsapp-media', false);

-- Políticas de acesso para o bucket whatsapp-media
CREATE POLICY "Users can view own empresa whatsapp media" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'whatsapp-media' AND
  (storage.foldername(name))[1]::bigint IN (
    SELECT empresa_id::text::bigint 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "System can upload whatsapp media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'whatsapp-media');

CREATE POLICY "System can update whatsapp media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'whatsapp-media');

-- Habilitar realtime para memoria_ai (para atualizações automáticas)
ALTER TABLE public.memoria_ai REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.memoria_ai;