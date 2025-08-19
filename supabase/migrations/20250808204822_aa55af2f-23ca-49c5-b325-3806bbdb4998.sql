-- Fix RLS policies and permissions for novos_leads and memoria_ai tables

-- Grant usage on public schema to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT permissions on tables to authenticated users
GRANT SELECT ON public.novos_leads TO authenticated;
GRANT SELECT ON public.memoria_ai TO authenticated;

-- Enable RLS on memoria_ai (if not already enabled)
ALTER TABLE public.memoria_ai ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users to read data
CREATE POLICY "Authenticated users can view novos_leads" 
ON public.novos_leads 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can view memoria_ai" 
ON public.memoria_ai 
FOR SELECT 
TO authenticated 
USING (true);

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "novos_leads_isolation" ON public.novos_leads;
DROP POLICY IF EXISTS "logs_erros_agent_isolation" ON public.logs_erros_agent;
DROP POLICY IF EXISTS "logs_erros_whatsapp_isolation" ON public.logs_erros_whatsapp;
DROP POLICY IF EXISTS "message_buffer_isolation" ON public.message_buffer;
DROP POLICY IF EXISTS "numero_bloqueados_isolation" ON public.numero_bloqueados;
DROP POLICY IF EXISTS "usuarios_isolation" ON public.usuarios;
DROP POLICY IF EXISTS "configuracoes_empresa_isolation" ON public.configuracoes_empresa;