'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Add a participant to a trip (via email or invite link)
 */
export async function addParticipant(
  tripId: string,
  email: string,
  name?: string,
  role: 'viewer' | 'editor' | 'guest' = 'viewer'
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is owner
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Je moet ingelogd zijn om deelnemers toe te voegen');
    }

    // Verify user is owner
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip niet gevonden');
    }

    if (trip.owner_id !== user.id) {
      throw new Error('Alleen de planner kan deelnemers toevoegen');
    }

    // Check if participant already exists
    const { data: existing } = await supabase
      .from('trip_participants')
      .select('id')
      .eq('trip_id', tripId)
      .or(`user_id.eq.${user.id},guest_email.eq.${email}`)
      .single();

    if (existing) {
      throw new Error('Deze deelnemer is al toegevoegd aan deze trip');
    }

    // Try to find user by email
    const { data: invitedUser } = await supabase.auth.admin.getUserByEmail(email);

    // Insert participant
    const { data: participant, error } = await supabase
      .from('trip_participants')
      .insert({
        trip_id: tripId,
        user_id: invitedUser?.user?.id || null,
        guest_name: invitedUser?.user ? null : name || null,
        guest_email: invitedUser?.user ? null : email,
        role,
        invited_by: user.id,
        accepted_at: invitedUser?.user ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      throw new Error(`Fout bij toevoegen deelnemer: ${error.message}`);
    }

    revalidatePath(`/trips/${tripId}`);
    return { success: true, participant };
  } catch (error) {
    console.error('Error in addParticipant:', error);
    throw error;
  }
}

/**
 * Remove a participant from a trip
 */
export async function removeParticipant(tripId: string, participantId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is owner
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Je moet ingelogd zijn om deelnemers te verwijderen');
    }

    // Verify user is owner
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('owner_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip niet gevonden');
    }

    if (trip.owner_id !== user.id) {
      throw new Error('Alleen de planner kan deelnemers verwijderen');
    }

    // Delete participant
    const { error } = await supabase
      .from('trip_participants')
      .delete()
      .eq('id', participantId)
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error removing participant:', error);
      throw new Error(`Fout bij verwijderen deelnemer: ${error.message}`);
    }

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in removeParticipant:', error);
    throw error;
  }
}
