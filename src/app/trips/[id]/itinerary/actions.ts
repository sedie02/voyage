'use server';

import type { GetYourGuideActivity } from '@/lib/external/getyourguide';
import {
  generateFallbackActivities,
  scrapeGetYourGuideActivities,
} from '@/lib/external/getyourguide';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Generate itinerary days for a trip with activities
 * Creates days based on start_date and end_date and adds activities from GetYourGuide
 */
export async function generateItinerary(tripId: string, includeActivities: boolean = true) {
  const supabase = await createClient();

  // Get user or guest session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { getGuestSessionId } = await import('@/lib/session');
  const guestSessionId = user ? null : await getGuestSessionId();

  // Get trip details
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('start_date, end_date, owner_id, guest_session_id, destination, travel_style')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip niet gevonden');
  }

  // Check permissions: user must be owner OR guest must match guest_session_id
  const isOwner = user && trip.owner_id === user.id;
  const isGuestOwner = !user && guestSessionId && trip.guest_session_id === guestSessionId;

  if (!isOwner && !isGuestOwner) {
    throw new Error('Alleen de planner kan planning genereren');
  }

  // generateItinerary called

  // Check if days already exist
  const { data: existingDays } = await supabase
    .from('days')
    .select('id, day_number')
    .eq('trip_id', tripId);

  // Check if activities exist
  const { data: existingActivities } = await supabase
    .from('activities')
    .select('id')
    .eq('trip_id', tripId)
    .limit(1);

  // Existing data check

  // If days exist but no activities, add activities to existing days
  if (existingDays && existingDays.length > 0) {
    if (existingActivities && existingActivities.length > 0) {
      // Planning already exists with activities
      throw new Error(
        'Planning bestaat al. Verwijder eerst bestaande dagen om opnieuw te genereren.'
      );
    }
    // Days exist but no activities - add activities to existing days
    // Days exist but no activities, calling addActivitiesToExistingDays
    const result = await addActivitiesToExistingDays(tripId, existingDays, trip);
    return result;
  }

  // Calculate days between start and end date
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const days: any[] = [];

  const currentDate = new Date(startDate);
  let dayNumber = 1;

  while (currentDate <= endDate) {
    const dayData: any = {
      trip_id: tripId,
      day_number: dayNumber,
      date: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };

    // Only add optional fields if they exist in schema
    // Try to add title and notes, but don't fail if they don't exist
    try {
      dayData.title = null;
      dayData.notes = null;
    } catch {
      // Ignore if columns don't exist
    }

    days.push(dayData);

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }

  // Insert all days - try with optional fields first
  let insertedDays: any = null;
  let insertError: any = null;

  let result = await supabase.from('days').insert(days).select();

  insertedDays = result.data;
  insertError = result.error;

  // If that fails due to missing columns, try without optional fields
  if (
    insertError &&
    (insertError.message?.includes('title') || insertError.message?.includes('notes'))
  ) {
    const simplifiedDays = days.map((day: any) => ({
      trip_id: day.trip_id,
      day_number: day.day_number,
      date: day.date,
    }));

    result = await supabase.from('days').insert(simplifiedDays).select();

    insertedDays = result.data;
    insertError = result.error;
  }

  if (insertError) {
    throw new Error(`Fout bij genereren planning: ${insertError.message}`);
  }

  // Generate and add activities if requested
  let activitiesAdded = 0;
  if (includeActivities && insertedDays && insertedDays.length > 0 && trip.destination) {
    try {
      // Scrape activities from GetYourGuide
      const travelStyle = trip.travel_style || 'mixed';
      const activities = await scrapeGetYourGuideActivities(
        trip.destination,
        travelStyle,
        insertedDays.length * 3 // 3 activities per day
      );

      // If scraping failed, use fallback

      const finalActivities =
        activities.length > 0
          ? activities
          : generateFallbackActivities(trip.destination, travelStyle, insertedDays.length);

      // Distribute activities across days
      const dayParts: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
      let activityIndex = 0;

      for (const day of insertedDays) {
        // Add 2-3 activities per day
        const activitiesPerDay = Math.min(
          3,
          Math.ceil(finalActivities.length / insertedDays.length)
        );

        for (let i = 0; i < activitiesPerDay && activityIndex < finalActivities.length; i++) {
          const activity = finalActivities[activityIndex];
          const dayPart = dayParts[i % dayParts.length];

          // Calculate start time based on day part
          let startTime: string | null = null;
          if (dayPart === 'morning') startTime = '09:00';
          else if (dayPart === 'afternoon') startTime = '14:00';
          else if (dayPart === 'evening') startTime = '18:00';

          // Parse duration from string (e.g., "2 uur" or "120 minuten")
          let durationMinutes = 120;
          if (activity.duration) {
            const hourMatch = activity.duration.match(/(\d+)\s*(?:uur|hour|h)/i);
            const minuteMatch = activity.duration.match(/(\d+)\s*(?:min|minuten|minute)/i);
            if (hourMatch) {
              durationMinutes = parseInt(hourMatch[1]) * 60;
            } else if (minuteMatch) {
              durationMinutes = parseInt(minuteMatch[1]);
            }
          }

          // Parse price
          let estimatedCost: number | null = null;
          if (activity.price) {
            const priceMatch = activity.price.match(/€?\s*(\d+(?:[,.]\d+)?)/);
            if (priceMatch) {
              estimatedCost = parseFloat(priceMatch[1].replace(',', '.'));
            }
          }

          // Start with minimal required fields only
          const minimalActivity: any = {
            day_id: day.id,
            trip_id: tripId,
            title: activity.title,
            day_part: dayPart,
            order_index: i,
          };

          // Try to insert with minimal fields first

          const { error: activityError, data: insertedActivity } = await supabase
            .from('activities')
            .insert(minimalActivity)
            .select('id')
            .single();

          // If that works, try to add optional fields using the activity ID
          if (!activityError && insertedActivity?.id) {
            // Build update object with all fields
            const updates: any = {};

            if (activity.description) {
              updates.description = activity.description;
            }
            if (startTime) {
              updates.start_time = startTime;
            }
            if (activity.title) {
              updates.location_name = activity.title;
            }
            if (travelStyle) {
              updates.poi_category = travelStyle;
            }
            if (estimatedCost) {
              updates.estimated_cost = estimatedCost;
            }
            if (durationMinutes) {
              updates.duration_minutes = durationMinutes;
            }

            // Store GetYourGuide URL and image in notes field (since url/image columns don't exist)
            // Format: "GYG_URL:...|GYG_IMG:..."
            const notesParts: string[] = [];
            if (activity.url) {
              notesParts.push(`GYG_URL:${activity.url}`);
            }
            if (activity.imageUrl) {
              notesParts.push(`GYG_IMG:${activity.imageUrl}`);
            }
            if (notesParts.length > 0) {
              updates.notes = notesParts.join('|');
            }

            // Update all fields at once using the activity ID
            if (Object.keys(updates).length > 0) {
              const { error: updateError } = await supabase
                .from('activities')
                .update(updates)
                .eq('id', insertedActivity.id);

              if (updateError) {
                console.warn(
                  `⚠️ Error updating activity "${activity.title}" (trying individual fields):`,
                  updateError.message
                );
                // Try updating fields one by one to handle missing columns
                for (const [key, value] of Object.entries(updates)) {
                  try {
                    const { error: _fieldError } = await supabase
                      .from('activities')
                      .update({ [key]: value })
                      .eq('id', insertedActivity.id);
                    // Field update may fail for optional columns, ignore
                  } catch (e) {
                    // Ignore individual field errors
                  }
                }
              } else {
                console.log(
                  `✅ Updated activity "${activity.title}"${activity.url ? ` (GetYourGuide: ${activity.url})` : ''}`
                );
              }
            }

            activitiesAdded++;
            console.log(
              `✅ Activity added: "${activity.title}" (ID: ${insertedActivity.id})${activity.url ? ` - URL: ${activity.url}` : ''}`
            );
          } else {
            // If minimal insert fails, log the error
          }

          activityIndex++;
        }
      }
    } catch (err) {
      // Don't fail if activities fail, days are already created
    }
  }

  revalidatePath(`/trips/${tripId}`);
  return {
    success: true,
    days: insertedDays,
    count: insertedDays?.length || 0,
    activitiesAdded,
  };
}

