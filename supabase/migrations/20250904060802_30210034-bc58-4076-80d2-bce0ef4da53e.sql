-- CORREÇÕES CRÍTICAS DE SEGURANÇA - RLS POLICIES (Versão Ajustada)
-- Implementando proteções mais restritivas

-- 1. Adicionar função auxiliar para dados seguros da empresa
CREATE OR REPLACE FUNCTION public.get_empresa_safe_data()
RETURNS jsonb AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Adicionar trigger de validação para atualizações sensíveis
CREATE OR REPLACE FUNCTION public.validate_sensitive_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Aplicar trigger na tabela empresas (se não existir)
DROP TRIGGER IF EXISTS validate_empresa_sensitive_data ON public.empresas;
CREATE TRIGGER validate_empresa_sensitive_data
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_access();

-- 3. Função para verificação de configurações de autenticação
CREATE OR REPLACE FUNCTION public.check_auth_security_settings()
RETURNS text AS $$
  SELECT 'LEMBRETE: Habilite a proteção contra senhas vazadas nas configurações do Supabase Auth em: Authentication > Settings > Password Protection';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- 4. Verificar se todas as tabelas críticas têm RLS habilitado
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novos_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_erros_agent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_erros_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numero_bloqueados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Política adicional de segurança para audit_logs
CREATE POLICY IF NOT EXISTS "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- 6. Políticas para configurações de notificações
CREATE POLICY IF NOT EXISTS "Users can view own empresa notification config" ON public.configuracoes_notificacoes
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can update own empresa notification config" ON public.configuracoes_notificacoes
FOR UPDATE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can insert own empresa notification config" ON public.configuracoes_notificacoes
FOR INSERT WITH CHECK (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- 7. Políticas para notificações
CREATE POLICY IF NOT EXISTS "Users can view own empresa notifications" ON public.notificacoes
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can update own empresa notifications" ON public.notificacoes
FOR UPDATE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can insert own empresa notifications" ON public.notificacoes
FOR INSERT WITH CHECK (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can delete own empresa notifications" ON public.notificacoes
FOR DELETE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- 8. Políticas para configurações da empresa (mais restritivas)
CREATE POLICY IF NOT EXISTS "Admins can view empresa config" ON public.configuracoes_empresa
FOR SELECT USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY(ARRAY['admin', 'super_admin'])
       OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);

CREATE POLICY IF NOT EXISTS "Admins can update empresa config" ON public.configuracoes_empresa
FOR UPDATE USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY(ARRAY['admin', 'super_admin'])
       OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);

CREATE POLICY IF NOT EXISTS "Admins can insert empresa config" ON public.configuracoes_empresa
FOR INSERT WITH CHECK (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY(ARRAY['admin', 'super_admin'])
       OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);

-- 9. Política para audit_logs com super admins
CREATE POLICY IF NOT EXISTS "Users can view own company audit logs" ON public.audit_logs
FOR SELECT USING (
  company_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);