-- ============================================
-- 🔧 CORREÇÃO DE SEGURANÇA - SEARCH PATH
-- ============================================

-- Recriar função get_empresa_by_phone com search_path seguro
CREATE OR REPLACE FUNCTION public.get_empresa_by_phone(phone_number TEXT)
RETURNS TABLE(empresa_id BIGINT, nome TEXT) 
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT id, name_empresa 
  FROM public.empresas 
  WHERE telefone = phone_number AND ativo = true
  LIMIT 1;
$$;

-- Recriar função get_empresa_by_email com search_path seguro  
CREATE OR REPLACE FUNCTION public.get_empresa_by_email(email_address TEXT)
RETURNS TABLE(empresa_id BIGINT, nome TEXT)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT id, name_empresa
  FROM public.empresas
  WHERE email = email_address AND ativo = true
  LIMIT 1;
$$;

-- Recriar função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;