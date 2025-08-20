-- Query para debug do token 961642ea-fa06-4065-be58-6820f96b86d2
SELECT 
    id,
    email,
    company_id,
    token_hash,
    status,
    expires_at,
    created_at,
    invited_by
FROM convites_empresa 
WHERE token_hash = '961642ea-fa06-4065-be58-6820f96b86d2'
   OR id = '961642ea-fa06-4065-be58-6820f96b86d2';

-- Verificar todos os convites pendentes
SELECT 
    id,
    email,
    company_id,
    token_hash,
    status,
    expires_at
FROM convites_empresa 
WHERE status = 'pending'
ORDER BY created_at DESC;