-- Add white label permission control to empresas table
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS whitelabel_enabled boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_empresas_whitelabel_enabled ON empresas(whitelabel_enabled);

-- Update RLS policy to allow super admins to manage white label permissions
CREATE POLICY "Super admins can manage white label permissions" 
ON empresas 
FOR UPDATE 
USING (
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )) 
  OR ((auth.jwt() ->> 'email'::text) = 'agenciambkautomacoes@gmail.com'::text)
);