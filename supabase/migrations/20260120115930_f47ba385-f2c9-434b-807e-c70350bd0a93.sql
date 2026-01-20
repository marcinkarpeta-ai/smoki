-- Napraw funkcję mask_email dodając SET search_path
CREATE OR REPLACE FUNCTION public.mask_email(email text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path = public
AS $function$
DECLARE
  at_pos integer;
  local_part text;
  domain_part text;
  masked_local text;
BEGIN
  at_pos := position('@' in email);
  IF at_pos = 0 THEN
    RETURN '***';
  END IF;
  
  local_part := substring(email from 1 for at_pos - 1);
  domain_part := substring(email from at_pos);
  
  IF length(local_part) <= 2 THEN
    masked_local := left(local_part, 1) || '***';
  ELSE
    masked_local := left(local_part, 2) || '***';
  END IF;
  
  RETURN masked_local || domain_part;
END;
$function$;