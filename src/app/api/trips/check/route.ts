import { getGuestSessionId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let trips: any[] = [];

    if (user) {
      const { data } = await supabase
        .from('trips')
        .select('id')
        .eq('is_archived', false)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      trips = data || [];
    } else {
      const guestSessionId = await getGuestSessionId();
      if (guestSessionId) {
        const { data } = await supabase
          .from('trips')
          .select('id')
          .eq('is_archived', false)
          .eq('guest_session_id', guestSessionId)
          .order('created_at', { ascending: false })
          .limit(1);
        trips = data || [];
      }
    }

    return NextResponse.json({
      hasTrips: trips.length > 0,
      firstTripId: trips.length > 0 ? trips[0].id : null,
    });
  } catch (error) {
    console.error('Error checking trips:', error);
    return NextResponse.json({ hasTrips: false, firstTripId: null }, { status: 500 });
  }
}
