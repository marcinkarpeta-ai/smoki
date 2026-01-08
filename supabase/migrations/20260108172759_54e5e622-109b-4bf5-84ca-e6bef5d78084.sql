-- Create email masking function
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
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
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Create policy: admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create a secure view for listing users with masked emails (for non-admin features)
CREATE OR REPLACE VIEW public.profiles_masked AS
SELECT 
  id,
  public.mask_email(email) AS email,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_masked TO authenticated;