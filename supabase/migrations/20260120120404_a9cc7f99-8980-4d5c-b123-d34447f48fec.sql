-- Napraw polityki dostępu do danych finansowych

-- 1. payments - ograniczenie SELECT do adminów i payment_managerów
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
CREATE POLICY "Admins and payment managers can view payments" 
ON public.payments FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'payment_manager'::app_role));

-- 2. hall_costs - ograniczenie SELECT do adminów i payment_managerów
DROP POLICY IF EXISTS "Authenticated users can view hall costs" ON public.hall_costs;
CREATE POLICY "Admins and payment managers can view hall costs" 
ON public.hall_costs FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'payment_manager'::app_role));

-- 3. other_expenses - ograniczenie SELECT do adminów i payment_managerów
DROP POLICY IF EXISTS "Authenticated users can view other expenses" ON public.other_expenses;
CREATE POLICY "Admins and payment managers can view other expenses" 
ON public.other_expenses FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'payment_manager'::app_role));