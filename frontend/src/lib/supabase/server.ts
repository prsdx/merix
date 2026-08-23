import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

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

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
