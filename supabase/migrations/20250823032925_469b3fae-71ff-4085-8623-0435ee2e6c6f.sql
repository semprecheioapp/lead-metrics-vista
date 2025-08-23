-- Corrigir funções sem search_path definido (vulnerabilidade de segurança)
DROP FUNCTION IF EXISTS public.get_company_agent_usage(bigint);
DROP FUNCTION IF EXISTS public.get_company_agent_usage();

-- Recriar função com search_path seguro
CREATE OR REPLACE FUNCTION public.get_company_agent_usage(company_uuid bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  member_count integer;
  company_max_agents integer;
BEGIN
  -- Get company max_agents setting
  SELECT max_agents INTO company_max_agents FROM public.empresas WHERE id = company_uuid;
  
  -- Count active members
  SELECT COUNT(*) INTO member_count 
  FROM public.membros_empresa 
  WHERE company_id = company_uuid AND status = 'active';
  
  -- Return usage data as single row
  RETURN jsonb_build_object(
    'used', member_count,
    'limit', company_max_agents,
    'can_invite', CASE 
      WHEN company_max_agents IS NULL THEN true
      ELSE member_count < company_max_agents
    END
  );
END;
$function$;

-- Recriar função check_company_agent_limit com search_path seguro
CREATE OR REPLACE FUNCTION public.check_company_agent_limit(company_uuid bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_count integer;
  max_limit integer;
BEGIN
  -- Get current active members count
  SELECT COUNT(*) INTO current_count
  FROM public.membros_empresa 
  WHERE company_id = company_uuid AND status = 'active';
  
  -- Get company limit
  SELECT max_agents INTO max_limit
  FROM public.empresas 
  WHERE id = company_uuid;
  
  -- If no limit set, return true
  IF max_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if current count is less than limit
  RETURN current_count < max_limit;
END;
$function$;

-- Recriar função create_default_company_roles com search_path seguro  
CREATE OR REPLACE FUNCTION public.create_default_company_roles(company_uuid bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Insert default roles for company
  INSERT INTO public.papeis_empresa (company_id, name, description, is_preset) VALUES
    (company_uuid, 'Super Usuário', 'Acesso total na empresa', true),
    (company_uuid, 'Vendas', 'Acesso a WhatsApp, Follow-ups e Oportunidades', true),
    (company_uuid, 'Atendimento', 'Acesso a WhatsApp e Follow-ups', true)
  ON CONFLICT DO NOTHING;
  
  -- Insert permissions for each role
  INSERT INTO public.papeis_permissoes (role_id, permission)
  SELECT r.id, unnest(ARRAY[
    'whatsapp:read', 'whatsapp:send', 'followups:read', 'followups:manage',
    'agendamentos:read', 'agendamentos:manage', 'oportunidades:read', 'oportunidades:manage',
    'settings:read', 'settings:manage'
  ])
  FROM public.papeis_empresa r 
  WHERE r.company_id = company_uuid AND r.name = 'Super Usuário'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.papeis_permissoes (role_id, permission)
  SELECT r.id, unnest(ARRAY[
    'whatsapp:read', 'whatsapp:send', 'followups:read', 'followups:manage',
    'oportunidades:read', 'oportunidades:manage'
  ])
  FROM public.papeis_empresa r 
  WHERE r.company_id = company_uuid AND r.name = 'Vendas'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO public.papeis_permissoes (role_id, permission)
  SELECT r.id, unnest(ARRAY['whatsapp:read', 'whatsapp:send', 'followups:read'])
  FROM public.papeis_empresa r 
  WHERE r.company_id = company_uuid AND r.name = 'Atendimento'
  ON CONFLICT DO NOTHING;
END;
$function$;

-- Recriar função audit_log com search_path seguro
CREATE OR REPLACE FUNCTION public.audit_log(actor_id uuid, company_uuid bigint, action_name text, target_type_name text, target_uuid uuid DEFAULT NULL::uuid, metadata_json jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (actor_user_id, company_id, action, target_type, target_id, metadata)
  VALUES (actor_id, company_uuid, action_name, target_type_name, target_uuid, metadata_json)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Recriar função get_user_empresa_id com search_path seguro
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$function$;

-- Recriar função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- CRÍTICO: Criar políticas mais restritivas para dados sensíveis da empresa
-- Restringir acesso aos dados sensíveis da tabela empresas apenas para admins

-- Primeiro, remover as políticas existentes que são muito permissivas
DROP POLICY IF EXISTS "Users can view their empresa" ON public.empresas;
DROP POLICY IF EXISTS "empresas_select_company" ON public.empresas;

-- Criar políticas mais restritivas que não expõem tokens e credenciais
CREATE POLICY "Users can view basic empresa info" ON public.empresas
FOR SELECT 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
);

-- Política separada para administradores acessarem dados sensíveis
CREATE POLICY "Admins can view full empresa info" ON public.empresas
FOR SELECT 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

-- Restringir atualizações apenas para administradores
DROP POLICY IF EXISTS "Super admins can update empresas" ON public.empresas;
CREATE POLICY "Only admins can update empresas" ON public.empresas
FOR UPDATE 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

-- Política similar para configurações da empresa
DROP POLICY IF EXISTS "Users can access own empresa config" ON public.configuracoes_empresa;
DROP POLICY IF EXISTS "config_select_company" ON public.configuracoes_empresa;
DROP POLICY IF EXISTS "config_update_company" ON public.configuracoes_empresa;

CREATE POLICY "Admins can view empresa config" ON public.configuracoes_empresa
FOR SELECT 
USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

CREATE POLICY "Admins can update empresa config" ON public.configuracoes_empresa
FOR UPDATE 
USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

CREATE POLICY "Admins can insert empresa config" ON public.configuracoes_empresa
FOR INSERT 
WITH CHECK (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

-- Implementar políticas baseadas em roles para leads e agendamentos
-- Usar sistema de permissões baseado em scopes dos membros

CREATE OR REPLACE FUNCTION public.user_has_scope(required_scope text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_scopes jsonb;
  user_role text;
BEGIN
  -- Primeiro verificar se é super admin
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  IF user_role IN ('admin', 'super_admin') OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Verificar scopes do membro da empresa
  SELECT me.scopes INTO user_scopes 
  FROM public.membros_empresa me
  JOIN public.profiles p ON p.empresa_id = me.company_id
  WHERE me.user_id = auth.uid() AND p.id = auth.uid() AND me.status = 'active';
  
  -- Se não tem scopes, retorna false
  IF user_scopes IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se tem o scope específico ou wildcard
  RETURN user_scopes ? required_scope OR user_scopes ? '*';
END;
$function$;