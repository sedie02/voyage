import BottomNav from '@/components/BottomNav';
import { getCityPhotoUrl } from '@/lib/external/places';
import { getGuestSessionId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { addCategory } from './actions';
import DownloadButton from './DownloadButton';
import InitCategoriesButton from './InitCategoriesButton';
import PackingCategory from './PackingCategory';

export default async function PackingPage({ searchParams }: { searchParams: { trip?: string } }) {
  const supabase = await createClient();
  const params = searchParams;

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get trips
  let trips: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('is_archived', false)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    trips = data || [];
  } else {
    const guestSessionId = await getGuestSessionId();
    if (guestSessionId) {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('is_archived', false)
        .eq('guest_session_id', guestSessionId)
        .order('created_at', { ascending: false });
      trips = data || [];
    }
  }

  // Select active trip
  const selectedTripId = params.trip;
  const activeTrip = selectedTripId
    ? trips.find((t) => t.id === selectedTripId) || trips?.[0]
    : trips?.[0];

  // No trip found
  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 pb-24">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <div className="rounded-3xl border border-white/20 bg-white p-16 shadow-2xl">
            <div className="text-center">
              <svg
                className="mx-auto mb-6 h-20 w-20 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">Geen reis gevonden</h2>
              <p className="mx-auto mb-10 max-w-md leading-relaxed text-gray-600">
                Maak eerst een reis aan om je packinglist bij te houden.
              </p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-pink-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nieuwe Reis
              </Link>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Fetch packing data
  const [cityPhotoUrl, categoriesRes, itemsRes, participantsRes] = await Promise.all([
    activeTrip.city_photo_url
      ? Promise.resolve(activeTrip.city_photo_url)
      : getCityPhotoUrl(activeTrip.destination),
    supabase
      .from('packing_categories')
      .select('*')
      .eq('trip_id', activeTrip.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', activeTrip.id)
      .order('order_index', { ascending: true }),
    supabase.from('trip_participants').select('*').eq('trip_id', activeTrip.id),
  ]);

  const categories = (categoriesRes.data as any[]) || [];
  const items = (itemsRes.data as any[]) || [];
  const participants = (participantsRes.data as any[]) || [];

  // Group items by category
  const itemsByCategory: Record<string, any[]> = {};
  categories.forEach((cat) => {
    itemsByCategory[cat.id] = items.filter((item) => item.category_id === cat.id);
  });

  // Calculate stats
  const totalItems = items.length;
  const checkedItems = items.filter((item) => item.checked).length;
  const progressPercentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  // Get current user name (for pre-filling "taken_by")
  const currentUserName =
    participants.find((p) => p.user_id === user?.id)?.guest_name ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 pb-24">
      {/* Hero Header */}
      <div className="relative h-56 sm:h-72">
        {cityPhotoUrl ? (
          <img
            src={cityPhotoUrl}
            alt={activeTrip.destination}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-6 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Packinglist</h1>
            <p className="text-white/90">
              {activeTrip.title} – {activeTrip.destination}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        {/* Trip Selector (als er meerdere trips zijn) */}
        {trips.length > 1 && (
          <div className="mb-6">
            <select
              value={activeTrip.id}
              onChange={(e) => {
                window.location.href = `/packing?trip=${e.target.value}`;
              }}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3 font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-auto"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} – {trip.destination}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stats Card */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl sm:mb-6">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-4 sm:px-6 sm:py-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Voortgang</h2>
                <p className="text-xs text-gray-600 sm:text-sm">
                  {checkedItems} van {totalItems} items afgevinkt
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-pink-600 sm:text-4xl">
                  {progressPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Download + Add Category */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
            {categories.length > 0 && (
              <DownloadButton
                categories={categories}
                itemsByCategory={itemsByCategory}
                tripTitle={activeTrip.title}
              />
            )}

            <form action={addCategory as any} className="flex flex-1 gap-2">
              <input type="hidden" name="trip_id" value={activeTrip.id} />
              <input
                type="text"
                name="name"
                placeholder="Nieuwe categorie..."
                required
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Categorie
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <InitCategoriesButton tripId={activeTrip.id} />
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <PackingCategory
                key={category.id}
                category={category}
                items={itemsByCategory[category.id] || []}
                tripId={activeTrip.id}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
