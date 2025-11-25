/**
 * Supabase Client - Server Side
 * Voor gebruik in Server Components en API Routes
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Maak Supabase client voor Server Components
 * Gebruikt cookies voor session management
 */
export async function createClient(): Promise<any> {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component kan geen cookies setten
            // Dit wordt afgehandeld door middleware
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Component kan geen cookies verwijderen
          }
        },
      },
    }
  );
}

/**
 * Service role client voor admin operations
 * ALLEEN gebruiken in API routes, NOOIT in client!
 */
export function createServiceClient(): any {
  // Service client used only on server-side. Cast to `any` to avoid spreading DB-generic types
  // across code while we finish typing the Database definitions.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // Service client should not pass cookies
    undefined as any
  ) as any;
}
