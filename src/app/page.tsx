import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Global AppHeader is rendered by layout */}

      {/* Hero Section */}
      <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 shadow-sm sm:px-4">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
              <span className="text-xs font-semibold text-text sm:text-sm">
                Jouw avontuur begint hier
              </span>
            </div>

            <h1 className="px-4 text-3xl font-bold leading-tight tracking-tight text-text sm:text-5xl md:text-6xl lg:text-7xl">
              Plan je
              <span className="mt-2 block text-primary">Droomreis</span>
              <span className="mt-2 block">Moeiteloos</span>
            </h1>

            <p className="mx-auto max-w-2xl px-4 text-base leading-relaxed text-text-muted sm:text-xl">
              Van route tot budget, van activiteiten tot inpaklijst.
              <span className="mt-2 block font-semibold text-text">
                Alles in één overzichtelijke app.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="mx-auto flex max-w-2xl flex-col items-stretch justify-center gap-4 px-4 pt-6 sm:flex-row sm:items-center">
              <Link
                href="/trips/new"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg sm:w-auto sm:px-10 sm:py-5"
              >
                <span className="text-sm sm:text-base">Start je Eerste Trip</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <Link
                href="/trips"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-8 py-4 font-bold text-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 sm:w-auto sm:px-10 sm:py-5"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm sm:text-base">Bekijk Mijn Reizen</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4 px-4 pt-12 sm:gap-8 sm:pt-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-4xl md:text-5xl">500+</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted sm:mt-2 sm:text-sm">
                  Avonturiers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-4xl md:text-5xl">1K+</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted sm:mt-2 sm:text-sm">
                  Trips
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-4xl md:text-5xl">50+</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-muted sm:mt-2 sm:text-sm">
                  Landen
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 px-4 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-text sm:mb-4 sm:text-4xl">
              Alles wat je nodig hebt voor je reis
            </h2>
            <p className="text-base text-text-muted sm:text-xl">
              Een complete tool voor groepsreizen
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-6 w-6 text-primary sm:h-7 sm:w-7"
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
              <h3 className="mb-2 text-lg font-bold text-text sm:mb-3 sm:text-xl">Dagplanning</h3>
              <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                Maak een gedetailleerde itinerary met activiteiten, restaurants en
                bezienswaardigheden voor elke dag.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-6 w-6 text-primary sm:h-7 sm:w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text sm:mb-3 sm:text-xl">Groepsbeheer</h3>
              <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                Nodig vrienden uit, stem gezamenlijk over activiteiten en communiceer makkelijk
                binnen je groep.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 sm:mb-6 sm:h-14 sm:w-14">
                <svg
                  className="h-6 w-6 text-primary sm:h-7 sm:w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text sm:mb-3 sm:text-xl">
                Budget Tracking
              </h3>
              <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                Houd alle uitgaven bij en splits kosten eerlijk met je reisgenoten. Geen gedoe meer
                met geld.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-md sm:rounded-3xl sm:p-16">
            <h2 className="mb-4 text-2xl font-bold text-text sm:mb-6 sm:text-4xl md:text-5xl">
              Klaar om je reis te plannen?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-text-muted sm:mb-10 sm:text-xl">
              Maak gratis een account en begin vandaag nog met het plannen van je droomreis.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover sm:px-10 sm:py-5 sm:text-base"
            >
              Start Nu Gratis
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary sm:h-8 sm:w-8">
              <svg
                className="h-4 w-4 text-white sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-text sm:text-xl">voyage</span>
          </div>
          <p className="mb-3 text-sm text-text-muted sm:mb-4 sm:text-base">
            Jouw reis, perfect georganiseerd.
          </p>
          <p className="text-xs text-text-secondary sm:text-sm">
            © 2025 Voyage. Gemaakt met ❤️ voor reizigers.
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
