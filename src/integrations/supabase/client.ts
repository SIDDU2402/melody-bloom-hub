// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uyrfdzdthmppjicvgkwl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cmZkemR0aG1wcGppY3Zna3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTE2NDcsImV4cCI6MjA2NDYyNzY0N30.iRAz0nYXObrXm7BPNQRvPXqcb82EpIuJIZ2sI43JuZI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);