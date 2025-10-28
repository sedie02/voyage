import BottomNav from '@/components/BottomNav';
import { getCityPhotoUrl } from '@/lib/external/places';
import { getGuestSessionId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function TripsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let trips: any[] = [];

  // If user is logged in, fetch their trips
  if (user && !userError) {
    const { data, error } = await supabase
      .from('trips')
      .select(
        `
        *,
        trip_participants(count)
      `
      )
      .eq('is_archived', false)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      trips = data || [];
    }
  } else {
    // Guest mode - fetch trips for this guest session only
    const guestSessionId = await getGuestSessionId();

    if (guestSessionId) {
      const { data, error } = await supabase
        .from('trips')
        .select(
          `
          *,
          trip_participants(count)
        `
        )
        .eq('is_archived', false)
        .eq('guest_session_id', guestSessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips (guest):', error);
      } else {
        trips = data || [];
      }
    }
  }

  // Use cached city photo URLs or fetch as fallback
  const tripsWithPhotos = await Promise.all(
    (trips || []).map(async (trip) => ({
      ...trip,
      cityPhotoUrl: trip.city_photo_url || (await getCityPhotoUrl(trip.destination)),
    }))
  );

  // Get first trip as active
  const activeTrip = tripsWithPhotos?.[0] as any;

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-4xl font-bold text-text">Plan</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-text-muted">
            Your{' '}
            <span className="font-semibold text-text">route, transport, stays, activities</span> and{' '}
            <span className="font-semibold text-text">notes</span>, all in one place.
          </p>
        </div>
      </div>

      {activeTrip ? (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
          {/* Trip Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md sm:rounded-3xl">
            {/* Hero Image Section */}
            <div className="relative h-64 sm:h-96">
              {activeTrip.cityPhotoUrl ? (
                <img
                  src={activeTrip.cityPhotoUrl}
                  alt={activeTrip.destination}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-sky-light/40 to-sky-100" />
              )}
              <div className="absolute inset-0 bg-black/25" />

              {/* Unified clickable pill header */}
              <Link
                href={`/trips/${activeTrip.id}`}
                className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3 rounded-full border border-border bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 sm:left-6 sm:right-6 sm:top-6 sm:px-5 sm:py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-bold text-text sm:text-base">
                    <span className="truncate">{activeTrip.title}</span>
                    <span className="shrink-0 text-base sm:text-lg">🌍</span>
                  </p>
                  <p className="truncate text-xs text-text-muted sm:text-sm">
                    {new Date(activeTrip.start_date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    –{' '}
                    {new Date(activeTrip.end_date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-text-muted sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              {/* Destination Label */}
              <div className="absolute bottom-4 right-4 z-10 sm:bottom-8 sm:right-8">
                <p className="text-lg font-bold text-white drop-shadow sm:text-2xl">
                  {activeTrip.destination}
                </p>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="border-b border-border px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                    <svg className="h-14 w-14 -rotate-90 transform sm:h-16 sm:w-16">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke="#E6ECEF"
                        strokeWidth="4"
                        fill="none"
                        className="sm:hidden"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#E6ECEF"
                        strokeWidth="4"
                        fill="none"
                        className="hidden sm:block"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke="#13C892"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="151"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="sm:hidden"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#13C892"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="176"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="hidden sm:block"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs font-bold leading-none text-primary">
                          {Math.ceil(
                            (new Date(activeTrip.end_date).getTime() -
                              new Date(activeTrip.start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-text sm:text-lg">Nachten</p>
                    <p className="text-xs text-text-muted sm:text-sm">gepland</p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                  <button className="flex-1 rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-100 sm:flex-none sm:px-6 sm:py-2.5 sm:text-sm">
                    Route
                  </button>
                  <button className="flex-1 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-gray-50 hover:text-text sm:flex-none sm:px-6 sm:py-2.5 sm:text-sm">
                    Bookings
                  </button>
                </div>
              </div>
            </div>

            {/* Destinations List (single logical step) */}
            <div className="space-y-1 px-4 py-4 sm:px-8 sm:py-6">
              {(() => {
                const nights = Math.max(
                  0,
                  Math.ceil(
                    (new Date(activeTrip.end_date).getTime() -
                      new Date(activeTrip.start_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
                const cityName = String(activeTrip.destination || '').split(',')[0];
                return (
                  <div className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0 sm:py-5">
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary sm:h-10 sm:w-10 sm:text-base">
                        1
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 truncate text-base font-bold text-text sm:text-lg">
                          {cityName}
                        </p>
                        <p className="text-xs text-text-muted sm:text-sm">
                          {new Date(activeTrip.start_date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[3rem] text-center sm:min-w-[4rem]">
                      <p className="text-xl font-bold text-text sm:text-3xl">{nights}</p>
                      <p className="text-[10px] font-medium text-text-muted sm:text-xs">nachten</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* All Trips */}
          {tripsWithPhotos && tripsWithPhotos.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-text">All Trips</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tripsWithPhotos.map((trip: any) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-36 w-full">
                      <img
                        src={
                          trip.cityPhotoUrl ||
                          `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent((trip.destination || 'travel city') + ' skyline')}`
                        }
                        alt={trip.destination}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/15" />
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 line-clamp-1 text-lg font-bold text-text">
                            {trip.title}
                          </h3>
                          <p className="line-clamp-1 text-sm text-text-muted">{trip.destination}</p>
                          {typeof trip.activities_budget === 'number' && (
                            <p className="mt-1 text-xs font-semibold text-text">
                              Budget: € {trip.activities_budget}
                            </p>
                          )}
                        </div>
                        <svg
                          className="h-5 w-5 text-text-muted transition-colors group-hover:text-text"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-text-muted">
                        {new Date(trip.start_date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        -{' '}
                        {new Date(trip.end_date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="rounded-3xl border border-border bg-surface p-16 shadow-sm">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-sky-light/50">
              <svg
                className="h-10 w-10 text-sky"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-text">Start Planning</h2>
            <p className="mx-auto mb-10 max-w-md leading-relaxed text-text-muted">
              Create your first trip and start organizing your adventure with friends and family.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Trip
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
