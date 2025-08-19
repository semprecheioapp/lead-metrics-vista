-- Função para mapear etapa do lead para coluna do kanban
CREATE OR REPLACE FUNCTION map_etapa_to_kanban_column(lead_etapa INTEGER, pipeline_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  coluna_id BIGINT;
BEGIN
  -- Mapear etapa para ordem da coluna (etapa 1 -> ordem 1, etapa 2 -> ordem 2, etc.)
  SELECT id INTO coluna_id 
  FROM kanban_colunas 
  WHERE pipeline_id = map_etapa_to_kanban_column.pipeline_id
    AND ordem = lead_etapa
  ORDER BY ordem
  LIMIT 1;
  
  -- Se não encontrar coluna para a etapa específica, usar a primeira coluna
  IF coluna_id IS NULL THEN
    SELECT id INTO coluna_id 
    FROM kanban_colunas 
    WHERE pipeline_id = map_etapa_to_kanban_column.pipeline_id
    ORDER BY ordem
    LIMIT 1;
  END IF;
  
  RETURN coluna_id;
END;
$$ LANGUAGE plpgsql;

-- Função para auto-adicionar lead na pipeline ativa da empresa
CREATE OR REPLACE FUNCTION auto_assign_lead_to_pipeline()
RETURNS TRIGGER AS $$
DECLARE
  active_pipeline_id BIGINT;
  target_coluna_id BIGINT;
  max_position INTEGER;
BEGIN
  -- Se já tem pipeline_id definido, não fazer nada
  IF NEW.pipeline_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Buscar pipeline ativa da empresa
  SELECT id INTO active_pipeline_id
  FROM pipelines 
  WHERE empresa_id = NEW.empresa_id 
    AND ativo = true
  ORDER BY created_at
  LIMIT 1;
  
  -- Se não tem pipeline ativa, não fazer nada
  IF active_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mapear etapa para coluna
  target_coluna_id := map_etapa_to_kanban_column(COALESCE(NEW.etapa, 1), active_pipeline_id);
  
  -- Se não encontrou coluna, usar a primeira disponível
  IF target_coluna_id IS NULL THEN
    SELECT id INTO target_coluna_id
    FROM kanban_colunas 
    WHERE pipeline_id = active_pipeline_id
    ORDER BY ordem
    LIMIT 1;
  END IF;
  
  -- Buscar próxima posição na coluna
  SELECT COALESCE(MAX(posicao_kanban), 0) + 1 INTO max_position
  FROM novos_leads 
  WHERE kanban_coluna_id = target_coluna_id;
  
  -- Definir pipeline_id e kanban_coluna_id
  NEW.pipeline_id := active_pipeline_id;
  NEW.kanban_coluna_id := target_coluna_id;
  NEW.posicao_kanban := COALESCE(max_position, 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-assignar leads para pipeline
DROP TRIGGER IF EXISTS trigger_auto_assign_pipeline ON novos_leads;
CREATE TRIGGER trigger_auto_assign_pipeline
  BEFORE INSERT OR UPDATE ON novos_leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_lead_to_pipeline();

-- Atualizar leads existentes sem pipeline
UPDATE novos_leads 
SET pipeline_id = NULL, kanban_coluna_id = NULL, posicao_kanban = 0
WHERE pipeline_id IS NULL;

-- Função para reposicionar lead quando etapa muda
CREATE OR REPLACE FUNCTION reposition_lead_on_etapa_change()
RETURNS TRIGGER AS $$
DECLARE
  new_coluna_id BIGINT;
  max_position INTEGER;
BEGIN
  -- Se etapa não mudou ou não tem pipeline, não fazer nada
  IF OLD.etapa = NEW.etapa OR NEW.pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mapear nova etapa para coluna
  new_coluna_id := map_etapa_to_kanban_column(NEW.etapa, NEW.pipeline_id);
  
  -- Se encontrou nova coluna e é diferente da atual
  IF new_coluna_id IS NOT NULL AND new_coluna_id != OLD.kanban_coluna_id THEN
    -- Buscar próxima posição na nova coluna
    SELECT COALESCE(MAX(posicao_kanban), 0) + 1 INTO max_position
    FROM novos_leads 
    WHERE kanban_coluna_id = new_coluna_id;
    
    -- Atualizar coluna e posição
    NEW.kanban_coluna_id := new_coluna_id;
    NEW.posicao_kanban := COALESCE(max_position, 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para reposicionar quando etapa muda
DROP TRIGGER IF EXISTS trigger_reposition_on_etapa_change ON novos_leads;
CREATE TRIGGER trigger_reposition_on_etapa_change
  BEFORE UPDATE ON novos_leads
  FOR EACH ROW
  EXECUTE FUNCTION reposition_lead_on_etapa_change();