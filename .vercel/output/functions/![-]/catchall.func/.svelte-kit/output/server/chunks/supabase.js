import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://abcdefghijkl.supabase.co";
const SUPABASE_ANON_KEY = "x";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
export {
  supabase as s
};
