import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditTripClient from './EditTripClient';

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch trip data
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !trip) {
    notFound();
  }

  return <EditTripClient trip={trip} />;
}
