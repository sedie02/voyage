'use client';

import { initializeDefaultCategories } from '@/app/packing/init-categories-action';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface InitCategoriesButtonProps {
  tripId: string;
}

export default function InitCategoriesButton({ tripId }: InitCategoriesButtonProps) {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const handleInitializeCategories = async () => {
    setIsInitializing(true);
    setInitError(null);

    try {
      const result = await initializeDefaultCategories(tripId);

      if (result.success) {
        // Force immediate refresh - multiple strategies for reliability
        router.refresh();
        // Also try to reload after a short delay to ensure data is visible
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        setInitError(result.error || 'Onbekende fout');
        setIsInitializing(false);
      }
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      setInitError((err.message as string) || 'Onbekende fout');
      setIsInitializing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white p-12 text-center shadow-xl">
      <svg
        className="mx-auto mb-4 h-16 w-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 className="mb-2 text-xl font-bold text-gray-900">Geen categorieën</h3>
      <p className="mb-6 text-sm text-gray-600">
        Klik hier om te starten met standaard categorieën aanmaken
      </p>

      <button
        onClick={handleInitializeCategories}
        disabled={isInitializing}
        className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isInitializing ? (
          <>
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Categorieën Aanmaken...</span>
          </>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Klik Hier om te Starten! ✨</span>
          </>
        )}
      </button>

      {initError && (
        <div className="mt-6 rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <p className="mb-2 text-sm font-bold text-red-900">❌ Fout bij aanmaken</p>
          <p className="mb-3 text-xs text-red-800">{initError}</p>
        </div>
      )}
    </div>
  );
}
