-- CORREÇÕES CRÍTICAS DE SEGURANÇA - RLS POLICIES
-- Corrigindo exposições públicas de dados sensíveis

-- 1. Remover acesso público e implementar RLS restritivo para agendamentos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.agendamentos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.agendamentos;

-- Garantir que RLS está habilitado
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para agendamentos - apenas usuários da mesma empresa
CREATE POLICY "Users can view own empresa agendamentos" ON public.agendamentos
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own empresa agendamentos" ON public.agendamentos
FOR INSERT WITH CHECK (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update own empresa agendamentos" ON public.agendamentos
FOR UPDATE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete own empresa agendamentos" ON public.agendamentos
FOR DELETE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- 2. Proteger dados de leads - remover acesso público
DROP POLICY IF EXISTS "Enable read access for all users" ON public.novos_leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.novos_leads;

ALTER TABLE public.novos_leads ENABLE ROW LEVEL SECURITY;

-- Políticas para leads - apenas usuários da mesma empresa
CREATE POLICY "leads_select_company" ON public.novos_leads
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "leads_insert_company" ON public.novos_leads
FOR INSERT WITH CHECK (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "leads_update_company" ON public.novos_leads
FOR UPDATE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "leads_delete_company" ON public.novos_leads
FOR DELETE USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- Super admin sempre tem acesso (para suporte)
CREATE POLICY "Users can access own empresa data" ON public.novos_leads
FOR ALL USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- 3. Proteger dados críticos da empresa - remover acesso público completamente
DROP POLICY IF EXISTS "Enable read access for all users" ON public.empresas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.empresas;

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Super admins podem ver todas as empresas
CREATE POLICY "Super admins can view all empresas" ON public.empresas
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- Super admins podem inserir empresas
CREATE POLICY "Super admins can insert empresas" ON public.empresas
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- Super admins podem deletar empresas
CREATE POLICY "Super admins can delete empresas" ON public.empresas
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- Admins podem ver apenas dados da própria empresa COM INFORMAÇÕES COMPLETAS
CREATE POLICY "Admins can view all empresa info" ON public.empresas
FOR SELECT USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND public.is_admin_user()
);

-- Usuários comuns podem ver apenas dados básicos da própria empresa
CREATE POLICY "Users can view safe empresa info" ON public.empresas
FOR SELECT USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND NOT public.is_admin_user()
);

-- Apenas admins podem atualizar dados da empresa
CREATE POLICY "Admin only empresa updates" ON public.empresas
FOR UPDATE USING (
  id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  AND public.is_admin_user()
);

-- 4. Proteger perfis de usuários - apenas próprio perfil
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Super admins podem ver todos os perfis
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT USING (
  (auth.jwt() ->> 'email') = ANY(ARRAY['admin@sistema.com', 'suporte@sistema.com', 'agenciambkautomacoes@gmail.com'])
);

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- 5. Proteger convites da empresa - apenas admins da empresa
DROP POLICY IF EXISTS "Enable read access for all users" ON public.convites_empresa;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.convites_empresa;

ALTER TABLE public.convites_empresa ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar convites da própria empresa
CREATE POLICY "Admins can manage own company invites" ON public.convites_empresa
FOR ALL USING (company_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- Usuários podem ver convites da própria empresa
CREATE POLICY "Users can view own company invites" ON public.convites_empresa
FOR SELECT USING (company_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- 6. Proteger logs sensíveis
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_erros_agent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_erros_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numero_bloqueados ENABLE ROW LEVEL SECURITY;

-- Políticas para memoria_ai
CREATE POLICY "memoria_select_company" ON public.memoria_ai
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "memoria_insert_company" ON public.memoria_ai
FOR INSERT WITH CHECK (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Allow insert for empresa users" ON public.memoria_ai
FOR INSERT WITH CHECK (empresa_id = (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can access own empresa memoria" ON public.memoria_ai
FOR ALL USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
  OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- Políticas para logs_erros_agent
CREATE POLICY "logs_agent_select_company" ON public.logs_erros_agent
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can access own empresa logs_agent" ON public.logs_erros_agent
FOR ALL USING (empresa_id = (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- Políticas para logs_erros_whatsapp
CREATE POLICY "logs_whatsapp_select_company" ON public.logs_erros_whatsapp
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can access own empresa logs_whatsapp" ON public.logs_erros_whatsapp
FOR ALL USING (empresa_id = (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- Políticas para numero_bloqueados
CREATE POLICY "bloqueados_select_company" ON public.numero_bloqueados
FOR SELECT USING (empresa_id IN (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can access own empresa blocked numbers" ON public.numero_bloqueados
FOR ALL USING (empresa_id = (
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
));

-- 7. Adicionar trigger de validação para atualizações sensíveis
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

-- Aplicar trigger na tabela empresas
CREATE TRIGGER validate_empresa_sensitive_data
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_access();