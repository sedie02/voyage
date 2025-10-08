import Link from 'next/link';

export default async function TripsPage() {
  const trips: any[] = [];

  const activeTrip = trips?.[0] as any;

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
            {/* Map Section */}
            <div className="relative h-64 bg-gradient-to-br from-sky-50 via-sky-light/30 to-sky-100 sm:h-96">
              {/* Header */}
              <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-2 sm:left-6 sm:right-6 sm:top-6">
                <div className="min-w-0 flex-1 rounded-full border border-border bg-surface/95 px-4 py-2.5 shadow-sm backdrop-blur-sm sm:px-5 sm:py-3">
                  <p className="flex items-center gap-2 truncate text-sm font-bold text-text sm:text-base">
                    <span className="truncate">{activeTrip.title}</span>
                    <span className="shrink-0 text-base sm:text-lg">🌍</span>
                  </p>
                  <p className="truncate text-xs text-text-muted sm:text-sm">
                    {new Date(activeTrip.start_date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    -{' '}
                    {new Date(activeTrip.end_date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>

                <Link
                  href={`/trips/${activeTrip.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover sm:px-6 sm:py-3"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="hidden sm:inline">View</span>
                </Link>
              </div>

              {/* Map visualization */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg className="h-full w-full" viewBox="0 0 400 320">
                  {/* Routes */}
                  <path
                    d="M100 120 Q150 80 220 140"
                    stroke="#13C892"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  <path
                    d="M220 140 L200 220"
                    stroke="#13C892"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                  />

                  {/* Pins */}
                  <circle cx="100" cy="120" r="20" fill="#13C892" />
                  <text
                    x="100"
                    y="127"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    1
                  </text>

                  <circle cx="220" cy="140" r="20" fill="#13C892" />
                  <text
                    x="220"
                    y="147"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    2
                  </text>

                  <circle cx="200" cy="220" r="20" fill="#13C892" />
                  <text
                    x="200"
                    y="227"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    3
                  </text>
                </svg>
              </div>

              {/* Country Label */}
              <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
                <p className="text-lg font-bold text-text-secondary sm:text-2xl">
                  {activeTrip.destination.split(',')[1]?.trim() || activeTrip.destination}
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

            {/* Destinations List */}
            <div className="space-y-1 px-4 py-4 sm:px-8 sm:py-6">
              {/* Demo destinations */}
              {[
                { name: activeTrip.destination.split(',')[0], nights: 2, transport: '2h 27m' },
                { name: 'Next Stop', nights: 3, transport: '2h 13m' },
                { name: 'Final Stop', nights: 2, transport: null },
              ].map((dest, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0 sm:py-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary sm:h-10 sm:w-10 sm:text-base">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 truncate text-base font-bold text-text sm:text-lg">
                        {dest.name}
                      </p>
                      <p className="text-xs text-text-muted sm:text-sm">
                        {new Date(activeTrip.start_date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      {dest.transport && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted sm:text-sm">
                          <svg
                            className="h-3 w-3 sm:h-4 sm:w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          <span className="hidden sm:inline">{dest.transport}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 sm:gap-4">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-gray-50 hover:text-text sm:h-10 sm:w-10">
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
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <div className="min-w-[3rem] text-center sm:min-w-[4rem]">
                      <p className="text-xl font-bold text-text sm:text-3xl">{dest.nights}</p>
                      <p className="text-[10px] font-medium text-text-muted sm:text-xs">nachten</p>
                    </div>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-50 sm:h-10 sm:w-10">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Trips */}
          {trips && trips.length > 1 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-text">All Trips</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trips.slice(1).map((trip: any) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-text">
                          {trip.title}
                        </h3>
                        <p className="line-clamp-1 text-sm text-text-muted">{trip.destination}</p>
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
    </div>
  );
}
