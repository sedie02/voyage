'use client';

import BottomNav from '@/components/BottomNav';
import ItineraryTab from '@/components/ItineraryTab';
import ParticipantList from '@/components/ParticipantList';
import ShareTripModal from '@/components/ShareTripModal';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PackingTabContent from './PackingTabContent';

// Destination gradient helper
const getDestinationGradient = (destination: string) => {
  const dest = destination.toLowerCase();
  if (dest.includes('bali') || dest.includes('beach') || dest.includes('thailand')) {
    return 'from-orange-400 via-pink-500 to-purple-600';
  } else if (dest.includes('paris') || dest.includes('france') || dest.includes('europe')) {
    return 'from-blue-400 via-purple-500 to-pink-500';
  } else if (dest.includes('tokyo') || dest.includes('japan') || dest.includes('asia')) {
    return 'from-red-400 via-pink-500 to-purple-600';
  } else if (dest.includes('new york') || dest.includes('usa') || dest.includes('america')) {
    return 'from-cyan-400 via-blue-500 to-indigo-600';
  } else if (dest.includes('mountain') || dest.includes('alps') || dest.includes('swiss')) {
    return 'from-emerald-400 via-teal-500 to-cyan-600';
  }
  return 'from-sky-400 via-blue-500 to-indigo-600';
};

interface TripDetailClientProps {
  trip: any;
  daysUntil: number;
  isOwner?: boolean;
  isGuest?: boolean;
  currentUserId?: string;
  guestSessionId?: string | null;
  days?: any[];
  packingCategories?: any[];
  packingItems?: any[];
}

