'use client';

import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import DatePicker from 'react-datepicker';
import Autocomplete from 'react-google-autocomplete';
import { createTrip } from '../actions';

// Import DatePicker CSS
import 'react-datepicker/dist/react-datepicker.css';

type TripType = 'adventure' | 'beach' | 'culture' | 'nature' | 'mixed';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBRCqv9EXAMPLE';

export default function NewTripPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [typeWarning, setTypeWarning] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const [formData, setFormData] = useState({
    tripTypes: [] as TripType[],
    destination: '',
    city: '',
    country: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    activitiesBudget: '' as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setError('Selecteer alsjeblieft beide datums');
      return;
    }
    const budgetNum = Number(formData.activitiesBudget);
    if (!budgetNum || isNaN(budgetNum) || budgetNum <= 0) {
      setError('Vul een geldig activiteitenbudget in (meer dan 0)');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await createTrip({
          title: formData.destination,
          destination: formData.destination,
          startDate: formData.startDate.toISOString().split('T')[0],
          endDate: formData.endDate.toISOString().split('T')[0],
          tripType: formData.tripTypes[0] || 'mixed',
          activitiesBudget: budgetNum,
        });
      } catch (error) {
        console.error('Error creating trip:', error);
        setError(error instanceof Error ? error.message : 'Er ging iets mis. Probeer opnieuw.');
      }
    });
  };

  const canContinue = () => {
    if (step === 1) return formData.tripTypes.length > 0 && formData.tripTypes.length <= 2;
    if (step === 2) return formData.destination.length > 0;
    if (step === 3) return formData.startDate !== null && formData.endDate !== null;
    if (step === 4) {
      const b = Number(formData.activitiesBudget);
      return !!b && !isNaN(b) && b > 0;
    }
    return false;
  };

  const tripDuration =
    formData.startDate && formData.endDate
      ? Math.ceil(
          (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const toggleType = (t: TripType) => {
    setFormData((prev) => {
      const exists = prev.tripTypes.includes(t);
      if (exists) return { ...prev, tripTypes: prev.tripTypes.filter((x) => x !== t) };
      if (prev.tripTypes.length >= 2) {
        setTypeWarning('Maximaal 2 reis soorten selecteren');
        return prev;
      }
      setTypeWarning(null);
      return { ...prev, tripTypes: [...prev.tripTypes, t] };
    });
  };

  return (
    <div className="min-h-screen bg-bg pb-24" ref={containerRef}>
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <Link
              href="/trips"
              className="text-sm font-semibold text-text-muted transition-colors hover:text-text sm:text-base"
            >
              Annuleren
            </Link>
            <p className="text-sm font-bold text-text sm:text-base">Stap {step} van 4</p>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
        {error && (
          <div className="mb-6 animate-fade-in rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Step 1: Trip Types (max 2) */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-text sm:mb-3 sm:text-3xl md:text-4xl">
                  Wat voor soort reis?
                </h1>
                <p className="text-base text-text-muted sm:text-lg">Kies maximaal 2</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { type: 'adventure', label: 'Avontuur', icon: '🏔️', desc: 'Actie en spanning' },
                  { type: 'beach', label: 'Strand', icon: '🏖️', desc: 'Zon, zee & relax' },
                  { type: 'culture', label: 'Cultuur', icon: '🏛️', desc: 'Musea en historie' },
                  { type: 'nature', label: 'Natuur', icon: '🌲', desc: 'Groen en wandelen' },
                  { type: 'mixed', label: 'Mix', icon: '🎯', desc: 'Van alles wat' },
                ].map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => toggleType(option.type as TripType)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:p-6 ${
                      formData.tripTypes.includes(option.type as TripType)
                        ? 'scale-[1.02] border-primary bg-primary-50 shadow-md'
                        : 'border-border hover:border-primary/30 hover:bg-gray-50 active:scale-95'
                    }`}
                  >
                    <span className="mb-2 block text-3xl sm:text-4xl">{option.icon}</span>
                    <p className="mb-1 text-sm font-bold text-text sm:text-base">{option.label}</p>
                    <p className="text-xs text-text-muted sm:text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>
              {typeWarning && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {typeWarning}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Destination with Google Places */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-text sm:mb-3 sm:text-3xl md:text-4xl">
                  Waar ga je naartoe?
                </h1>
                <p className="text-base text-text-muted sm:text-lg">
                  Zoek je bestemming wereldwijd
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-text">
                  Bestemming <span className="text-primary">*</span>
                </label>
                <Autocomplete
                  apiKey={GOOGLE_MAPS_API_KEY}
                  onPlaceSelected={(place) => {
                    if (place && place.formatted_address) {
                      setFormData({
                        ...formData,
                        destination: place.formatted_address,
                        city:
                          (place as any).address_components?.find((c: any) =>
                            c.types.includes('locality')
                          )?.long_name || '',
                        country:
                          (place as any).address_components?.find((c: any) =>
                            c.types.includes('country')
                          )?.long_name || '',
                      });
                    }
                  }}
                  options={{
                    types: ['(cities)'],
                    fields: ['formatted_address', 'address_components', 'geometry'],
                  }}
                  placeholder="bijv. Barcelona, Spanje"
                  className="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 sm:px-5 sm:py-4 sm:text-base"
                  style={{ width: '100%' }}
                />
                {formData.destination && (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary-50 p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-text sm:text-base">
                        {formData.destination}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Dates */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-text sm:mb-3 sm:text-3xl md:text-4xl">
                  Wanneer ga je?
                </h1>
                <p className="text-base text-text-muted sm:text-lg">Selecteer je reisdata</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-text">
                    Van <span className="text-primary">*</span>
                  </label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date,
                        endDate:
                          formData.endDate && date && date > formData.endDate
                            ? null
                            : formData.endDate,
                      })
                    }
                    minDate={new Date()}
                    dateFormat="EEE dd MMM yyyy"
                    placeholderText="Selecteer startdatum"
                    className="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 sm:px-5 sm:py-4 sm:text-base"
                    wrapperClassName="w-full"
                    calendarClassName="!font-sans"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-text">
                    Tot <span className="text-primary">*</span>
                  </label>
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                    minDate={formData.startDate || new Date()}
                    dateFormat="EEE dd MMM yyyy"
                    placeholderText="Selecteer einddatum"
                    disabled={!formData.startDate}
                    className="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 sm:px-5 sm:py-4 sm:text-base"
                    wrapperClassName="w-full"
                    calendarClassName="!font-sans"
                  />
                </div>
              </div>

              {tripDuration > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary-50 p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary sm:h-14 sm:w-14">
                      <svg
                        className="h-6 w-6 text-white sm:h-7 sm:w-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted sm:text-sm">
                        Reisduur
                      </p>
                      <p className="text-2xl font-bold text-primary sm:text-3xl">
                        {tripDuration} {tripDuration === 1 ? 'dag' : 'dagen'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Activities budget */}
          {step === 4 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-text sm:mb-3 sm:text-3xl md:text-4xl">
                  Budget voor activiteiten
                </h1>
                <p className="text-base text-text-muted sm:text-lg">
                  Wat wil je ongeveer uitgeven in deze periode?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-text">
                    Totale budget (EUR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="bijv. 300"
                    value={formData.activitiesBudget}
                    onChange={(e) => setFormData({ ...formData, activitiesBudget: e.target.value })}
                    className="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 sm:px-5 sm:py-4 sm:text-base"
                  />
                  <p className="mt-2 text-xs text-text-muted">
                    We gebruiken dit straks om je planning aan te passen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-full border-2 border-border px-5 py-3 text-sm font-bold text-text transition-colors hover:bg-gray-50 active:scale-95 sm:px-6 sm:py-4 sm:text-base"
              >
                Terug
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canContinue()}
                className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:px-6 sm:py-4 sm:text-base"
              >
                Volgende
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canContinue() || isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:px-6 sm:py-4 sm:text-base"
              >
                {isPending ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                    <span>Aanmaken...</span>
                  </>
                ) : (
                  'Trip Aanmaken'
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