/**
 * Delete all days for a trip (to regenerate)
 */
export async function deleteItinerary(tripId: string) {
  const supabase = await createClient();

  // Check if user is authenticated and is owner
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Je moet ingelogd zijn om planning te verwijderen');
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
    throw new Error('Alleen de planner kan planning verwijderen');
  }

  // Delete all days (activities will be deleted via CASCADE)
  const { error: deleteError } = await supabase.from('days').delete().eq('trip_id', tripId);

  if (deleteError) {
    throw new Error(`Fout bij verwijderen planning: ${deleteError.message}`);
  }

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}

/**
 * Update activity order within a day
 * Allows anyone with access to the trip to reorder activities
 */
export async function updateActivityOrder(
  dayId: string,
  activityIds: string[]
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // Get user or guest session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { getGuestSessionId } = await import('@/lib/session');
  const guestSessionId = user ? null : await getGuestSessionId();

  // Get day and trip info to check access
  const { data: day, error: dayError } = await supabase
    .from('days')
    .select('trip_id, trip:trips(id, owner_id, guest_session_id)')
    .eq('id', dayId)
    .single();

  if (dayError || !day) {
    throw new Error('Dag niet gevonden');
  }

  const trip = day.trip as any;
  if (!trip) {
    throw new Error('Trip niet gevonden');
  }

  // Check access: user must be owner OR guest must match guest_session_id OR user is participant
  const isOwner = user && trip.owner_id === user.id;
  const isGuestOwner = !user && guestSessionId && trip.guest_session_id === guestSessionId;

  // Check if user is a participant (via invite link)
  let isParticipant = false;
  if (user) {
    const { data: participant } = await supabase
      .from('trip_participants')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('user_id', user.id)
      .single();
    isParticipant = !!participant;
  }

  // For guests, check if they have access via invite link (check cookie/localStorage)
  // We'll allow guests to reorder if they can see the trip (RLS will handle security)

  if (!isOwner && !isGuestOwner && !isParticipant) {
    // Try to check if guest has access via invite token
    // If RLS allows them to see activities, they can reorder
    const { data: testActivity } = await supabase
      .from('activities')
      .select('id')
      .eq('day_id', dayId)
      .limit(1)
      .single();

    if (!testActivity) {
      throw new Error('Geen toegang tot deze planning');
    }
  }

  // Update order_index for each activity
  const updates = activityIds.map((activityId, index) => ({
    id: activityId,
    order_index: index,
  }));

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('activities')
      .update({ order_index: update.order_index, updated_at: new Date().toISOString() })
      .eq('id', update.id)
      .eq('day_id', dayId);

    if (updateError) {
      throw new Error(`Fout bij bijwerken volgorde: ${updateError.message}`);
    }
  }

  revalidatePath(`/trips/${trip.id}`);
  return { success: true };
}

