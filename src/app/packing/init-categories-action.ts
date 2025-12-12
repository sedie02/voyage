'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function initializeDefaultCategories(tripId: string) {
  const supabase = await createClient();

  const defaultCategories = [
    { name: 'Kleding', order_index: 0 },
    { name: 'Toiletartikelen', order_index: 1 },
    { name: 'Elektronica', order_index: 2 },
    { name: 'Documenten', order_index: 3 },
    { name: 'Medicijnen', order_index: 4 },
    { name: 'Overig', order_index: 5 },
  ];

  try {
    // @ts-expect-error - packing_categories types need regeneration
    const { data: existing, error: checkError } = await supabase
      .from('packing_categories')
      .select('id')
      .eq('trip_id', tripId)
      .limit(1);

    if (checkError) {
      return {
        success: false,
        error: `Database error: ${checkError.message}`,
      };
    }

    if (existing && existing.length > 0) {
      revalidatePath(`/trips/${tripId}`);
      return { success: true, message: 'Categorieën bestaan al!' };
    }

    // @ts-expect-error - packing_categories types need regeneration
    const { data, error: insertError } = await supabase
      .from('packing_categories')
      .insert(
        defaultCategories.map((cat) => ({
          trip_id: tripId,
          name: cat.name,
          order_index: cat.order_index,
        }))
      )
      .select();

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
