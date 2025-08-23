-- Remover view problemática e criar solução mais segura
DROP VIEW IF EXISTS public.empresa_safe_view;

-- Criar função para acessar dados da empresa de forma segura
CREATE OR REPLACE FUNCTION public.get_empresa_safe_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
  user_empresa_id bigint;
  is_admin_check boolean;
BEGIN
  -- Buscar empresa_id do usuário
  SELECT empresa_id INTO user_empresa_id 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF user_empresa_id IS NULL THEN
    RETURN '{}';
  END IF;
  
  -- Verificar se é admin
  SELECT public.is_admin_user() INTO is_admin_check;
  
  -- Retornar dados baseado no nível de acesso
  IF is_admin_check THEN
    -- Admin vê todos os dados
    SELECT to_jsonb(e) INTO result
    FROM public.empresas e
    WHERE e.id = user_empresa_id;
  ELSE
    -- Usuário comum vê apenas dados básicos
    SELECT jsonb_build_object(
      'id', e.id,
      'name_empresa', e.name_empresa,
      'email', e.email,
      'telefone', e.telefone,
      'plano', e.plano,
      'ativo', e.ativo,
      'limite_leads', e.limite_leads,
      'limite_mensagens', e.limite_mensagens,
      'max_agents', e.max_agents,
      'created_at', e.created_at,
      'updated_at', e.updated_at,
      'token', NULL,
      'instance', NULL,
      'host', NULL,
      'prompt', NULL
    ) INTO result
    FROM public.empresas e
    WHERE e.id = user_empresa_id;
  END IF;
  
  RETURN result;
END;
$function$;

-- Habilitar proteção contra vazamento de senhas
-- Nota: Isso deve ser feito nas configurações do Supabase Auth
-- Vamos criar uma função para lembrar o administrador

CREATE OR REPLACE FUNCTION public.check_auth_security_settings()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 'LEMBRETE: Habilite a proteção contra senhas vazadas nas configurações do Supabase Auth em: Authentication > Settings > Password Protection';
$function$;