-- Scope permissive policies to authenticated only
DROP POLICY IF EXISTS "Authenticated users can view cancelled sessions" ON public.cancelled_sessions;
CREATE POLICY "Authenticated users can view cancelled sessions"
  ON public.cancelled_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert cancelled sessions" ON public.cancelled_sessions;
CREATE POLICY "Admins can insert cancelled sessions"
  ON public.cancelled_sessions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'attendance_manager'::app_role));

DROP POLICY IF EXISTS "Admins can delete cancelled sessions" ON public.cancelled_sessions;
CREATE POLICY "Admins can delete cancelled sessions"
  ON public.cancelled_sessions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'attendance_manager'::app_role));

DROP POLICY IF EXISTS "Admins and attendance managers can insert players" ON public.players;
CREATE POLICY "Admins and attendance managers can insert players"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'attendance_manager'::app_role));

-- Restrict SECURITY DEFINER function execution to postgres/service_role.
-- RLS policies invoke has_role via the postgres role, so revoking from anon/authenticated
-- does not break policy checks.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mask_email(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.mask_email(text) TO service_role, authenticated;