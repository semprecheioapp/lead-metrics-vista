-- Corrigir função para eliminar ambiguidade do pipeline_id
CREATE OR REPLACE FUNCTION map_etapa_to_kanban_column(lead_etapa INTEGER, pipeline_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  coluna_id BIGINT;
BEGIN
  -- Mapear etapa para ordem da coluna (etapa 1 -> ordem 1, etapa 2 -> ordem 2, etc.)
  SELECT k.id INTO coluna_id 
  FROM kanban_colunas k
  WHERE k.pipeline_id = map_etapa_to_kanban_column.pipeline_id
    AND k.ordem = lead_etapa
  ORDER BY k.ordem
  LIMIT 1;
  
  -- Se não encontrar coluna para a etapa específica, usar a primeira coluna
  IF coluna_id IS NULL THEN
    SELECT k.id INTO coluna_id 
    FROM kanban_colunas k
    WHERE k.pipeline_id = map_etapa_to_kanban_column.pipeline_id
    ORDER BY k.ordem
    LIMIT 1;
  END IF;
  
  RETURN coluna_id;
END;
$$ LANGUAGE plpgsql;