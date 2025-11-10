'use client';

import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { archiveTrip, deleteTrip, duplicateTrip, updateTrip } from '../../actions';

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
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        setError(null);
        setSuccess(null);
        await updateTrip(trip.id, formData);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href={`/trips/${trip.id}`}
              className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Terug</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {isPending ? 'Opslaan...' : 'Wijzigingen Opslaan'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Reis Bewerken</h1>
          <p className="text-lg text-gray-600">Pas de details van je reis aan</p>
        </div>

        <div className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <svg
                className="h-5 w-5 text-red-600"
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
          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">Basis Informatie</h2>

              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Bestemming <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="destination"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Van <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Tot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Beschrijving
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </form>

          {/* Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Acties</h2>
            <div className="space-y-3">
              <button
                onClick={handleDuplicate}
                disabled={isPending}
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 transition-colors group-hover:bg-sky-200">
                    <svg
                      className="h-5 w-5 text-sky-600"
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
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Dupliceren</p>
                    <p className="text-sm text-gray-500">Maak een kopie van deze reis</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </button>

              <button
                onClick={handleArchive}
                disabled={isPending}
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 transition-colors group-hover:bg-amber-200">
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
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Archiveren</p>
                    <p className="text-sm text-gray-500">Verberg deze reis uit je lijst</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </button>

              <button
                onClick={handleDelete}
                disabled={isPending}
                className="group flex w-full items-center justify-between rounded-lg border border-red-200 p-4 transition-all hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 transition-colors group-hover:bg-red-200">
                    <svg
                      className="h-5 w-5 text-red-600"
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
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-red-600">Verwijderen</p>
                    <p className="text-sm text-red-500">Permanent verwijderen (niet omkeerbaar)</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-red-400"
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
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
