'use client';

import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { archiveTrip, deleteTrip, duplicateTrip, updateTrip } from '../../actions';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface EditTripClientProps {
  trip: any;
}

export default function EditTripClient({ trip }: EditTripClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: trip.title,
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    description: trip.description || '',
    tripType: trip.travel_style || 'mixed',
    activitiesBudget: trip.activities_budget ? String(trip.activities_budget) : '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validatie
    if (!formData.title || formData.title.trim().length === 0) {
      setError('Vul een titel in');
      return;
    }

    if (!formData.destination || formData.destination.trim().length === 0) {
      setError('Vul een bestemming in');
      return;
    }

    const budgetNum = formData.activitiesBudget ? Number(formData.activitiesBudget) : null;
    if (formData.activitiesBudget && (isNaN(budgetNum!) || budgetNum! <= 0)) {
      setError('Vul een geldig budget in (meer dan 0)');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        setSuccess(null);
        await updateTrip(trip.id, {
          ...formData,
          activitiesBudget: budgetNum || undefined,
        });
        setSuccess('Reis succesvol bijgewerkt!');
        setTimeout(() => {
          router.push(`/trips/${trip.id}`);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update trip');
      }
    });
  };

  const handleArchive = () => {
    if (!confirm('Weet je zeker dat je deze reis wilt archiveren?')) return;

    startTransition(async () => {
      try {
        setError(null);
        await archiveTrip(trip.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to archive trip');
      }
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        setError(null);
        await duplicateTrip(trip.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to duplicate trip');
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        'Weet je zeker dat je deze reis wilt verwijderen? Dit kan niet ongedaan worden gemaakt.'
      )
    )
      return;

    startTransition(async () => {
      try {
        setError(null);
        await deleteTrip(trip.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete trip');
      }
    });
  };

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href={`/trips/${trip.id}`}
              className="group flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
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
              <span>Terug</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Actions Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text"
                  aria-label="Meer acties"
                  aria-expanded={showActionsMenu}
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {showActionsMenu && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-surface shadow-lg">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            handleDuplicate();
                            setShowActionsMenu(false);
                          }}
                          disabled={isPending}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <div className="font-semibold">Dupliceren</div>
                            <div className="text-xs text-text-muted">Maak een kopie</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            handleArchive();
                            setShowActionsMenu(false);
                          }}
                          disabled={isPending}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            className="h-5 w-5 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          <div>
                            <div className="font-semibold">Archiveren</div>
                            <div className="text-xs text-text-muted">Verberg uit lijst</div>
                          </div>
                        </button>

                        <div className="my-1 border-t border-border" />

                        <button
                          onClick={() => {
                            handleDelete();
                            setShowActionsMenu(false);
                          }}
                          disabled={isPending}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <div>
                            <div className="font-semibold">Verwijderen</div>
                            <div className="text-xs text-red-500">Permanent verwijderen</div>
                          </div>
                        </button>
                      </div>
                    </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Opslaan...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Opslaan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text sm:text-4xl">Reis bewerken</h1>
          <p className="text-base text-text-muted">Pas de details van je reis aan</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <svg
              className="h-5 w-5 flex-shrink-0 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-text">Basis informatie</h2>
              <p className="text-sm text-text-muted">De belangrijkste details van je reis</p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="bijv. Zomervakantie Spanje"
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Bestemming <span className="text-red-500">*</span>
                </label>
                {GOOGLE_MAPS_API_KEY ? (
                  <Autocomplete
                    apiKey={GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={(place) => {
                      if (place && place.formatted_address) {
                        setFormData({
                          ...formData,
                          destination: place.formatted_address,
                        });
                        setError(null);
                      }
                    }}
                    options={{
                      types: ['(cities)'],
                      fields: ['formatted_address', 'address_components', 'geometry'],
                    }}
                    placeholder="bijv. Barcelona, Spanje"
                    defaultValue={formData.destination}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ width: '100%' }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      const value = e.target.value.trim();
                      if (value && value !== formData.destination) {
                        setFormData({
                          ...formData,
                          destination: value,
                        });
                        setError(null);
                      }
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    id="destination"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="bijv. Barcelona, Spanje"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Van <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Tot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Beschrijving
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Voeg een beschrijving toe aan je reis..."
                />
              </div>

              <div>
                <label
                  htmlFor="activitiesBudget"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Budget voor activiteiten
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">€</span>
                  <input
                    type="number"
                    id="activitiesBudget"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.activitiesBudget}
                    onChange={(e) => setFormData({ ...formData, activitiesBudget: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 pl-8 text-text transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Optioneel: totale budget voor activiteiten en uitgaven tijdens deze reis
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
