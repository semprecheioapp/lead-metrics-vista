-- FASE 1 - CORREÇÕES CRÍTICAS DE SEGURANÇA (Corrigido)

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

-- 2. Corrigir política de segurança para convites_empresa
DROP POLICY IF EXISTS "Deny all by default invites" ON public.convites_empresa;

-- Política para leitura pública de convites (necessário para validação)
CREATE POLICY "Public can read invites for validation" 
ON public.convites_empresa 
FOR SELECT 
USING (true);

-- Políticas separadas para INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert company invites" 
ON public.convites_empresa 
FOR INSERT 
WITH CHECK (
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

CREATE POLICY "Admins can update company invites" 
ON public.convites_empresa 
FOR UPDATE 
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

CREATE POLICY "Admins can delete company invites" 
ON public.convites_empresa 
FOR DELETE 
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