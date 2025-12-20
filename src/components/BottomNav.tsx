'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [hasTrips, setHasTrips] = useState(true);

  useEffect(() => {
    // Check if user has trips
    const checkTrips = async () => {
      try {
        const response = await fetch('/api/trips/check');
        const data = await response.json();
        setHasTrips(data.hasTrips);
      } catch (error) {
        console.error('Error checking trips:', error);
      }
    };
    checkTrips();
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/trips') {
      return pathname === '/trips' || pathname?.startsWith('/trips/');
    }
    return pathname === path;
  };

  // If no trips and not on new trip page, redirect to new trip
  const getNavLink = (path: string) => {
    if (!hasTrips && path !== '/trips/new' && pathname !== '/trips/new') {
      return '/trips/new';
    }
    return path;
  };

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface"
      aria-label="Hoofdnavigatie"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
        <Link
          href={getNavLink('/trips')}
          className={`flex flex-col items-center gap-1 rounded-full px-4 py-2.5 transition-all duration-200 sm:px-6 ${
            isActive('/trips') ? 'bg-primary-50 text-primary' : 'text-text-muted hover:text-text'
          }`}
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs font-semibold">Plan</span>
        </Link>

        <Link
          href={getNavLink('/budget')}
          className={`flex flex-col items-center gap-1 rounded-full px-4 py-2.5 transition-all duration-200 sm:px-6 ${
            isActive('/budget') ? 'bg-primary-50 text-primary' : 'text-text-muted hover:text-text'
          }`}
        >
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-semibold">Budget</span>
        </Link>

        <Link
          href="/trips/new"
          className="-mt-6 flex flex-col items-center"
          aria-label="Nieuwe trip aanmaken"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary-hover sm:h-14 sm:w-14">
            <svg
              className="h-6 w-6 text-white sm:h-7 sm:w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </Link>

        <Link
          href={getNavLink('/packing')}
          className={`flex flex-col items-center gap-1 rounded-full px-4 py-2.5 transition-all duration-200 sm:px-6 ${
            isActive('/packing') ? 'bg-primary-50 text-primary' : 'text-text-muted hover:text-text'
          }`}
        >
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-xs font-semibold">Pack</span>
        </Link>

        <Link
          href={getNavLink('/discover')}
          className={`flex flex-col items-center gap-1 rounded-full px-4 py-2.5 transition-all duration-200 sm:px-6 ${
            isActive('/discover') ? 'bg-primary-50 text-primary' : 'text-text-muted hover:text-text'
          }`}
        >
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
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <span className="hidden text-xs font-semibold sm:inline">Ontdek</span>
        </Link>
      </div>
    </nav>
  );
}
