-- Drop existing function and recreate with correct return type
DROP FUNCTION IF EXISTS get_company_agent_usage(bigint);

-- Create function to get company agent usage
CREATE OR REPLACE FUNCTION get_company_agent_usage(company_uuid bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_count integer;
  company_max_agents integer;
BEGIN
  -- Get company max_agents setting
  SELECT max_agents INTO company_max_agents FROM empresas WHERE id = company_uuid;
  
  -- Count active members
  SELECT COUNT(*) INTO member_count 
  FROM membros_empresa 
  WHERE company_id = company_uuid AND status = 'active';
  
  -- Return usage data as single row
  RETURN jsonb_build_object(
    'used', member_count,
    'limit', company_max_agents,
    'can_invite', CASE 
      WHEN company_max_agents IS NULL THEN true
      ELSE member_count < company_max_agents
    END
  );
END;
$$;