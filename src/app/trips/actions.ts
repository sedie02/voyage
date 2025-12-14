'use server';

import { getCityPhotoUrl } from '@/lib/external/places';
import { getOrCreateGuestSession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTrip(formData: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  tripType?: string;
  activitiesBudget?: number;
}) {
  try {
    const supabase = await createClient();

    // Get current user or create guest session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const guestSessionId = user ? null : await getOrCreateGuestSession();

    console.log('Creating trip for:', user ? `user ${user.id}` : `guest ${guestSessionId}`);

    const composedDescription = [
      formData.description?.trim(),
      typeof formData.activitiesBudget === 'number' && !isNaN(formData.activitiesBudget)
        ? `Activities budget: ${formData.activitiesBudget}`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    // Fetch city photo URL to cache in DB
    const cityPhotoUrl = await getCityPhotoUrl(formData.destination);

    // Insert trip with either user ID or guest session ID
    let { data: trip, error } = await supabase
      .from('trips')
      .insert({
        title: formData.title,
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: composedDescription || null,
        travel_style: formData.tripType || 'mixed',
        activities_budget:
          typeof formData.activitiesBudget === 'number' ? formData.activitiesBudget : null,
        city_photo_url: cityPhotoUrl,
        owner_id: user?.id || null,
        guest_session_id: guestSessionId,
      })
      .select()
      .single();

    // Fallback if columns not present yet on DB
    if (
      error &&
      ((error as any).message?.includes('activities_budget') ||
        (error as any).message?.includes('city_photo_url'))
    ) {
      const retry = await supabase
        .from('trips')
        .insert({
          title: formData.title,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          description: composedDescription || null,
          travel_style: formData.tripType || 'mixed',
          owner_id: user?.id || null,
          guest_session_id: guestSessionId,
        })
        .select()
        .single();
      trip = retry.data as any;
      error = retry.error as any;
    }

    if (error) {
      if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
        console.error('Error creating trip:', error);
      }
      return {
        success: false,
        error: `Failed to create trip: ${error.message}`,
      };
    }

    revalidatePath('/trips');

    // Return trip data ipv redirect
    return {
      success: true,
      trip,
      message: 'Trip succesvol aangemaakt',
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
      console.error('Error in createTrip:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateTrip(
  tripId: string,
  formData: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('trips')
      .update({
        title: formData.title,
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description || null,
      })
      .eq('id', tripId);

    if (error) {
      if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
        console.error('Error updating trip:', error);
      }
      throw new Error(`Failed to update trip: ${error.message}`);
    }

    revalidatePath(`/trips/${tripId}`);
    redirect(`/trips/${tripId}`);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test' && !process.env.CI) {
      console.error('Error in updateTrip:', error);
    }
    throw error;
  }
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('trips').delete().eq('id', tripId);

  if (error) {
    console.error('Error deleting trip:', error);
    throw new Error('Failed to delete trip');
  }

  revalidatePath('/trips');
  redirect('/trips');
}

export async function archiveTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('trips').update({ is_archived: true }).eq('id', tripId);

  if (error) {
    console.error('Error archiving trip:', error);
    throw new Error('Failed to archive trip');
  }

  revalidatePath('/trips');
  redirect('/trips');
}

export async function duplicateTrip(tripId: string) {
  const supabase = await createClient();

  // Get original trip
  const { data: originalTrip, error: fetchError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (fetchError || !originalTrip) {
    throw new Error('Failed to fetch trip');
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Create duplicate
  const { data: newTrip, error: createError } = await supabase
    .from('trips')
    .insert({
      title: `${originalTrip.title} (Copy)`,
      destination: originalTrip.destination,
      description: originalTrip.description,
      start_date: originalTrip.start_date,
      end_date: originalTrip.end_date,
      travel_style: originalTrip.travel_style,
      owner_id: user.id,
    })
    .select()
    .single();

  if (createError || !newTrip) {
    throw new Error('Failed to duplicate trip');
  }

  revalidatePath('/trips');
  redirect(`/trips/${newTrip.id}`);
}
