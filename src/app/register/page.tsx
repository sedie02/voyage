'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validatie
    if (name && name.length > 100) {
      setError('Naam is te lang (maximaal 100 karakters)');
      return;
    }

    if (!email || !email.trim()) {
      setError('Vul een e-mailadres in');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vul een geldig e-mailadres in');
      return;
    }

    if (email.length > 255) {
      setError('E-mailadres is te lang (maximaal 255 karakters)');
      return;
    }

    if (!password || password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn');
      return;
    }

    if (password.length > 128) {
      setError('Wachtwoord is te lang (maximaal 128 karakters)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || undefined,
          },
          emailRedirectTo: `${window.location.origin}/trips`,
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Registreren mislukt');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is immediately logged in (email confirmation disabled)
        if (data.session) {
          // Direct redirect - user is logged in
          router.push('/trips');
          router.refresh();
        } else {
          // Email confirmation might be required, but try to sign in anyway
          // Sometimes Supabase creates the user but doesn't return a session
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            // If sign in fails, user might need to confirm email
            // But for development, we'll show a helpful message
            if (signInError.message?.includes('Email not confirmed')) {
              setError(
                'Email confirmation is vereist. Schakel dit uit in Supabase Dashboard: Authentication → Settings → Email Auth → Disable "Enable email confirmations"'
              );
            } else {
              setError(signInError.message || 'Probeer direct in te loggen op de login pagina.');
            }
            setLoading(false);
          } else if (signInData.user) {
            // Successfully signed in
            router.push('/trips');
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError('Er ging iets mis bij het registreren');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-16 sm:w-16">
            <svg
              className="h-7 w-7 text-primary sm:h-8 sm:w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-12-3a9 9 0 0118 0v3M9 12a2 2 0 002 2h2a2 2 0 002-2m-6 0V9a6 6 0 1112 0v3M6 12a2 2 0 002 2h2a2 2 0 002-2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Registreren</h1>
          <p className="mt-1.5 text-sm text-gray-600 sm:mt-2 sm:text-base">Maak een nieuw Voyage account aan</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Naam (optioneel)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Jouw naam"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              placeholder="jouw@email.nl"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              maxLength={128}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:py-3"
            />
            <p className="mt-1 text-xs text-gray-500">Minimaal 6 tekens</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Bevestig wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              maxLength={128}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 sm:py-3.5"
          >
            {loading ? 'Registreren...' : 'Account aanmaken'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Al een account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log hier in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
