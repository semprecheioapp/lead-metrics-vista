-- Phase 1: Database Structure - Additive migrations for agent management system

-- Add max_agents to existing empresas table
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS max_agents integer NULL;

-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create papeis_empresa table (roles for companies)
CREATE TABLE IF NOT EXISTS public.papeis_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_preset boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create papeis_permissoes table (role permissions)
CREATE TABLE IF NOT EXISTS public.papeis_permissoes (
  role_id uuid NOT NULL REFERENCES public.papeis_empresa(id) ON DELETE CASCADE,
  permission text NOT NULL,
  PRIMARY KEY (role_id, permission)
);

-- Create membros_empresa table (company members)
CREATE TABLE IF NOT EXISTS public.membros_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.papeis_empresa(id) ON DELETE SET NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  invited_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Create convites_empresa table (company invites)
CREATE TABLE IF NOT EXISTS public.convites_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role_id uuid REFERENCES public.papeis_empresa(id) ON DELETE SET NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid REFERENCES public.profiles(id),
  accepted_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_global table (global staff for super admin)
CREATE TABLE IF NOT EXISTS public.staff_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  invited_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_membros_empresa_company_status ON public.membros_empresa(company_id, status);
CREATE INDEX IF NOT EXISTS idx_convites_empresa_company_status ON public.convites_empresa(company_id, status);
CREATE INDEX IF NOT EXISTS idx_convites_empresa_token ON public.convites_empresa(token_hash);
CREATE INDEX IF NOT EXISTS idx_papeis_permissoes_role ON public.papeis_permissoes(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_action ON public.audit_logs(company_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.check_company_agent_limit(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_company_agent_usage(company_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_limit integer;
  result jsonb;
BEGIN
  -- Get current active members count
  SELECT COUNT(*) INTO current_count
  FROM public.membros_empresa 
  WHERE company_id = company_uuid AND status = 'active';
  
  -- Get company limit
  SELECT max_agents INTO max_limit
  FROM public.empresas 
  WHERE id = company_uuid;
  
  -- Build result
  result := jsonb_build_object(
    'used', current_count,
    'limit', max_limit,
    'can_invite', CASE 
      WHEN max_limit IS NULL THEN true
      ELSE current_count < max_limit
    END
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_company_roles(company_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.audit_log(
  actor_id uuid,
  company_uuid uuid,
  action_name text,
  target_type_name text,
  target_uuid uuid DEFAULT NULL,
  metadata_json jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (actor_user_id, company_id, action, target_type, target_id, metadata)
  VALUES (actor_id, company_uuid, action_name, target_type_name, target_uuid, metadata_json)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Enable RLS on all new tables
ALTER TABLE public.papeis_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papeis_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for papeis_empresa
CREATE POLICY "Users can view own company roles"
ON public.papeis_empresa FOR SELECT
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage own company roles"
ON public.papeis_empresa FOR ALL
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- RLS Policies for papeis_permissoes
CREATE POLICY "Users can view own company role permissions"
ON public.papeis_permissoes FOR SELECT
USING (
  role_id IN (
    SELECT pe.id FROM public.papeis_empresa pe
    JOIN public.profiles p ON pe.company_id = p.empresa_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Admins can manage own company role permissions"
ON public.papeis_permissoes FOR ALL
USING (
  role_id IN (
    SELECT pe.id FROM public.papeis_empresa pe
    JOIN public.profiles p ON pe.company_id = p.empresa_id
    WHERE p.id = auth.uid()
  )
);

-- RLS Policies for membros_empresa
CREATE POLICY "Users can view own company members"
ON public.membros_empresa FOR SELECT
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage own company members"
ON public.membros_empresa FOR ALL
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- RLS Policies for convites_empresa
CREATE POLICY "Users can view own company invites"
ON public.convites_empresa FOR SELECT
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage own company invites"
ON public.convites_empresa FOR ALL
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- RLS Policies for staff_global (super admin only)
CREATE POLICY "Super admins can manage global staff"
ON public.staff_global FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  ) OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view own company audit logs"
ON public.audit_logs FOR SELECT
USING (
  company_id IN (
    SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
  ) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    ) OR (auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com'
  )
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_papeis_empresa_updated_at
  BEFORE UPDATE ON public.papeis_empresa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membros_empresa_updated_at
  BEFORE UPDATE ON public.membros_empresa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_convites_empresa_updated_at
  BEFORE UPDATE ON public.convites_empresa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_global_updated_at
  BEFORE UPDATE ON public.staff_global
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();