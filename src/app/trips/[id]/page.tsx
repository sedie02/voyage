import { getCityPhotoUrl } from '@/lib/external/places';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TripDetailClient from './TripDetailClient';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user for permission check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get guest session ID if not authenticated
  const { getGuestSessionId } = await import('@/lib/session');
  const guestSessionId = user ? null : await getGuestSessionId();

  // Fetch trip data with participants
  // First, try simple query without filters to see if RLS allows it
  let trip: any = null;
  let error: any = null;

  // Fetching trip data

  // Try fetching with basic query first
  let result = await supabase.from('trips').select('*').eq('id', id).single();

  trip = result.data;
  error = result.error;

  // Basic query executed

  // If that fails, try with owner filter
  if ((error || !trip) && user) {
    // Trying with owner_id filter
    result = await supabase.from('trips').select('*').eq('id', id).eq('owner_id', user.id).single();
    trip = result.data;
    error = result.error;
    // Owner query executed
  }

  // If that fails, try with guest_session_id
  if ((error || !trip) && guestSessionId) {
    // Trying with guest_session_id filter
    result = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('guest_session_id', guestSessionId)
      .single();
    trip = result.data;
    error = result.error;
    // Guest query executed
  }

  // If still not found, try without any owner (fallback)
  if (error || !trip) {
    result = await supabase.from('trips').select('*').eq('id', id).is('owner_id', null).single();
    trip = result.data;
    error = result.error;
  }

  if (error || !trip) {
    notFound();
  }

  // Now fetch participants.
  // Guests (no auth) who match the trip's guest_session_id are allowed to view participants.
  // Now fetch participants.
  // For guests (no auth), use service client to bypass RLS and see all participants
  let participants: any[] = [];

  if (!user) {
    // Guest user - use service client to see all participants for this trip
    try {
      const service = createServiceClient();
      const { data: allParticipants } = await service
        .from('trip_participants')
        .select('*')
        .eq('trip_id', id)
        .order('created_at', { ascending: true });

      if (allParticipants && allParticipants.length > 0) {
        participants = allParticipants;
      }
    } catch (e) {
      // Service client failed, fall through to regular query
    }
  }

  // If service client didn't work or we're authenticated, use regular client (RLS applies)
  if (participants.length === 0) {
    const participantsResult = await supabase
      .from('trip_participants')
      .select('*')
      .eq('trip_id', id)
      .order('created_at', { ascending: true });
    participants = participantsResult.data || [];
  }

  // Get owner user info if we have owner_id
  let ownerUser: any = null;
  let ownerEmail: string | null = null;

  if (trip.owner_id) {
    // First try to get from current user if it's the owner
    if (user && user.id === trip.owner_id) {
      ownerUser = user;
      ownerEmail = user.email || null;
    } else {
      // Try to get user info from auth.users (admin function)
      try {
        const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(
          trip.owner_id
        );
        if (!ownerError && ownerData?.user) {
          ownerUser = ownerData.user;
          ownerEmail = ownerData.user.email || null;
        }
      } catch (err) {
        // Admin function might not be available, continue without it
      }
    }

    // If still no email, try to get from existing participants
    if (!ownerEmail) {
      const existingOwner = participants.find((p: any) => p.user_id === trip.owner_id);
      if (existingOwner?.guest_email) {
        ownerEmail = existingOwner.guest_email;
      }
    }
  }

  // Ensure owner is in participants list
  if (trip.owner_id) {
    // Check if owner is already in participants
    const ownerIsParticipant = participants.some((p: any) => p.user_id === trip.owner_id);

    if (!ownerIsParticipant) {
      // Get owner name from user metadata
      const ownerName = ownerUser?.user_metadata?.name || null;
      // Always use email - if we don't have it, we need to find it
      const email = ownerEmail || null;

      // Adding owner as participant

      // Add owner as participant (virtual, not in DB yet)
      participants = [
        {
          id: 'owner-' + trip.id,
          trip_id: trip.id,
          user_id: trip.owner_id,
          role: 'owner',
          guest_name: ownerName, // Only set if we have a name
          guest_email: email || 'email@onbekend.nl', // Always set email, use placeholder if needed
          invited_by: null,
          invited_at: trip.created_at,
          accepted_at: trip.created_at,
        },
        ...participants,
      ];

      // Try to actually add owner to DB (idempotent) - only if user is authenticated
      if (user && trip.owner_id === user.id) {
        try {
          const participantData: any = {
            trip_id: trip.id,
            user_id: trip.owner_id,
            role: 'owner',
          };

          // Add email and name if available
          if (ownerEmail) {
            participantData.guest_email = ownerEmail;
          }
          if (ownerUser?.user_metadata?.name) {
            participantData.guest_name = ownerUser.user_metadata.name;
          }

          const { error: addOwnerError } = await supabase
            .from('trip_participants')
            .insert(participantData);

          if (!addOwnerError) {
            // Re-fetch participants if we successfully added owner
            const updatedResult = await supabase
              .from('trip_participants')
              .select('*')
              .eq('trip_id', id);
            participants = updatedResult.data || participants;

            // Update owner name/email in the list if we have it
            const ownerIndex = participants.findIndex((p: any) => p.user_id === trip.owner_id);
            if (ownerIndex >= 0) {
              const name = ownerUser?.user_metadata?.name || null;
              const email = ownerEmail || ownerUser?.email || null;
              participants[ownerIndex] = {
                ...participants[ownerIndex],
                guest_name: name && name !== email ? name : null,
                guest_email: email || participants[ownerIndex].guest_email || 'email@onbekend.nl',
              };
            }
          }
        } catch (err) {
          // Ignore errors, owner will be added on next load
        }
      }
    } else {
      // Owner is already in participants, but update name/email if we have it
      const ownerIndex = participants.findIndex((p: any) => p.user_id === trip.owner_id);
      if (ownerIndex >= 0) {
        const ownerName = ownerUser?.user_metadata?.name || null;
        const email =
          ownerEmail || ownerUser?.email || participants[ownerIndex].guest_email || null;

        // Update in memory first
        participants[ownerIndex] = {
          ...participants[ownerIndex],
          guest_name: ownerName && ownerName !== email ? ownerName : null,
          guest_email: email || participants[ownerIndex].guest_email || 'email@onbekend.nl',
        };

        // Also try to update in DB if email is missing
        if (email && !participants[ownerIndex].guest_email && user && trip.owner_id === user.id) {
          try {
            await supabase
              .from('trip_participants')
              .update({
                guest_email: email,
                guest_name: ownerName && ownerName !== email ? ownerName : null,
              })
              .eq('id', participants[ownerIndex].id);
          } catch (err) {
            // Ignore update errors
          }
        }
      }
    }
  }

  trip.trip_participants = participants;

  const finalTrip = trip;

  // Trip found successfully

  // Check if user is owner (authenticated user) OR guest is owner (via guest_session_id)
  const isOwner =
    (user && finalTrip.owner_id === user.id) ||
    (!user && guestSessionId && finalTrip.guest_session_id === guestSessionId);

  // Calculate days until departure
  const startDate = new Date(finalTrip.start_date);
  const today = new Date();
  const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Use cached photo, or fetch if missing
  const cityPhotoUrl = finalTrip.city_photo_url || (await getCityPhotoUrl(finalTrip.destination));

  // Fetch days for itinerary with activities
  // Fetching days for trip
  let days: any[] = [];
  let daysError: any = null;

  // Try with full query including duration_minutes
  const { data: daysData, error: daysErrorData } = await supabase
    .from('days')
    .select(
      `
      *,
      activities (
        id,
        title,
        description,
        day_part,
        start_time,
        duration_minutes,
        location_name,
        poi_category,
        estimated_cost,
        order_index
      )
    `
    )
    .eq('trip_id', id)
    .order('day_number', { ascending: true });

  days = daysData || [];
  daysError = daysErrorData;

  // If query fails due to missing columns, try with minimal fields
  if (
    daysError &&
    (daysError.message?.includes('duration_minutes') ||
      daysError.message?.includes('poi_category') ||
      daysError.message?.includes('estimated_cost'))
  ) {
    // Query failed due to missing columns, retrying with minimal fields
    const { data: daysDataRetry, error: daysErrorRetry } = await supabase
      .from('days')
      .select(
        `
        *,
        activities (
          id,
          title,
          description,
          day_part,
          start_time,
          end_time,
          duration_minutes,
          location_name,
          location_address,
          location_lat,
          location_lng,
          estimated_cost,
          notes,
          order_index
        )
      `
      )
      .eq('trip_id', id)
      .order('day_number', { ascending: true });

    days = daysDataRetry || [];
    daysError = daysErrorRetry;
  }

  // Days query executed

  // ALWAYS check if activities are missing and fetch them separately
  if (days && days.length > 0) {
    // Check if any day has activities
    const hasActivities = days.some((day: any) => day.activities && day.activities.length > 0);

    if (!hasActivities) {
      // Days exist but no activities found in nested query, fetching activities separately
      // Fetch activities separately for each day
      for (const day of days) {
        // Fetching activities for day
        const { data: dayActivities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('day_id', day.id)
          .order('order_index', { ascending: true });

        // Activities query executed

        if (!activitiesError && dayActivities) {
          day.activities = dayActivities;
          console.log(`✅ Added ${dayActivities.length} activities to day ${day.day_number}`);
        } else {
          console.log(
            `❌ Error fetching activities for day ${day.day_number}:`,
            activitiesError?.message
          );
          day.activities = [];
        }
      }
    }
  }

  // If no days found, try a simple query without nested activities
  if (!days || days.length === 0) {
    // No days found, trying simple query
    const { data: simpleDays, error: simpleError } = await supabase
      .from('days')
      .select('*')
      .eq('trip_id', id)
      .order('day_number', { ascending: true });

    // Simple days query executed

    if (simpleDays && simpleDays.length > 0) {
      // Days exist but query with activities failed - fetch activities separately
      days = simpleDays;

      // Fetch activities separately for each day
      // Fetching activities separately for days
      for (const day of days) {
        // Fetching activities for day
        const { data: dayActivities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('day_id', day.id)
          .order('order_index', { ascending: true });

        // Activities query executed

        if (!activitiesError && dayActivities) {
          day.activities = dayActivities;
          console.log(`✅ Added ${dayActivities.length} activities to day ${day.day_number}`);
        } else {
          console.log(
            `❌ Error fetching activities for day ${day.day_number}:`,
            activitiesError?.message
          );
          day.activities = [];
        }
      }
    }
  }

  // Final days prepared for TripDetailClient

  let packingCategories: any[] = [];
  let packingItems: any[] = [];

  // For guests, use service client; for authenticated users, use regular client
  const clientForPacking = !user ? createServiceClient() : supabase;

  const { data: categoriesData } = await clientForPacking
    .from('packing_categories')
    .select('*')
    .eq('trip_id', id)
    .order('order_index', { ascending: true });

  const { data: itemsData } = await clientForPacking
    .from('packing_items')
    .select('*')
    .eq('trip_id', id)
    .order('order_index', { ascending: true });

  packingCategories = categoriesData || [];
  packingItems = itemsData || [];

  return (
    <TripDetailClient
      trip={{ ...finalTrip, cityPhotoUrl }}
      daysUntil={daysUntil}
      isOwner={isOwner}
      currentUserId={user?.id}
      isGuest={!user}
      guestSessionId={guestSessionId}
      days={days || []}
      packingCategories={packingCategories || []}
      packingItems={packingItems || []}
    />
  );
}
