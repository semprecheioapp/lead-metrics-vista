-- Query para debug de convites usando token_hash CORRETO
SELECT 
    id,
    email,
    company_id,
    token_hash,
    status,
    expires_at,
    created_at,
    invited_by,
    role_id,
    scopes
FROM convites_empresa 
WHERE token_hash = '39963328-074b-46c9-8ff0-f62263892f6b' -- token do erro
   OR token_hash = '961642ea-fa06-4065-be58-6820f96b86d2'; -- token anterior

-- Verificar todos os convites pendentes com token_hash visível
SELECT 
    id,
    email,
    company_id,
    token_hash,
    status,
    expires_at,
    created_at
FROM convites_empresa 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Verificar se existem convites para o email específico
SELECT 
    id,
    email,
    token_hash,
    status,
    expires_at
FROM convites_empresa 
WHERE email = 'email@exemplo.com'
ORDER BY created_at DESC;