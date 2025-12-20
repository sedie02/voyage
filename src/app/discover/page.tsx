import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 pb-24">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="rounded-3xl border border-white/20 bg-white p-16 shadow-2xl">
          <div className="text-center">
            <svg
              className="mx-auto mb-6 h-20 w-20 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">Ontdek</h2>
            <p className="mx-auto mb-10 max-w-md leading-relaxed text-gray-600">
              We zijn nog bezig met het ontwikkelen van de ontdek functionaliteit. Deze pagina komt
              binnenkort beschikbaar.
            </p>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-purple-600"
            >
              Terug naar Plan
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
