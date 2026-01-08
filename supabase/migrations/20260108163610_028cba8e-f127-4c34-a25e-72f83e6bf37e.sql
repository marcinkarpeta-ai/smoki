-- Add amount column to payments table
ALTER TABLE public.payments 
ADD COLUMN amount decimal(10,2) NOT NULL DEFAULT 150.00;

-- Create hall_costs table for monthly hall rental costs
CREATE TABLE public.hall_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL DEFAULT 1100.00,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on hall_costs
ALTER TABLE public.hall_costs ENABLE ROW LEVEL SECURITY;

-- RLS policies for hall_costs
CREATE POLICY "Authenticated users can view hall costs"
ON public.hall_costs
FOR SELECT
USING (true);

CREATE POLICY "Admins and payment managers can insert hall costs"
ON public.hall_costs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));

CREATE POLICY "Admins and payment managers can update hall costs"
ON public.hall_costs
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));

CREATE POLICY "Admins and payment managers can delete hall costs"
ON public.hall_costs
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));

-- Create other_expenses table for additional costs (balls, uniforms, etc.)
CREATE TABLE public.other_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on other_expenses
ALTER TABLE public.other_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for other_expenses
CREATE POLICY "Authenticated users can view other expenses"
ON public.other_expenses
FOR SELECT
USING (true);

CREATE POLICY "Admins and payment managers can insert other expenses"
ON public.other_expenses
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));

CREATE POLICY "Admins and payment managers can update other expenses"
ON public.other_expenses
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));

CREATE POLICY "Admins and payment managers can delete other expenses"
ON public.other_expenses
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'payment_manager'));