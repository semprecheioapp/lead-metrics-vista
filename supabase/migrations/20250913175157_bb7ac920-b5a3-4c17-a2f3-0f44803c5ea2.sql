-- FASE 1 - CORREÇÕES CRÍTICAS DE SEGURANÇA

-- 1. Implementar RLS para tabela token_bling (CRÍTICO - contém tokens sensíveis)
ALTER TABLE public.token_bling ENABLE ROW LEVEL SECURITY;

-- Política restritiva para token_bling - apenas super admins podem acessar
CREATE POLICY "Super admins only access token_bling" 
ON public.token_bling 
FOR ALL 
USING (
  (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com' 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 2. Corrigir política de segurança para convites_empresa (permitir acesso público para validação de convites)
DROP POLICY IF EXISTS "Deny all by default invites" ON public.convites_empresa;

-- Política mais específica para convites - leitura pública apenas para validação, modificação apenas por admins
CREATE POLICY "Public can read invites for validation" 
ON public.convites_empresa 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage company invites" 
ON public.convites_empresa 
FOR INSERT, UPDATE, DELETE 
USING (
  company_id IN (
    SELECT profiles.empresa_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  ) 
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

-- 3. Trigger para limpeza automática de convites expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.convites_empresa 
  WHERE expires_at < now() AND status = 'pending';
END;
$$;

-- 4. Função de segurança para validar acesso a dados sensíveis
CREATE OR REPLACE FUNCTION public.validate_company_access(target_empresa_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_empresa_id bigint;
  user_role text;
BEGIN
  -- Verificar se é super admin
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  IF user_role = 'super_admin' OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Verificar se usuário pertence à empresa
  SELECT empresa_id INTO user_empresa_id FROM public.profiles WHERE id = auth.uid();
  RETURN user_empresa_id = target_empresa_id;
END;
$$;

-- 5. Atualizar políticas de agendamentos para usar a função de validação
DROP POLICY IF EXISTS "Deny all by default agendamentos" ON public.agendamentos;

CREATE POLICY "Users can access own company agendamentos" 
ON public.agendamentos 
FOR ALL 
USING (public.validate_company_access(empresa_id));

-- 6. Melhorar política de profiles para evitar vazamento de dados
CREATE POLICY "Users can view same company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() 
  OR empresa_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- 7. Função para auditoria de acesso a dados sensíveis
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  table_name text,
  action_type text,
  target_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_user_id,
    company_id,
    action,
    target_type,
    target_id::uuid,
    metadata
  ) VALUES (
    auth.uid(),
    (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()),
    action_type,
    table_name,
    target_id::uuid,
    jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent',
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the main operation
    NULL;
END;
$$;