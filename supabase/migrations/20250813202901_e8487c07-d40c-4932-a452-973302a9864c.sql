-- Add missing RLS policies for updating empresas table
-- Super admins need to be able to update empresa records

-- Policy for super admins to update empresas
CREATE POLICY "Super admins can update empresas" 
ON public.empresas 
FOR UPDATE 
USING (
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE (profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )) OR 
  ((auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);

-- Policy for super admins to insert empresas
CREATE POLICY "Super admins can insert empresas" 
ON public.empresas 
FOR INSERT 
WITH CHECK (
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE (profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )) OR 
  ((auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);

-- Policy for super admins to delete empresas
CREATE POLICY "Super admins can delete empresas" 
ON public.empresas 
FOR DELETE 
USING (
  (EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE (profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )) OR 
  ((auth.jwt() ->> 'email') = 'agenciambkautomacoes@gmail.com')
);