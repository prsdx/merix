import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Configure your Supabase project URL in .env.local or Vercel Environment Variables."
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure your Supabase anon key in .env.local or Vercel Environment Variables."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
