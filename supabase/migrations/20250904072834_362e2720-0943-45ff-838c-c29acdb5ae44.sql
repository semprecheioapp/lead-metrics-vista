-- Add White Label fields to configuracoes_empresa table
ALTER TABLE configuracoes_empresa 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS nome_empresa text,
ADD COLUMN IF NOT EXISTS cor_primaria text DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS cor_secundaria text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS favicon_url text,
ADD COLUMN IF NOT EXISTS titulo_sistema text DEFAULT 'Dashboard MBK - CRM & IA',
ADD COLUMN IF NOT EXISTS cor_accent text DEFAULT '#60a5fa',
ADD COLUMN IF NOT EXISTS cor_background text DEFAULT '#0a0f1c';

-- Create index for better performance on empresa_id lookups
CREATE INDEX IF NOT EXISTS idx_configuracoes_empresa_empresa_id ON configuracoes_empresa(empresa_id);