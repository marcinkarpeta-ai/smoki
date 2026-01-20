-- Usuń starą politykę INSERT (tylko admin)
DROP POLICY IF EXISTS "Admins can insert players" ON public.players;

-- Utwórz nową politykę INSERT dla admin I attendance_manager
CREATE POLICY "Admins and attendance managers can insert players" 
ON public.players FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'attendance_manager'::app_role)
);