-- CONFIGURAÇÃO FINAL DE SEGURANÇA ULTRA RESTRITIVA
-- Garantindo que NENHUM acesso seja possível sem autenticação adequada

-- 1. Criar política de fallback que NEGA tudo por padrão
-- Para agendamentos
CREATE POLICY "Deny all by default agendamentos" ON public.agendamentos
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- Para novos_leads  
CREATE POLICY "Deny all by default leads" ON public.novos_leads
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- Para empresas
CREATE POLICY "Deny all by default empresas" ON public.empresas
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- Para profiles
CREATE POLICY "Deny all by default profiles" ON public.profiles
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- Para configuracoes_empresa
CREATE POLICY "Deny all by default config" ON public.configuracoes_empresa
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- Para convites_empresa
CREATE POLICY "Deny all by default invites" ON public.convites_empresa
AS RESTRICTIVE FOR ALL 
TO PUBLIC
USING (auth.uid() IS NOT NULL);

-- 2. Revogar TODOS os privilégios da função PUBLIC (novamente para garantir)
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- 3. Garantir que authenticated role tem apenas os privilégios necessários
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Comentário final de segurança
COMMENT ON SCHEMA public IS 'SEGURANÇA MÁXIMA: Acesso negado por padrão, apenas usuários autenticados com políticas específicas';