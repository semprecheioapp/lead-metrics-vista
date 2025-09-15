-- Função para processar registros existentes manualmente
CREATE OR REPLACE FUNCTION public.process_existing_media_record(record_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Disparar notificação para processar o registro
  PERFORM pg_notify('process_whatsapp_media', json_build_object(
    'record_id', record_id
  )::text);
END;
$$;