'use server';

import { getCityPhotoUrl } from '@/lib/external/places';
import { getOrCreateGuestSession } from '@/lib/session';
import { createClient, createServiceClient } from '@/lib/supabase/server';
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

    // Trip creation in progress

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
      return {
        success: false,
        error: `Failed to create trip: ${error.message}`,
      };
    }

    // Automatically create default packing categories for the new trip
    if (trip?.id) {
      const defaultCategories = [
        { name: 'Kleding', order_index: 0 },
        { name: 'Toiletartikelen', order_index: 1 },
        { name: 'Elektronica', order_index: 2 },
        { name: 'Documenten', order_index: 3 },
        { name: 'Medicijnen', order_index: 4 },
        { name: 'Overig', order_index: 5 },
      ];

      // Try to insert categories (silently fail if table doesn't exist or RLS blocks it)
      try {
        const insertResult = await supabase.from('packing_categories').insert(
          defaultCategories.map((cat) => ({
            trip_id: trip.id,
            name: cat.name,
            order_index: cat.order_index,
          }))
        );

        // If insert fails and user is guest, try with service client
        if (insertResult.error && !user && guestSessionId) {
          const service = createServiceClient();
          await service.from('packing_categories').insert(
            defaultCategories.map((cat) => ({
              trip_id: trip.id,
              name: cat.name,
              order_index: cat.order_index,
            }))
          );
        }
      } catch (categoryError) {
        // Silently fail - categories can be created manually later
        console.log('Could not auto-create packing categories:', categoryError);
      }
    }

    revalidatePath('/trips');
    revalidatePath('/packing');

    // Return trip data ipv redirect
    return {
      success: true,
      trip,
      message: 'Trip succesvol aangemaakt',
    };
  } catch (error) {
    // Trip creation in progress
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
    activitiesBudget?: number;
  }
) {
  const supabase = await createClient();

  // Fetch city photo URL if destination changed
  const { data: currentTrip } = await supabase
    .from('trips')
    .select('destination')
    .eq('id', tripId)
    .single();

  let cityPhotoUrl: string | null = null;
  if (currentTrip && currentTrip.destination !== formData.destination) {
    const { getCityPhotoUrl } = await import('@/lib/external/places');
    cityPhotoUrl = await getCityPhotoUrl(formData.destination);
  }

  const updateData: any = {
    title: formData.title,
    destination: formData.destination,
    start_date: formData.startDate,
    end_date: formData.endDate,
    description: formData.description || null,
  };

  if (typeof formData.activitiesBudget === 'number') {
    updateData.activities_budget = formData.activitiesBudget;
  }

  if (cityPhotoUrl) {
    updateData.city_photo_url = cityPhotoUrl;
  }

  const { error } = await supabase.from('trips').update(updateData).eq('id', tripId);

  if (error) {
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('trips').delete().eq('id', tripId);

  if (error) {
    throw new Error('Failed to delete trip');
  }

  revalidatePath('/trips');
  redirect('/trips');
}

export async function archiveTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('trips').update({ is_archived: true }).eq('id', tripId);

  if (error) {
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
