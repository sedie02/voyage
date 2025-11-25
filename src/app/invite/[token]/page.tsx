import { createClient } from '@/lib/supabase/server';
import InviteAcceptClient from './InviteAcceptClient';

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try to find the invite link
  const { data: inviteLink, error: inviteError } = await supabase
    .from('invite_links')
    .select('*, trips(*)')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  // If invite_links table doesn't exist, show error
  if (inviteError && inviteError.message.includes('does not exist')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
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
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Uitnodigingslink niet beschikbaar
          </h1>
          <p className="text-gray-600">
            Deze functie is nog niet geactiveerd. Neem contact op met de planner van deze trip.
          </p>
        </div>
      </div>
    );
  }

  if (inviteError || !inviteLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
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
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Uitnodigingslink niet gevonden</h1>
          <p className="text-gray-600">
            Deze uitnodigingslink is ongeldig, verlopen of is al gebruikt.
          </p>
        </div>
      </div>
    );
  }

  // Check if invite is expired
  if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
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
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Link verlopen</h1>
          <p className="text-gray-600">Deze uitnodigingslink is verlopen.</p>
        </div>
      </div>
    );
  }

  // Check if max uses reached
  if (
    inviteLink.max_uses &&
    inviteLink.use_count !== null &&
    inviteLink.use_count >= inviteLink.max_uses
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Maximum bereikt</h1>
          <p className="text-gray-600">
            Het maximum aantal deelnemers voor deze uitnodigingslink is bereikt.
          </p>
        </div>
      </div>
    );
  }

  const trip = inviteLink.trips as any;
  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Trip niet gevonden</h1>
        </div>
      </div>
    );
  }

  return (
    <InviteAcceptClient
      token={token}
      trip={trip}
      isAuthenticated={!!user}
      userEmail={user?.email}
    />
  );
}
