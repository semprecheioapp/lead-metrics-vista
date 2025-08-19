-- ============================================
-- 🔧 TRIGGER AUTOMÁTICO PARA MULTI-TENANT (CORRIGIDO)
-- ============================================

-- Função para criar empresa e profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_with_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_empresa_id BIGINT;
  empresa_name TEXT;
  empresa_phone TEXT;
BEGIN
  -- Extrair dados da empresa do metadata do usuário
  empresa_name := COALESCE(NEW.raw_user_meta_data->>'empresa_name', 'Empresa de ' || NEW.email);
  empresa_phone := NEW.raw_user_meta_data->>'empresa_phone';
  
  -- Criar empresa primeiro
  INSERT INTO public.empresas (
    name_empresa, 
    email, 
    telefone, 
    plano, 
    ativo
  ) VALUES (
    empresa_name,
    NEW.email,
    empresa_phone,
    'free',
    true
  ) RETURNING id INTO new_empresa_id;
  
  -- Criar profile do usuário vinculado à empresa
  INSERT INTO public.profiles (
    id, 
    email, 
    nome, 
    empresa_id, 
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    new_empresa_id,
    'admin'
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após inserção na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_company();