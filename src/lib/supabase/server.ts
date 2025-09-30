/**
 * Supabase Client - Server Side
 * Voor gebruik in Server Components en API Routes
 */

import type { Database } from '@/types/database.types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Maak Supabase client voor Server Components
 * Gebruikt cookies voor session management
 */
export async function createClient() {
  const cookieStore = await cookies();

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
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {},
    }
  );
}
