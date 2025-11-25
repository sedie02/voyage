'use client';

import { deleteItinerary, generateItinerary } from '@/app/trips/[id]/itinerary/actions';
import { useState, useTransition } from 'react';

interface Day {
  id: string;
  day_number: number;
  date: string;
  title: string | null;
  notes: string | null;
  activities?: Activity[];
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  day_part: 'morning' | 'afternoon' | 'evening' | 'full_day';
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  estimated_cost: number | null;
  notes: string | null; // Contains GYG_URL:... if from GetYourGuide
}

interface ItineraryTabProps {
  tripId: string;
  days: Day[];
  isOwner: boolean;
}

export default function ItineraryTab({ tripId, days, isOwner }: ItineraryTabProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debug logging
  console.log('📅 ItineraryTab loaded:', {
    tripId,
    daysCount: days.length,
    isOwner,
    days: days.map((day) => ({
      id: day.id,
      day_number: day.day_number,
      date: day.date,
      activitiesCount: day.activities?.length || 0,
      activities: day.activities?.map((a: any) => ({
        id: a.id,
        title: a.title,
        day_part: a.day_part,
      })),
    })),
  });

  const handleGenerate = () => {
    console.log('📅 Genereer Planning button clicked!', {
      tripId,
      daysCount: days.length,
      hasExistingDays: days.length > 0,
      isOwner,
      isPending,
    });

    if (!isOwner) {
      console.error('📅 Not owner, cannot generate');
      setError('Alleen de planner kan planning genereren');
      return;
    }

    if (isPending) {
      console.log('📅 Already generating, ignoring click');
      return;
    }

    startTransition(async () => {
      try {
        console.log('📅 Starting transition...');
        setError(null);
        setSuccess(null);
        console.log('📅 Calling generateItinerary with tripId:', tripId);
        const result = await generateItinerary(tripId);
        console.log('📅 generateItinerary result:', result);
        if (result.success) {
          const activitiesMsg = result.activitiesAdded
            ? ` en ${result.activitiesAdded} activiteiten`
            : '';
          setSuccess(`Planning gegenereerd! ${result.count} dagen${activitiesMsg} toegevoegd.`);
          console.log(`📅 Success! ${result.count} dagen${activitiesMsg} toegevoegd.`);
          // Refresh page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          console.error('📅 generateItinerary returned success: false');
          setError('Planning genereren mislukt');
        }
      } catch (err) {
        console.error('📅 Error generating itinerary:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Er ging iets mis bij het genereren';
        console.error('📅 Error message:', errorMessage);
        setError(errorMessage);
      }
    });
  };

  const handleDelete = () => {
    if (!isOwner) {
      setError('Alleen de planner kan planning verwijderen');
      return;
    }

    if (
      !confirm(
        'Weet je zeker dat je de planning wilt verwijderen? Alle dagen en activiteiten worden verwijderd.'
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        setSuccess(null);
        const result = await deleteItinerary(tripId);
        if (result.success) {
          setSuccess('Planning verwijderd. Je kunt nu een nieuwe genereren.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis bij het verwijderen');
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayPartLabel = (dayPart: string) => {
    const labels: Record<string, string> = {
      morning: 'Ochtend',
      afternoon: 'Middag',
      evening: 'Avond',
      full_day: 'Hele dag',
    };
    return labels[dayPart] || dayPart;
  };

  if (days.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Nog geen planning</h3>
        <p className="mb-6 text-gray-600">Genereer automatisch dagen voor je trip</p>

        {error && (
          <div className="mx-auto mb-4 max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-auto mb-4 max-w-md rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {isOwner && (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            {isPending ? 'Genereren...' : 'Genereer Planning'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Planning ({days.length} dagen)</h3>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <button
                onClick={handleGenerate}
                disabled={isPending}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
              >
                {isPending ? 'Genereren...' : 'Genereer Activiteiten'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Verwijder planning
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Dag {day.day_number}</h4>
                <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
              </div>
              {day.title && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {day.title}
                </span>
              )}
            </div>

            {(() => {
              console.log(`📅 Day ${day.day_number} activities check:`, {
                dayId: day.id,
                hasActivities: !!day.activities,
                isArray: Array.isArray(day.activities),
                length: day.activities?.length || 0,
                activities: day.activities,
              });

              return day.activities &&
                Array.isArray(day.activities) &&
                day.activities.length > 0 ? (
                <div className="space-y-4">
                  {day.activities.map((activity: Activity) => {
                    console.log('📅 Rendering activity:', activity);

                    // Extract GetYourGuide URL and image from notes field
                    // Format: "GYG_URL:...|GYG_IMG:..."
                    let getYourGuideUrl: string | null = null;
                    let getYourGuideImageUrl: string | null = null;

                    if (activity.notes) {
                      const parts = activity.notes.split('|');
                      for (const part of parts) {
                        if (part.startsWith('GYG_URL:')) {
                          getYourGuideUrl = part.replace('GYG_URL:', '');
                        } else if (part.startsWith('GYG_IMG:')) {
                          getYourGuideImageUrl = part.replace('GYG_IMG:', '');
                        }
                      }
                    }

                    // Build Google Maps link
                    let mapsLink: string | null = null;
                    if (activity.location_lat && activity.location_lng) {
                      mapsLink = `https://www.google.com/maps?q=${activity.location_lat},${activity.location_lng}`;
                    } else if (activity.location_address) {
                      mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location_address)}`;
                    } else if (activity.location_name) {
                      mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location_name)}`;
                    }

                    // Calculate end time if we have start time and duration
                    let endTime: string | null = activity.end_time || null;
                    let durationText: string | null = null;

                    if (activity.start_time && activity.duration_minutes && !endTime) {
                      const [hours, minutes] = activity.start_time.split(':').map(Number);
                      const startDate = new Date();
                      startDate.setHours(hours, minutes, 0, 0);
                      startDate.setMinutes(startDate.getMinutes() + activity.duration_minutes);
                      const endHours = startDate.getHours().toString().padStart(2, '0');
                      const endMins = startDate.getMinutes().toString().padStart(2, '0');
                      endTime = `${endHours}:${endMins}`;
                    }

                    // Format duration text
                    if (activity.duration_minutes) {
                      const hours = Math.floor(activity.duration_minutes / 60);
                      const mins = activity.duration_minutes % 60;
                      if (hours > 0 && mins > 0) {
                        durationText = `${hours}u ${mins}min`;
                      } else if (hours > 0) {
                        durationText = `${hours} uur`;
                      } else {
                        durationText = `${mins} minuten`;
                      }
                    }

                    // Get activity image - prioritize scraped GetYourGuide image
                    let activityImageUrl: string | null = null;
                    if (getYourGuideImageUrl) {
                      // Use scraped image from GetYourGuide
                      activityImageUrl = getYourGuideImageUrl;
                    } else if (getYourGuideUrl) {
                      // Fallback: try to get OG image from GetYourGuide URL
                      // For now, use a placeholder
                      activityImageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`;
                    } else if (activity.location_name) {
                      // Use location-based image
                      activityImageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`;
                    }

                    return (
                      <div
                        key={activity.id}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                      >
                        {/* Activity Image/Header */}
                        {activityImageUrl || getYourGuideUrl ? (
                          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500">
                            {activityImageUrl ? (
                              <img
                                src={activityImageUrl}
                                alt={activity.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Fallback to gradient if image fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              {getYourGuideUrl ? (
                                <a
                                  href={getYourGuideUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
                                >
                                  <span>🔗</span>
                                  <span>Bekijk op GetYourGuide</span>
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <span className="text-sm font-medium text-white">
                                  {activity.title}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Activity Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="text-lg font-bold text-gray-900">{activity.title}</h5>

                              {activity.description && (
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                  {activity.description}
                                </p>
                              )}

                              {/* Time Information - Always show if we have any time data */}
                              {(activity.start_time || endTime || durationText) && (
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="font-medium">🕐 Tijd:</span>
                                    <span>
                                      {activity.start_time && endTime
                                        ? `${activity.start_time.substring(0, 5)} - ${endTime.substring(0, 5)}`
                                        : activity.start_time
                                          ? `${activity.start_time.substring(0, 5)}`
                                          : endTime
                                            ? `${endTime.substring(0, 5)}`
                                            : 'Tijd nog niet bepaald'}
                                    </span>
                                  </div>
                                  {durationText && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className="font-medium">⏱️ Duur:</span>
                                      <span>{durationText}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Location with Google Maps Link */}
                              {activity.location_name && (
                                <div className="mt-2">
                                  {mapsLink ? (
                                    <a
                                      href={mapsLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
                                    >
                                      📍 {activity.location_name}
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      📍 {activity.location_name}
                                    </span>
                                  )}
                                  {activity.location_address && (
                                    <p className="ml-5 mt-1 text-xs text-gray-500">
                                      {activity.location_address}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Additional Info Badges */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                  {getDayPartLabel(activity.day_part)}
                                </span>
                                {activity.estimated_cost && (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                    €{activity.estimated_cost.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Nog geen activiteiten voor deze dag</p>
                  {isOwner && (
                    <button className="mt-2 text-sm text-primary hover:underline">
                      Voeg activiteit toe
                    </button>
                  )}
                </div>
              );
            })()}

            {day.notes && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-gray-700">{day.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
