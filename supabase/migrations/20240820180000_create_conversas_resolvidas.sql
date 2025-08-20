-- Criar tabela de conversas resolvidas para webhook de pesquisa de satisfação
CREATE TABLE IF NOT EXISTS conversas_resolvidas (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    empresa_id INTEGER NOT NULL,
    data_resolucao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_empresa
        FOREIGN KEY (empresa_id) 
        REFERENCES empresas(id)
        ON DELETE CASCADE
);

-- Índice para buscar conversas resolvidas por empresa
CREATE INDEX IF NOT EXISTS idx_conversas_resolvidas_empresa ON conversas_resolvidas(empresa_id);

-- Índice para buscar conversas resolvidas por session_id
CREATE INDEX IF NOT EXISTS idx_conversas_resolvidas_session ON conversas_resolvidas(session_id);