/**
 * Add activities to existing days
 */
async function addActivitiesToExistingDays(
  tripId: string,
  days: any[],
  trip: any
): Promise<{ success: boolean; days: any[]; count: number; activitiesAdded: number }> {
  try {
    const supabase = await createClient();
    const travelStyle = trip.travel_style || 'mixed';

    // Scrape activities from GetYourGuide

    const activities = await scrapeGetYourGuideActivities(
      trip.destination,
      travelStyle,
      days.length * 3 // 3 activities per day
    );

    console.log(
      '📅 First 3 activities:',
      activities.slice(0, 3).map((a) => ({
        title: a.title,
        url: a.url,
        hasUrl: !!a.url,
      }))
    );

    // If scraping failed or no URLs, use fallback
    const activitiesWithUrls = activities.filter(
      (a) => a.url && a.url.includes('getyourguide.com')
    );

    let finalActivities: GetYourGuideActivity[];
    if (activitiesWithUrls.length > 0) {
      finalActivities = activitiesWithUrls;
    } else if (activities.length > 0) {
      // Use scraped activities even without URLs (might have other info)
      finalActivities = activities;
      console.log(`⚠️ Using ${finalActivities.length} scraped activities (no URLs)`);
    } else {
      finalActivities = generateFallbackActivities(trip.destination, travelStyle, days.length);
    }

    console.log(
      `📅 First 3 activities:`,
      finalActivities.slice(0, 3).map((a) => a.title)
    );

    // Distribute activities across days
    const dayParts: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
    let activityIndex = 0;
    let activitiesAdded = 0;

    // Fetch days with day_number to ensure we have it
    const { data: daysWithNumbers } = await supabase
      .from('days')
      .select('id, day_number')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true });

    const daysToUse = daysWithNumbers || days;

    if (finalActivities.length === 0) {
      return {
        success: true,
        days: days,
        count: days.length,
        activitiesAdded: 0,
      };
    }

    for (const day of daysToUse) {
      // Add 2-3 activities per day
      const activitiesPerDay = Math.min(3, Math.ceil(finalActivities.length / daysToUse.length));
      console.log(
        `📅 Day ${day.day_number || '?'}: Adding ${activitiesPerDay} activities (out of ${finalActivities.length} total)`
      );

      for (let i = 0; i < activitiesPerDay && activityIndex < finalActivities.length; i++) {
        const activity = finalActivities[activityIndex];
        const dayPart = dayParts[i % dayParts.length];

        // Calculate start time based on day part
        let startTime: string | null = null;
        if (dayPart === 'morning') startTime = '09:00';
        else if (dayPart === 'afternoon') startTime = '14:00';
        else if (dayPart === 'evening') startTime = '18:00';

        // Parse duration from string (e.g., "2 uur" or "120 minuten")
        let durationMinutes = 120;
        if (activity.duration) {
          const hourMatch = activity.duration.match(/(\d+)\s*(?:uur|hour|h)/i);
          const minuteMatch = activity.duration.match(/(\d+)\s*(?:min|minuten|minute)/i);
          if (hourMatch) {
            durationMinutes = parseInt(hourMatch[1]) * 60;
          } else if (minuteMatch) {
            durationMinutes = parseInt(minuteMatch[1]);
          }
        }

        // Parse price
        let estimatedCost: number | null = null;
        if (activity.price) {
          const priceMatch = activity.price.match(/€?\s*(\d+(?:[,.]\d+)?)/);
          if (priceMatch) {
            estimatedCost = parseFloat(priceMatch[1].replace(',', '.'));
          }
        }

        // Start with minimal required fields only (without trip_id - it might not exist)
        const minimalActivity: any = {
          day_id: day.id,
          title: activity.title,
          day_part: dayPart,
          order_index: i,
        };

        // Try with trip_id first (if column exists)
        const activityWithTripId = { ...minimalActivity, trip_id: tripId };

        // Try to insert with minimal fields first (with trip_id)

        let { error: activityError, data: insertedActivity } = await supabase
          .from('activities')
          .insert(activityWithTripId)
          .select('id')
          .single();

        // If that fails due to trip_id column, retry without it
        if (activityError && activityError.message?.includes('trip_id')) {
          const { error: retryError, data: retryData } = await supabase
            .from('activities')
            .insert(minimalActivity)
            .select('id')
            .single();

          activityError = retryError;
          insertedActivity = retryData;
        }

        // If that works, try to add optional fields using the activity ID
        if (!activityError && insertedActivity?.id) {
          // Build update object with all fields
          const updates: any = {};

          if (activity.description) {
            updates.description = activity.description;
          }
          if (startTime) {
            updates.start_time = startTime;
          }
          if (activity.title) {
            updates.location_name = activity.title;
          }
          if (travelStyle) {
            updates.poi_category = travelStyle;
          }
          if (estimatedCost) {
            updates.estimated_cost = estimatedCost;
          }
          if (durationMinutes) {
            updates.duration_minutes = durationMinutes;
          }

          // Store GetYourGuide URL and image in notes field (since url/image columns don't exist)
          // Format: "GYG_URL:...|GYG_IMG:..."
          const notesParts: string[] = [];
          if (activity.url) {
            notesParts.push(`GYG_URL:${activity.url}`);
          }
          if (activity.imageUrl) {
            notesParts.push(`GYG_IMG:${activity.imageUrl}`);
          }
          if (notesParts.length > 0) {
            updates.notes = notesParts.join('|');
          }

          // Update all fields at once using the activity ID
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('activities')
              .update(updates)
              .eq('id', insertedActivity.id);

            if (updateError) {
              console.warn(
                `⚠️ Error updating activity "${activity.title}" (trying individual fields):`,
                updateError.message
              );
              // Try updating fields one by one to handle missing columns
              for (const [key, value] of Object.entries(updates)) {
                try {
                  const { error: _fieldError } = await supabase
                    .from('activities')
                    .update({ [key]: value })
                    .eq('id', insertedActivity.id);
                  // Field update may fail for optional columns, ignore
                } catch (e) {
                  // Ignore individual field errors
                }
              }
            } else {
              console.log(
                `✅ Updated activity "${activity.title}"${activity.url ? ` (GetYourGuide: ${activity.url})` : ''}`
              );
            }
          }

          activitiesAdded++;
          console.log(
            `✅ Activity added: "${activity.title}" (ID: ${insertedActivity.id})${activity.url ? ` - GetYourGuide URL: ${activity.url}` : ''}`
          );
        } else {
          // If minimal insert fails, log the error
        }

        activityIndex++;
      }
    }

    revalidatePath(`/trips/${tripId}`);
    return {
      success: true,
      days: days,
      count: days.length,
      activitiesAdded,
    };
  } catch (error) {
    // Re-throw with context
    throw new Error(
      `Error adding activities to existing days: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
