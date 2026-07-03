
CREATE TABLE IF NOT EXISTS public.player_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT ALL ON public.player_access TO service_role;

ALTER TABLE public.player_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to player_access"
  ON public.player_access FOR ALL
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Admins and payment managers can view payments" ON public.payments;
CREATE POLICY "Payment viewers can view payments"
  ON public.payments FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'payment_manager'::app_role)
    OR has_role(auth.uid(), 'player'::app_role)
  );

DROP POLICY IF EXISTS "Admins and payment managers can view hall costs" ON public.hall_costs;
CREATE POLICY "Payment viewers can view hall costs"
  ON public.hall_costs FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'payment_manager'::app_role)
    OR has_role(auth.uid(), 'player'::app_role)
  );

DROP POLICY IF EXISTS "Admins and payment managers can view other expenses" ON public.other_expenses;
CREATE POLICY "Payment viewers can view other expenses"
  ON public.other_expenses FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'payment_manager'::app_role)
    OR has_role(auth.uid(), 'player'::app_role)
  );
