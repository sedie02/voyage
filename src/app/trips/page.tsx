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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-bg pb-24">
      {/* Header */}
      <div className="border-b border-border bg-surface px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 text-2xl font-bold text-text sm:mb-3 sm:text-3xl lg:text-4xl">
            Plan
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base lg:text-lg">
            Je{' '}
            <span className="font-semibold text-text">
              route, transport, verblijf, activiteiten
            </span>{' '}
            en <span className="font-semibold text-text">notities</span>, alles op één plek.
          </p>
        </div>
      </div>

      {activeTrip ? (
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-12">
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
                className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between gap-2 rounded-full border border-border bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 sm:left-4 sm:right-4 sm:top-4 sm:gap-3 sm:px-4 sm:py-2.5 sm:text-sm lg:left-6 lg:right-6 lg:top-6 lg:px-5 lg:py-3 lg:text-base"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-bold text-text sm:gap-2">
                    <span className="truncate">{activeTrip.title}</span>
                    <span className="shrink-0 text-sm sm:text-base lg:text-lg">🌍</span>
                  </p>
                  <p className="truncate text-[10px] text-text-muted sm:text-xs lg:text-sm">
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
                  className="h-4 w-4 shrink-0 text-text-muted sm:h-5 sm:w-5 lg:h-6 lg:w-6"
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
              <div className="absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4 lg:bottom-8 lg:right-8">
                <p className="text-sm font-bold text-white drop-shadow sm:text-base lg:text-lg xl:text-2xl">
                  {activeTrip.destination}
                </p>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="border-b border-border px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 lg:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
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
            <div className="space-y-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
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
                  <div className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-0 sm:gap-3 sm:py-4 lg:py-5">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary sm:h-9 sm:w-9 sm:text-sm lg:h-10 lg:w-10 lg:text-base">
                        1
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 truncate text-sm font-bold text-text sm:mb-1 sm:text-base lg:text-lg">
                          {cityName}
                        </p>
                        <p className="text-[10px] text-text-muted sm:text-xs lg:text-sm">
                          {new Date(activeTrip.start_date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[2.5rem] shrink-0 text-center sm:min-w-[3rem] lg:min-w-[4rem]">
                      <p className="text-lg font-bold text-text sm:text-xl lg:text-3xl">{nights}</p>
                      <p className="text-[9px] font-medium text-text-muted sm:text-[10px] lg:text-xs">
                        nachten
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* All Trips */}
          {tripsWithPhotos && tripsWithPhotos.length > 0 && (
            <div className="mt-8 sm:mt-12 lg:mt-16">
              <h2 className="mb-4 text-xl font-bold text-text sm:mb-6 sm:text-2xl">Alle Reizen</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="p-4 sm:p-6">
                      <div className="mb-3 flex items-start justify-between sm:mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1 line-clamp-1 text-base font-bold text-text sm:text-lg">
                            {trip.title}
                          </h3>
                          <p className="line-clamp-1 text-xs text-text-muted sm:text-sm">
                            {trip.destination}
                          </p>
                          {typeof trip.activities_budget === 'number' && (
                            <p className="mt-1 text-[10px] font-semibold text-text sm:text-xs">
                              Budget: € {trip.activities_budget}
                            </p>
                          )}
                        </div>
                        <svg
                          className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text sm:h-5 sm:w-5"
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
                      <div className="text-xs text-text-muted sm:text-sm">
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
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-24">
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12 lg:p-16">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-light/50 sm:mb-8 sm:h-20 sm:w-20">
              <svg
                className="h-8 w-8 text-sky sm:h-10 sm:w-10"
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
            <h2 className="mb-2 text-xl font-bold text-text sm:mb-3 sm:text-2xl">
              Start met Plannen
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-text-muted sm:mb-8 sm:text-base">
              Maak je eerste reis aan en begin met het organiseren van je avontuur met vrienden en
              familie.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover sm:px-8 sm:py-4 sm:text-base"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Reis Aanmaken
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
