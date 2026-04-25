import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wplzuehsdbvhqyaktshy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbHp1ZWhzZGJ2aHF5YWt0c2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzE4NSwiZXhwIjoyMDkyNjg5MTg1fQ.ONjQFqyWsjGTmQFTt_vAE6MFCSUyUKJ9TEE_92k-jX0'
);