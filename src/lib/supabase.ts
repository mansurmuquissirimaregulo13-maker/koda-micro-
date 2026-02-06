
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujszmgrmutidovbhnfvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqc3ptZ3JtdXRpZG92YmhuZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjE4NDQsImV4cCI6MjA4NTI5Nzg0NH0.OzHNacmscHl7xL3YYzJ-VqYpT-xe0hJwWqyQxn6GU1A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
