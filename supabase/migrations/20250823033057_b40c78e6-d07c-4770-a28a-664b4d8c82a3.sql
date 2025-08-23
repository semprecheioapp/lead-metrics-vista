-- Primeiro, remover TODAS as políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "Users can view basic empresa info" ON public.empresas;
DROP POLICY IF EXISTS "Admins can view full empresa info" ON public.empresas;
DROP POLICY IF EXISTS "Only admins can update empresas" ON public.empresas;

-- Criar função auxiliar para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  );
$function$;

-- Recriar políticas para empresas com acesso restrito aos dados sensíveis
CREATE POLICY "Users can view safe empresa info" ON public.empresas
FOR SELECT 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND NOT public.is_admin_user() -- Apenas usuários não-admin veem dados básicos
);

-- Admins veem todos os dados
CREATE POLICY "Admins can view all empresa info" ON public.empresas
FOR SELECT 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND public.is_admin_user()
);

-- Apenas admins podem atualizar
CREATE POLICY "Admin only empresa updates" ON public.empresas
FOR UPDATE 
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND public.is_admin_user()
);

-- Função para mascarar dados sensíveis de empresas para usuários não-admin
CREATE OR REPLACE VIEW public.empresa_safe_view AS
SELECT 
  id,
  name_empresa,
  email,
  telefone,
  plano,
  ativo,
  limite_leads,
  limite_mensagens,
  max_agents,
  created_at,
  updated_at,
  -- Mascarar dados sensíveis para não-admins
  CASE 
    WHEN public.is_admin_user() THEN token
    ELSE NULL 
  END as token,
  CASE 
    WHEN public.is_admin_user() THEN instance
    ELSE NULL 
  END as instance,
  CASE 
    WHEN public.is_admin_user() THEN host
    ELSE NULL 
  END as host,
  CASE 
    WHEN public.is_admin_user() THEN prompt
    ELSE NULL 
  END as prompt
FROM public.empresas
WHERE id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid());

-- Habilitar RLS na view
ALTER VIEW public.empresa_safe_view SET (security_barrier = true);

-- Função para validar entrada de dados sensíveis
CREATE OR REPLACE FUNCTION public.validate_sensitive_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Verificar se usuário tem permissão para alterar dados sensíveis
  IF NOT public.is_admin_user() THEN
    -- Usuários não-admin não podem alterar tokens/credenciais
    IF NEW.token != OLD.token OR NEW.instance != OLD.instance OR 
       NEW.host != OLD.host OR NEW.prompt != OLD.prompt THEN
      RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar credenciais da empresa';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para validar alterações sensíveis
DROP TRIGGER IF EXISTS validate_empresa_sensitive_changes ON public.empresas;
CREATE TRIGGER validate_empresa_sensitive_changes
BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_access();