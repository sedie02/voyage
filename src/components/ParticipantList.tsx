'use client';

import { removeParticipant } from '@/app/trips/[id]/participants/actions';
import { useState, useTransition } from 'react';

interface Participant {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  role: string;
}

interface ParticipantListProps {
  participants: Participant[];
  tripId: string;
  isOwner: boolean;
  currentUserId?: string;
}

export default function ParticipantList({
  participants,
  tripId,
  isOwner,
  currentUserId,
}: ParticipantListProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRemove = (participantId: string) => {
    if (!confirm('Weet je zeker dat je deze deelnemer wilt verwijderen?')) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await removeParticipant(tripId, participantId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis');
      }
    });
  };

  const getParticipantDisplay = (participant: Participant) => {
    // For owner, always show email with (planner)
    if (participant.role === 'owner') {
      const email =
        participant.guest_email && participant.guest_email !== 'email@onbekend.nl'
          ? participant.guest_email
          : participant.user_id
            ? participant.user_id.substring(0, 8) + '...@email.nl'
            : 'email@onbekend.nl';
      return `${email} (planner)`;
    }

    // For viewers/others, prefer name over email
    if (
      participant.guest_name &&
      participant.guest_name !== 'Onbekend' &&
      participant.guest_name !== participant.guest_email
    ) {
      return participant.guest_name;
    }

    // If no name, use email
    if (participant.guest_email && participant.guest_email !== 'email@onbekend.nl') {
      return participant.guest_email;
    }

    // Last resort
    if (participant.user_id && participant.user_id === currentUserId) {
      return 'Jij';
    }

    return 'Onbekend';
  };

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <p className="mt-2 text-sm text-gray-600">Nog geen deelnemers toegevoegd</p>
        {isOwner && (
          <p className="mt-1 text-xs text-gray-500">Deel je trip om deelnemers toe te voegen</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{getParticipantDisplay(participant)}</p>
                <p className="text-xs capitalize text-gray-500">{participant.role}</p>
              </div>
            </div>
            {isOwner && participant.user_id !== currentUserId && participant.role !== 'owner' && (
              <button
                onClick={() => handleRemove(participant.id)}
                disabled={isPending}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                title="Verwijder deelnemer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
