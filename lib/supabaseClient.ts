import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfhkwoykslzcebyrzgli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaGt3b3lrc2x6Y2VieXJ6Z2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjgyODgsImV4cCI6MjA2MDg0NDI4OH0.A2SqJ9B8Xz4cScqOv9aW16Db7B7VSH_H7rwjZDcaIXA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);