'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppHeader() {
  const pathname = usePathname();
  const [firstTripId, setFirstTripId] = useState<string | null>(null);
  const isCurrent = (p: string) => pathname === p || pathname?.startsWith(`${p}/`);

  // Extract trip ID from pathname if we're on a trip detail page
  const tripIdMatch = pathname?.match(new RegExp('^/trips/([^/]+)$'));
  const currentTripId = tripIdMatch ? tripIdMatch[1] : null;

  useEffect(() => {
    // Get first trip ID for Pack button navigation
    const fetchFirstTripId = async () => {
      try {
        const response = await fetch('/api/trips/check');
        const data = await response.json();
        setFirstTripId(data.firstTripId || null);
      } catch (error) {
        console.error('Error fetching first trip ID:', error);
      }
    };
    fetchFirstTripId();
  }, [pathname]);

  // Determine Pack button href
  const packHref = currentTripId
    ? `/trips/${currentTripId}?tab=packing`
    : firstTripId
      ? `/trips/${firstTripId}?tab=packing`
      : '/packing';

  const navItems = [
    { href: '/trips', label: 'Plan' },
    { href: '/budget', label: 'Budget' },
    {
      href: packHref,
      label: 'Pack',
    },
    { href: '/discover', label: 'Ontdek' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-text">voyage</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Hoofdnavigatie">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                isCurrent('/trips') && item.label === 'Pack'
                  ? 'bg-primary-50 text-primary'
                  : isCurrent(item.href)
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-muted hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Link
            href="/trips"
            className="hidden text-sm font-semibold text-text-muted transition-colors hover:text-text sm:inline"
          >
            Mijn Reizen
          </Link>
          <Link
            href="/trips/new"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Plan je Reis
          </Link>
        </div>
      </div>
    </header>
  );
}
