import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = void 0;
const SUPABASE_ANON_KEY = void 0;
{
  throw new Error("Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
export {
  supabase as s
};
