
-- 1. Create admin_emails table
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage admin emails"
  ON public.admin_emails FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 2. Update handle_new_user trigger to use admin_emails table
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- If email is in admin_emails table, assign admin role
  IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Add database-level constraints for player names
ALTER TABLE players ADD CONSTRAINT first_name_length CHECK (length(first_name) BETWEEN 2 AND 50);
ALTER TABLE players ADD CONSTRAINT last_name_length CHECK (length(last_name) BETWEEN 2 AND 50);
