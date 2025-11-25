import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateGuestSession(): Promise<string> {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('guest_session_id')?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    // Use the object form for cookieStore.set to match Next's cookie API
    try {
      cookieStore.set({
        name: 'guest_session_id',
        value: sessionId as string,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      } as any);
    } catch (e) {
      // In environments where cookies can't be set (e.g., certain SSR contexts), ignore.
    }
  }

  return sessionId as string;
}

export async function getGuestSessionId(): Promise<string | undefined> {
  const cookieStore = cookies();
  return cookieStore.get('guest_session_id')?.value;
}
