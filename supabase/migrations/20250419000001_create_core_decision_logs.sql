
-- Create core_decision_logs table for tracing AI decisions 
CREATE TABLE IF NOT EXISTS public.core_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.core_decision_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert and select their own logs
CREATE POLICY "Users can insert their own logs"
  ON public.core_decision_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can view their own logs"
  ON public.core_decision_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS core_decision_logs_user_id_idx ON public.core_decision_logs(user_id);
CREATE INDEX IF NOT EXISTS core_decision_logs_action_idx ON public.core_decision_logs(action);
