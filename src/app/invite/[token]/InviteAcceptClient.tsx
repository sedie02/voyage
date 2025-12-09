'use client';

import { acceptInvite } from '@/app/trips/[id]/invite/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface InviteAcceptClientProps {
  token: string;
  trip: any;
  isAuthenticated: boolean;
  userEmail?: string;
  guestSessionId?: string;
}

export default function InviteAcceptClient({
  token,
  trip,
  isAuthenticated,
  userEmail,
  guestSessionId,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(isAuthenticated ? userEmail || '' : '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAccept = () => {
    if (!name.trim()) {
      setError('Voer je naam in');
      return;
    }

    if (!isAuthenticated && !email.trim()) {
      setError('Voer je e-mailadres in');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await acceptInvite(token, name, email, guestSessionId);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push(`/trips/${result.tripId}`);
          }, 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Er ging iets mis bij het accepteren van de uitnodiging'
        );
      }
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Uitnodiging geaccepteerd!</h1>
          <p className="text-gray-600">Je wordt doorgestuurd naar de trip pagina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Je bent uitgenodigd!</h1>
          <p className="text-gray-600">
            Neem deel aan de trip: <span className="font-semibold text-gray-900">{trip.title}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Je naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voer je naam in"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {!isAuthenticated && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                E-mailadres <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voer@jouw-email.nl"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? 'Bezig...' : 'Deelnemen aan Trip'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Door deel te nemen ga je akkoord met de uitnodiging voor deze trip.
          </p>
        </div>
      </div>
    </div>
  );
}
