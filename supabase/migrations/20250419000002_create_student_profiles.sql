
-- Create student_profiles table for learning preferences
CREATE TABLE IF NOT EXISTS public.student_profiles (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id),
  learning_styles TEXT[],
  preferred_days_per_week INTEGER,
  session_duration TEXT,
  time_blocks TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Students can manage their own profiles
CREATE POLICY "Students manage their own profiles"
  ON public.student_profiles
  FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Add default values to existing student_profiles if table already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'student_profiles'
  ) THEN
    -- Add columns if they don't exist
    BEGIN
      ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS learning_styles TEXT[];
      ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS preferred_days_per_week INTEGER;
      ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS session_duration TEXT;
      ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS time_blocks TEXT[];
      ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
    EXCEPTION WHEN OTHERS THEN
      -- Do nothing if error occurs
    END;
  END IF;
END $$;
