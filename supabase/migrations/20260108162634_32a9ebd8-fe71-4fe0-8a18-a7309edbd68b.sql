-- Create cancelled_sessions table
CREATE TABLE public.cancelled_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'Brak dostępu do hali',
  cancelled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cancelled_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view cancelled sessions"
ON public.cancelled_sessions
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert cancelled sessions"
ON public.cancelled_sessions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cancelled sessions"
ON public.cancelled_sessions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));