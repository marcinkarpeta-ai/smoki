-- Usuń istniejący widok
DROP VIEW IF EXISTS public.profiles_masked;

-- Utwórz widok ponownie z SECURITY INVOKER
CREATE VIEW public.profiles_masked
WITH (security_invoker = true)
AS
SELECT 
  id,
  mask_email(email) AS email,
  created_at
FROM profiles;

-- Nadaj uprawnienia do widoku
GRANT SELECT ON public.profiles_masked TO authenticated;