export default function TripDetailClient({
  trip,
  daysUntil,
  isOwner = false,
  isGuest = false,
  currentUserId,
  guestSessionId,
  days = [],
  packingCategories = [],
  packingItems = [],
}: TripDetailClientProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Update activeTab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  // Debug: log imported PackingTabContent shape to debug invalid element type errors

  try {
    // Removed debug logs
  } catch {
    /* ignore */
  }

  // Debug logging removed for production

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get actual participant count from participants array
  const participants = trip.trip_participants || [];
  // Count all participants (including owner if not already counted)
  const participantCount = Array.isArray(participants)
    ? participants.length
    : participants?.[0]?.count || 0;

  // Ensure owner is counted if they're not in the participants list
  const hasOwnerAsParticipant =
    Array.isArray(participants) &&
    participants.some((p: any) => p.user_id === trip.owner_id || p.role === 'owner');

  // If owner exists but not in participants, add 1 to count
  const finalParticipantCount =
    trip.owner_id && !hasOwnerAsParticipant ? participantCount + 1 : participantCount;
  const tripDuration = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const gradient = getDestinationGradient(trip.destination);
  const activitiesBudget =
    typeof trip.activities_budget === 'number' ? trip.activities_budget : null;

  // Debug: check if cityPhotoUrl exists
  const cityPhotoUrl = (trip as any).cityPhotoUrl || trip.city_photo_url || null;
  // Trip photo URL prepared

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 pb-24">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {/* City photo with better fallback */}
        {/* Fallback gradient - achtergrond */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        {/* City photo */}
        {cityPhotoUrl && (
          <img
            src={cityPhotoUrl}
            alt={trip.destination}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {/* Overlay gradient for better text readability - minder transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

        {/* Navigation controls */}
        <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between sm:left-4 sm:right-4 sm:top-4 lg:left-6 lg:right-6">
          <Link
            href="/trips"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-sm text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base"
          >
            <svg
              className="h-3 w-3 transition-transform group-hover:-translate-x-0.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Terug</span>
          </Link>
          <Link
            href={`/trips/${trip.id}/edit`}
            className="group inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1.5 text-xs text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm lg:gap-2 lg:px-4 lg:py-2.5 lg:text-base"
          >
            <svg
              className="h-3 w-3 transition-transform group-hover:scale-110 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="font-semibold">Bewerken</span>
          </Link>
        </div>
        {/* Trip info overlay */}
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-7xl px-2 pb-2 sm:px-3 sm:pb-3 lg:px-8 lg:pb-8">
          <div className="text-white">
            <h1 className="mb-3 text-3xl font-bold text-white drop-shadow-2xl sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-white sm:gap-3 lg:gap-6">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-2 sm:text-base">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-semibold sm:text-lg">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-2 sm:text-base">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold sm:text-lg">{tripDuration} dagen</span>
              </div>
              {activitiesBudget !== null && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/80 px-3 py-1.5 text-sm backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-2 sm:text-base">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-bold sm:text-lg">€ {activitiesBudget}</span>
                </div>
              )}
              {finalParticipantCount > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-2 sm:text-base">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="font-semibold sm:text-lg">
                    {finalParticipantCount}{' '}
                    {finalParticipantCount === 1 ? 'deelnemer' : 'deelnemers'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {daysUntil > 0 && (
        <div className="bg-sky-600 text-white">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold sm:text-base lg:text-lg">
                Je reis begint over {daysUntil} dagen!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="scrollbar-hide flex overflow-x-auto border-b border-gray-100">
                {[
                  { id: 'overview', label: 'Overzicht', icon: '📋' },
                  { id: 'itinerary', label: 'Planning', icon: '🗓️' },
                  { id: 'budget', label: 'Budget', icon: '💰' },
                  { id: 'packing', label: 'Inpaklijst', icon: '🎒' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-all duration-200 sm:flex-1 sm:px-6 sm:py-5 sm:text-sm ${
                      activeTab === tab.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className="text-base transition-transform group-hover:scale-110 sm:text-lg">
                        {tab.icon}
                      </span>
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-lg font-bold text-gray-900">Over deze reis</h3>
                      <p className="leading-relaxed text-gray-600">
                        {trip.description || 'Nog geen beschrijving toegevoegd.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-4 sm:gap-4">
                      <div>
                        <p className="mb-1 text-sm text-gray-500">Vertrek</p>
                        <p className="font-semibold text-gray-900">{formatDate(trip.start_date)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-500">Terugkeer</p>
                        <p className="font-semibold text-gray-900">{formatDate(trip.end_date)}</p>
                      </div>
                    </div>

                    {/* Participants Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Deelnemers</h3>
                        {finalParticipantCount > 0 && (
                          <span className="text-sm text-gray-500">
                            {finalParticipantCount}{' '}
                            {finalParticipantCount === 1 ? 'deelnemer' : 'deelnemers'}
                          </span>
                        )}
                      </div>
                      <ParticipantList
                        participants={Array.isArray(participants) ? participants : []}
                        tripId={trip.id}
                        isOwner={isOwner}
                        currentUserId={currentUserId}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <ItineraryTab tripId={trip.id} days={days} isOwner={isOwner} />
                )}

                {activeTab === 'budget' && (
                  <div className="space-y-6">
                    {activitiesBudget !== null && (
                      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                          Budget voor deze reis
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">
                          € {activitiesBudget.toFixed(2)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Dit is je totale budget voor activiteiten en uitgaven tijdens deze reis.
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="mb-4 text-gray-600">
                        {activitiesBudget !== null
                          ? 'Bekijk alle uitgaven en voeg nieuwe toe op de budget pagina'
                          : 'Begin met het bijhouden van je reiskosten'}
                      </p>
                      <Link
                        href={`/budget?trip=${trip.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-sky-700"
                      >
                        <svg
                          className="h-5 w-5"
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
                        Beheer Budget
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'packing' && (
                  <PackingTabContent
                    tripId={trip.id}
                    categories={packingCategories}
                    items={packingItems}
                    isGuest={isGuest}
                    guestSessionId={guestSessionId}
                    currentUserName={
                      participants.find((p: any) => p.user_id === currentUserId)?.guest_name || ''
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">
                Reis Details
              </h3>
              <div className="space-y-3 sm:space-y-5">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                      <svg
                        className="h-4 w-4 text-primary sm:h-5 sm:w-5"
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
                    <span className="text-sm font-medium text-gray-700 sm:text-base">Duur</span>
                  </div>
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    {tripDuration} dagen
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                      <svg
                        className="h-4 w-4 text-primary sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 sm:text-base">
                      Deelnemers
                    </span>
                  </div>
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    {finalParticipantCount || 1}
                  </span>
                </div>
                {activitiesBudget !== null && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 sm:h-10 sm:w-10">
                        <svg
                          className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5"
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
                      <span className="text-sm font-medium text-gray-700 sm:text-base">Budget</span>
                    </div>
                    <span className="text-base font-bold text-emerald-600 sm:text-lg">
                      € {activitiesBudget}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-gray-900">Snelle Acties</h3>
              <div className="space-y-3">
                <Link
                  href={`/budget?trip=${trip.id}`}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Beheer Budget
                </Link>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Deel Reis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Share Trip Modal */}
      <ShareTripModal
        tripId={trip.id}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
