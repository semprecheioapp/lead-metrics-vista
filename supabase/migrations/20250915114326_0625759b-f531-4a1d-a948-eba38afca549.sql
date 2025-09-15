-- Verificar se o trigger existe e criar se necessário
DROP TRIGGER IF EXISTS process_whatsapp_media_trigger ON public.memoria_ai;

-- Criar o trigger para processar mídia do WhatsApp
CREATE TRIGGER process_whatsapp_media_trigger
  AFTER INSERT ON public.memoria_ai
  FOR EACH ROW
  EXECUTE FUNCTION public.process_whatsapp_media_trigger();