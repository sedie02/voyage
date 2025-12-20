import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 pb-24">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="rounded-3xl border border-white/20 bg-white p-16 shadow-2xl">
          <div className="text-center">
            <svg
              className="mx-auto mb-6 h-20 w-20 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">Budget Beheer</h2>
            <p className="mx-auto mb-10 max-w-md leading-relaxed text-gray-600">
              We zijn nog bezig met het ontwikkelen van de budget functionaliteit. Deze pagina komt
              binnenkort beschikbaar.
            </p>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Terug naar Trips
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
