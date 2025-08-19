-- Create super admin user and update RLS policies for super admin access

-- Update RLS policies for novos_leads to allow super admin access
DROP POLICY IF EXISTS "Users can access own empresa data" ON public.novos_leads;

CREATE POLICY "Users can access own empresa data" 
ON public.novos_leads 
FOR ALL
USING (
  empresa_id = (
    SELECT profiles.empresa_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
  OR 
  auth.jwt() ->> 'email' = 'agenciambkautomacoes@gmail.com'
);

-- Update RLS policies for memoria_ai to allow super admin access
DROP POLICY IF EXISTS "Users can access own empresa memoria" ON public.memoria_ai;

CREATE POLICY "Users can access own empresa memoria" 
ON public.memoria_ai 
FOR ALL
USING (
  empresa_id = (
    SELECT profiles.empresa_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
  OR 
  auth.jwt() ->> 'email' = 'agenciambkautomacoes@gmail.com'
);

-- Update profiles policy to include the new super admin email
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' IN (
    'admin@sistema.com',
    'suporte@sistema.com',
    'agenciambkautomacoes@gmail.com'
  )
);

-- Update empresas policies to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all empresas" ON public.empresas;

CREATE POLICY "Super admins can view all empresas" 
ON public.empresas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
  OR 
  auth.jwt() ->> 'email' = 'agenciambkautomacoes@gmail.com'
);