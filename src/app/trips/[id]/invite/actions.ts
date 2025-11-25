'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Create an invite link for a trip
 * Requires authentication (only owners can create invite links)
 */
export async function createInviteLink(
  tripId: string,
  maxParticipants: number = 10,
  defaultRole: 'viewer' | 'editor' | 'guest' = 'viewer'
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Je moet ingelogd zijn om een uitnodigingslink te maken');
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
      throw new Error('Alleen de planner kan uitnodigingslinks maken');
    }

    // Generate secure token (64 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Try to use invite_links table if it exists
    let error: any = null;

    try {
      const result = await supabase
        .from('invite_links')
        .insert({
          trip_id: tripId,
          token,
          default_role: defaultRole,
          max_uses: maxParticipants,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();
      error = result.error;
    } catch (err) {
      error = err;
    }

    // If table doesn't exist, show helpful error message
    if (
      error &&
      (error.message?.includes('does not exist') || error.message?.includes('schema cache'))
    ) {
      console.error('invite_links table does not exist');
      throw new Error(
        'De invite_links tabel ontbreekt. Voer het SQL script uit in Supabase: supabase/create-invite-links-table.sql'
      );
    }

    if (error) {
      console.error('Error creating invite link:', error);
      throw new Error(`Fout bij maken uitnodigingslink: ${error.message}`);
    }

    revalidatePath(`/trips/${tripId}`);
    return {
      success: true,
      token,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`,
      maxParticipants,
    };
  } catch (error) {
    console.error('Error in createInviteLink:', error);
    throw error;
  }
}

/**
 * Accept an invite link
 */
export async function acceptInvite(token: string, name: string, email?: string) {
  try {
    const supabase = await createClient();

    // Try to find invite link in database
    let inviteLink: any = null;
    let inviteError: any = null;

    try {
      const result = await supabase
        .from('invite_links')
        .select('*, trips(*)')
        .eq('token', token)
        .eq('is_active', true)
        .single();
      inviteLink = result.data;
      inviteError = result.error;
    } catch (err: any) {
      inviteError = err;
    }

    // If invite_links table doesn't exist, show error
    if (
      inviteError &&
      (inviteError.message?.includes('does not exist') ||
        inviteError.message?.includes('schema cache'))
    ) {
      throw new Error(
        'Uitnodigingslinks tabel ontbreekt. Voeg de invite_links tabel toe aan je database. Voer supabase/create-invite-links-table.sql uit in Supabase SQL Editor.'
      );
    }

    if (inviteError || !inviteLink) {
      throw new Error('Uitnodigingslink niet gevonden of verlopen');
    }

    // Check if invite is expired
    if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
      throw new Error('Uitnodigingslink is verlopen');
    }

    // Check if max uses reached
    if (
      inviteLink.max_uses &&
      inviteLink.use_count !== null &&
      inviteLink.use_count >= inviteLink.max_uses
    ) {
      throw new Error('Maximum aantal gebruikers bereikt voor deze uitnodigingslink');
    }

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const tripId = (inviteLink.trips as any)?.id;
    if (!tripId) {
      throw new Error('Trip niet gevonden');
    }

    // Check if already a participant
    const { data: existing } = await supabase
      .from('trip_participants')
      .select('id')
      .eq('trip_id', tripId)
      .or(`user_id.eq.${user?.id || 'null'},guest_email.eq.${email || 'null'}`)
      .single();

    if (existing) {
      throw new Error('Je bent al deelnemer van deze trip');
    }

    // Add participant
    // Build minimal insert object (only required fields)
    const participantData: any = {
      trip_id: tripId,
      user_id: user?.id || null,
      role: inviteLink.default_role || 'viewer',
    };

    // Add optional fields if they exist in the schema
    if (name && !user) {
      participantData.guest_name = name;
    }
    if (email && !user) {
      participantData.guest_email = email;
    }

    // Try to insert with all optional fields
    // Perform insert WITHOUT RETURNING to avoid INSERT ... RETURNING being blocked by SELECT RLS policies.
    // We'll not expect the newly inserted row back here; callers can re-query if they need the participant record.
    const participant: any = null;
    let participantError: any = null;

    try {
      const res = await supabase.from('trip_participants').insert({
        ...participantData,
        invited_by: inviteLink.created_by || null,
        accepted_at: new Date().toISOString(),
      });
      participantError = res.error;
    } catch (err) {
      participantError = err;
    }

    // If that fails, try again with fewer columns (same fallback strategy)
    if (participantError) {
      const retryData: any = { ...participantData };

      // Try without accepted_at
      if (participantError.message?.includes('accepted_at')) {
        delete retryData.accepted_at;
      }

      // Try without invited_by
      if (participantError.message?.includes('invited_by')) {
        delete retryData.invited_by;
      }

      // Try without guest fields
      if (
        participantError.message?.includes('guest_name') ||
        participantError.message?.includes('guest_email')
      ) {
        delete retryData.guest_name;
        delete retryData.guest_email;
      }

      try {
        const retry = await supabase.from('trip_participants').insert(retryData);
        participantError = retry.error;
      } catch (err) {
        participantError = err;
      }
    }

    if (participantError) {
      console.error('Error accepting invite:', participantError);
      throw new Error(`Fout bij accepteren uitnodiging: ${participantError.message}`);
    }

    // Update invite link use count
    await supabase
      .from('invite_links')
      .update({ use_count: (inviteLink.use_count || 0) + 1 })
      .eq('id', inviteLink.id);

    revalidatePath(`/trips/${tripId}`);
    return { success: true, participant, tripId };
  } catch (error) {
    console.error('Error in acceptInvite:', error);
    throw error;
  }
}
