'use client';

import { createInviteLink } from '@/app/trips/[id]/invite/actions';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

interface ShareTripModalProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareTripModal({ tripId, isOpen, onClose }: ShareTripModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [maxParticipantsInput, setMaxParticipantsInput] = useState('10');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isOpen) {
      checkAuth();
      setInviteLink(null);
      setError(null);
      setCopied(false);
      setMaxParticipants(10);
      setMaxParticipantsInput('10');
    }
  }, [isOpen]);

  const handleCreateInvite = () => {
    if (!isAuthenticated) {
      return; // Should not happen, but just in case
    }

    // Validatie
    const num = Number(maxParticipantsInput);
    if (isNaN(num) || num < 1) {
      setError('Vul een geldig aantal deelnemers in (minimaal 1)');
      return;
    }

    if (num > 10) {
      setError('Maximum aantal deelnemers is 10');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await createInviteLink(tripId, num);
        if (result.success && result.url) {
          setInviteLink(result.url);
          setMaxParticipants(num);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis bij het maken van de link');
      }
    });
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Kon link niet kopiëren. Probeer het handmatig te kopiëren.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:right-4 sm:top-4 sm:p-2"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-4 sm:p-6">
          {isChecking ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : !isAuthenticated ? (
            // Not authenticated - show login prompt
            <div className="space-y-4">
              <div className="text-center">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Account vereist</h2>
                <p className="text-gray-600">
                  Om je trip te delen met anderen, hebben we een account nodig. Zo kunnen we:
                </p>
              </div>

              <div className="space-y-2 rounded-lg bg-sky-50 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
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
                  <p className="text-sm text-gray-700">
                    Je trip veilig opslaan en koppelen aan je account
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
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
                  <p className="text-sm text-gray-700">
                    Zorgen dat je je trip niet kwijtraakt wanneer je op een ander apparaat inlogt
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
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
                  <p className="text-sm text-gray-700">
                    Deelnemers beheren en uitnodigingslinks maken
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg border border-primary bg-white px-6 py-3 text-center font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Registreren
                </Link>
              </div>
            </div>
          ) : (
            // Authenticated - show invite creation
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h2 className="mb-1.5 text-xl font-bold text-gray-900 sm:mb-2 sm:text-2xl">Deel je Trip</h2>
                <p className="text-sm text-gray-600 sm:text-base">
                  Maak een uitnodigingslink om anderen uit te nodigen voor deze trip
                </p>
              </div>

              {!inviteLink ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Maximum aantal deelnemers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={maxParticipantsInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Alleen nummers toestaan
                        if (value === '' || /^\d+$/.test(value)) {
                          setMaxParticipantsInput(value);
                          setError(null);
                        }
                      }}
                      onBlur={(e) => {
                        const num = Number(e.target.value);
                        if (isNaN(num) || num < 1) {
                          setMaxParticipantsInput('1');
                        } else if (num > 10) {
                          setMaxParticipantsInput('10');
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-gray-500">
                      Hoeveel mensen kunnen deze link gebruiken om deel te nemen (maximaal 10)
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCreateInvite}
                    disabled={isPending}
                    className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isPending ? 'Link aanmaken...' : 'Maak Uitnodigingslink'}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Uitnodigingslink
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                      >
                        {copied ? '✓ Gekopieerd' : 'Kopieer'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Deel deze link met anderen. Ze kunnen direct deelnemen aan je trip.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Uitnodigingslink aangemaakt!
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      Maximaal {maxParticipants} {maxParticipants === 1 ? 'persoon' : 'personen'}{' '}
                      kunnen deze link gebruiken
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Sluiten
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
