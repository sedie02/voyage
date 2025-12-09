'use server';

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Fetch all participants for a trip (bypasses RLS using service role)
 * Used when guests need to see all participants
 */
export async function getAllParticipantsForTrip(tripId: string) {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from('trip_participants')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      participants: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      participants: [],
    };
  }
}
