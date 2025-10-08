/**
 * Supabase Client - Browser Side
 * Voor gebruik in Client Components
 */

// import { createBrowserClient } from '@supabase/ssr';

/**
 * Singleton Supabase client voor browser gebruik
 * Automatisch handelt session refresh af
 */
export function createClient() {
  // return createBrowserClient<Database>(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );
}

/**
 * Helper: Check of user is authenticated
 */
export async function isAuthenticated() {
  // const supabase = createClient();
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();
  // return !!session;
}

/**
 * Helper: Get current user
 */
export async function getCurrentUser() {
  // const supabase = createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // return user;
}
