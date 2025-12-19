'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getGuestSessionId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function initializeDefaultCategories(tripId: string) {
  const supabase = await createClient();

  // Get user or guest session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestSessionId = user ? null : await getGuestSessionId();

  const defaultCategories = [
    { name: 'Kleding', order_index: 0 },
    { name: 'Toiletartikelen', order_index: 1 },
    { name: 'Elektronica', order_index: 2 },
    { name: 'Documenten', order_index: 3 },
    { name: 'Medicijnen', order_index: 4 },
    { name: 'Overig', order_index: 5 },
  ];

  try {
    // Check if categories already exist
    const { data: existing, error: checkError } = await supabase
      .from('packing_categories')
      .select('id')
      .eq('trip_id', tripId)
      .limit(1);

    if (checkError) {
      // If check fails, try with service client for guests
      if (!user && guestSessionId) {
        const service = createServiceClient();
        const { data: existingService } = await service
          .from('packing_categories')
          .select('id')
          .eq('trip_id', tripId)
          .limit(1);

        if (existingService && existingService.length > 0) {
          revalidatePath(`/trips/${tripId}`);
          return { success: true, message: 'Categorieën bestaan al!' };
        }
      } else {
        return {
          success: false,
          error: `Database error: ${checkError.message}`,
        };
      }
    }

    if (existing && existing.length > 0) {
      revalidatePath(`/trips/${tripId}`);
      return { success: true, message: 'Categorieën bestaan al!' };
    }

    // Try insert with regular client first
    let { data, error: insertError } = await supabase
      .from('packing_categories')
      .insert(
        defaultCategories.map((cat) => ({
          trip_id: tripId,
          name: cat.name,
          order_index: cat.order_index,
        }))
      )
      .select();

    // If insert fails and user is guest, try with service client
    if (insertError && !user && guestSessionId) {
      const service = createServiceClient();
      const result = await service
        .from('packing_categories')
        .insert(
          defaultCategories.map((cat) => ({
            trip_id: tripId,
            name: cat.name,
            order_index: cat.order_index,
          }))
        )
        .select();

      data = result.data;
      insertError = result.error;
    }

    if (insertError) {
      if (insertError.code === '42501' || insertError.message.includes('policy')) {
        return {
          success: false,
          error:
            'RLS Policy Error! Run SQL script in Supabase: ALTER TABLE packing_categories DISABLE ROW LEVEL SECURITY;',
        };
      }

      return {
        success: false,
        error: `Failed to create categories: ${insertError.message}`,
      };
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
      message: `${data?.length || 0} categorieën aangemaakt!`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Onbekende fout',
    };
  }
}
