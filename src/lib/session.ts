import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateGuestSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('guest_session_id')?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set('guest_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionId;
}

export async function getGuestSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('guest_session_id')?.value;
}
