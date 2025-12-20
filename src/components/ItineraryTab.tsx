'use client';

import { deleteItinerary, generateItinerary } from '@/app/trips/[id]/itinerary/actions';
import { useState, useTransition } from 'react';
import DraggableActivityList from './DraggableActivityList';

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
                <DraggableActivityList dayId={day.id} activities={day.activities} />
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
