import { getCityPhotoUrl } from '@/lib/external/places';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TripDetailClient from './TripDetailClient';

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch trip data
  const { data: trip, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      trip_participants(count)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !trip) {
    notFound();
  }

  // Calculate days until departure
  const startDate = new Date(trip.start_date);
  const today = new Date();
  const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Use cached photo, or fetch if missing
  const cityPhotoUrl = trip.city_photo_url || (await getCityPhotoUrl(trip.destination));

  return <TripDetailClient trip={{ ...trip, cityPhotoUrl }} daysUntil={daysUntil} />;
}
