-- Corrigir função com search_path seguro
DROP FUNCTION IF EXISTS process_whatsapp_media_trigger();

CREATE OR REPLACE FUNCTION process_whatsapp_media_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_base64 boolean;
BEGIN
  -- Verificar se a mensagem tem attachment com base64
  has_base64 := (
    NEW.message::jsonb ? 'attachment' AND 
    NEW.message::jsonb->'attachment' ? 'base64' AND 
    NEW.attachment_type IS NULL
  );
  
  -- Se tem base64 e ainda não foi processado, chamar a edge function
  IF has_base64 THEN
    -- Fazer chamada assíncrona para a edge function
    PERFORM pg_notify('process_whatsapp_media', json_build_object(
      'record_id', NEW.id,
      'empresa_id', NEW.empresa_id,
      'session_id', NEW.session_id
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$;