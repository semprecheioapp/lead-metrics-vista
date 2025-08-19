-- Create function to get company agent usage
CREATE OR REPLACE FUNCTION get_company_agent_usage(company_uuid bigint)
RETURNS TABLE (
  used integer,
  "limit" integer,
  can_invite boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_record record;
  member_count integer;
BEGIN
  -- Get company details
  SELECT max_agents INTO company_record FROM empresas WHERE id = company_uuid;
  
  -- Count active members
  SELECT COUNT(*) INTO member_count 
  FROM membros_empresa 
  WHERE company_id = company_uuid AND status = 'active';
  
  -- Return usage data
  RETURN QUERY SELECT 
    member_count::integer as used,
    company_record.max_agents as "limit",
    CASE 
      WHEN company_record.max_agents IS NULL THEN true
      ELSE member_count < company_record.max_agents
    END as can_invite;
END;
$$;