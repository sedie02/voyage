'use client';

import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useState } from 'react';

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
}

export default function TripDetailClient({ trip, daysUntil }: TripDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const participantCount = trip.trip_participants?.[0]?.count || 0;
  const tripDuration = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const gradient = getDestinationGradient(trip.destination);
  const activitiesBudget =
    typeof trip.activities_budget === 'number' ? trip.activities_budget : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {/* City photo with better fallback */}
        <div className="absolute inset-0">
          {/* Fallback gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
          {/* City photo */}
          {(trip as any).cityPhotoUrl && (
            <img
              src={(trip as any).cityPhotoUrl}
              alt={trip.destination}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Navigation controls */}
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between sm:left-6 sm:right-6">
          <Link
            href="/trips"
            className="group inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
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
            className="group inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
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
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="text-white">
            <h1 className="mb-4 text-5xl font-bold drop-shadow-lg md:text-6xl">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/95">
              <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="text-lg font-semibold">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-lg font-semibold">{tripDuration} dagen</span>
              </div>
              {activitiesBudget !== null && (
                <div className="flex items-center gap-3 rounded-full bg-emerald-500/80 px-4 py-2 backdrop-blur-sm">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg font-bold">€ {activitiesBudget}</span>
                </div>
              )}
              {participantCount > 0 && (
                <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-lg font-semibold">
                    {participantCount} {participantCount === 1 ? 'deelnemer' : 'deelnemers'}
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
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-lg font-semibold">Je reis begint over {daysUntil} dagen!</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'overview', label: 'Overzicht', icon: '📋' },
                  { id: 'itinerary', label: 'Planning', icon: '🗓️' },
                  { id: 'budget', label: 'Budget', icon: '💰' },
                  { id: 'packing', label: 'Inpaklijst', icon: '🎒' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex-1 border-b-2 px-6 py-5 text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg transition-transform group-hover:scale-110">
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-lg font-bold text-gray-900">Over deze reis</h3>
                      <p className="leading-relaxed text-gray-600">
                        {trip.description || 'Nog geen beschrijving toegevoegd.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                      <div>
                        <p className="mb-1 text-sm text-gray-500">Vertrek</p>
                        <p className="font-semibold text-gray-900">{formatDate(trip.start_date)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-500">Terugkeer</p>
                        <p className="font-semibold text-gray-900">{formatDate(trip.end_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
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
                    <p className="mb-4 text-gray-600">Begin met het toevoegen van activiteiten</p>
                    <button className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-sky-700">
                      Voeg Activiteit Toe
                    </button>
                  </div>
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Inpaklijst is leeg</h3>
                    <p className="mb-4 text-gray-600">Maak een lijst van wat je wilt meenemen</p>
                    <button className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-sky-700">
                      Voeg Item Toe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-gray-900">Reis Details</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="h-5 w-5 text-primary"
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
                    <span className="font-medium text-gray-700">Duur</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{tripDuration} dagen</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="h-5 w-5 text-primary"
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
                    <span className="font-medium text-gray-700">Deelnemers</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{participantCount || 1}</span>
                </div>
                {activitiesBudget !== null && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <svg
                          className="h-5 w-5 text-emerald-600"
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
                      <span className="font-medium text-gray-700">Budget</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">€ {activitiesBudget}</span>
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
                <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200">
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
    </div>
  );
}
