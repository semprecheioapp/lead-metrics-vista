-- Fix existing database functions to use proper search_path
CREATE OR REPLACE FUNCTION public.auto_assign_lead_to_pipeline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
  FROM public.pipelines 
  WHERE empresa_id = NEW.empresa_id 
    AND ativo = true
  ORDER BY created_at
  LIMIT 1;
  
  -- Se não tem pipeline ativa, não fazer nada
  IF active_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mapear etapa para coluna
  target_coluna_id := public.map_etapa_to_kanban_column(COALESCE(NEW.etapa, 1), active_pipeline_id);
  
  -- Se não encontrou coluna, usar a primeira disponível
  IF target_coluna_id IS NULL THEN
    SELECT id INTO target_coluna_id
    FROM public.kanban_colunas 
    WHERE pipeline_id = active_pipeline_id
    ORDER BY ordem
    LIMIT 1;
  END IF;
  
  -- Buscar próxima posição na coluna
  SELECT COALESCE(MAX(posicao_kanban), 0) + 1 INTO max_position
  FROM public.novos_leads 
  WHERE kanban_coluna_id = target_coluna_id;
  
  -- Definir pipeline_id e kanban_coluna_id
  NEW.pipeline_id := active_pipeline_id;
  NEW.kanban_coluna_id := target_coluna_id;
  NEW.posicao_kanban := COALESCE(max_position, 1);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reposition_lead_on_etapa_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  new_coluna_id BIGINT;
  max_position INTEGER;
BEGIN
  -- Se etapa não mudou ou não tem pipeline, não fazer nada
  IF OLD.etapa = NEW.etapa OR NEW.pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mapear nova etapa para coluna
  new_coluna_id := public.map_etapa_to_kanban_column(NEW.etapa, NEW.pipeline_id);
  
  -- Se encontrou nova coluna e é diferente da atual
  IF new_coluna_id IS NOT NULL AND new_coluna_id != OLD.kanban_coluna_id THEN
    -- Buscar próxima posição na nova coluna
    SELECT COALESCE(MAX(posicao_kanban), 0) + 1 INTO max_position
    FROM public.novos_leads 
    WHERE kanban_coluna_id = new_coluna_id;
    
    -- Atualizar coluna e posição
    NEW.kanban_coluna_id := new_coluna_id;
    NEW.posicao_kanban := COALESCE(max_position, 1);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.map_etapa_to_kanban_column(lead_etapa integer, pipeline_id bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  coluna_id BIGINT;
BEGIN
  -- Mapear etapa para ordem da coluna (etapa 1 -> ordem 1, etapa 2 -> ordem 2, etc.)
  SELECT k.id INTO coluna_id 
  FROM public.kanban_colunas k
  WHERE k.pipeline_id = map_etapa_to_kanban_column.pipeline_id
    AND k.ordem = lead_etapa
  ORDER BY k.ordem
  LIMIT 1;
  
  -- Se não encontrar coluna para a etapa específica, usar a primeira coluna
  IF coluna_id IS NULL THEN
    SELECT k.id INTO coluna_id 
    FROM public.kanban_colunas k
    WHERE k.pipeline_id = map_etapa_to_kanban_column.pipeline_id
    ORDER BY k.ordem
    LIMIT 1;
  END IF;
  
  RETURN coluna_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$function$;