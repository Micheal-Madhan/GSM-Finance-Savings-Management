// Supabase client setup
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpjmwawggdclorxthljq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MSun6Sk8QM-30Jrdzz0Bdw_V3nanbiw'; // Replace with your actual anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
