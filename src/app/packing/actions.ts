'use server';

/**
 * Server Actions voor Packing List functionaliteit
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ================================================
// CATEGORY ACTIONS
// ================================================

/**
 * Voeg een nieuwe categorie toe aan een trip
 */
export async function addCategory(formData: FormData) {
  const tripId = formData.get('trip_id') as string;
  const name = formData.get('name') as string;

  if (!tripId || !name) {
    return { error: 'Trip ID en naam zijn verplicht' };
  }

  try {
    const supabase = await createClient();

    // Get current max order_index
    // @ts-ignore - packing_categories table types need to be regenerated after migration
    const { data: categories } = await supabase
      .from('packing_categories')
      .select('order_index')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: false })
      .limit(1);

    const maxOrder = categories && categories.length > 0 ? categories[0].order_index : -1;

    // Insert new category
    // @ts-ignore - packing_categories table types need to be regenerated after migration
    const { error } = await supabase.from('packing_categories').insert({
      trip_id: tripId,
      name: name.trim(),
      order_index: maxOrder + 1,
    });

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding category:', error);
    return { error: error.message || 'Fout bij toevoegen categorie' };
  }
}

/**
 * Verwijder een categorie (en alle items erin)
 */
export async function deleteCategory(categoryId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('packing_categories').delete().eq('id', categoryId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { error: error.message || 'Fout bij verwijderen categorie' };
  }
}

// ================================================
// ITEM ACTIONS
// ================================================

/**
 * Voeg een nieuw item toe aan een categorie
 */
export async function addItem(formData: FormData) {
  const categoryId = formData.get('category_id') as string;
  const tripId = formData.get('trip_id') as string;
  const name = formData.get('name') as string;

  if (!categoryId || !tripId || !name) {
    return { error: 'Categorie ID, Trip ID en naam zijn verplicht' };
  }

  try {
    const supabase = await createClient();

    // Get current max order_index for this category
    // @ts-ignore - packing_items table types need to be regenerated after migration
    const { data: items } = await supabase
      .from('packing_items')
      .select('order_index')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: false })
      .limit(1);

    const maxOrder = items && items.length > 0 ? items[0].order_index : -1;

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert new item
    // @ts-ignore - packing_items table types need to be regenerated after migration
    const { error } = await supabase.from('packing_items').insert({
      category_id: categoryId,
      trip_id: tripId,
      name: name.trim(),
      order_index: maxOrder + 1,
      created_by: user?.id || null,
    });

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding item:', error);
    return { error: error.message || 'Fout bij toevoegen item' };
  }
}

/**
 * Toggle checked status van een item
 */
export async function toggleItemChecked(itemId: string, checked: boolean) {
  try {
    const supabase = await createClient();

    // @ts-ignore - packing_items table types need to be regenerated after migration
    const { error } = await supabase
      .from('packing_items')
      .update({ checked: !checked })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling item:', error);
    return { error: error.message || 'Fout bij wijzigen item' };
  }
}

/**
 * Markeer dat iemand een item meeneemt ("Ik neem dit mee")
 */
export async function takeItem(itemId: string, userName: string) {
  try {
    const supabase = await createClient();

    // @ts-ignore - packing_items table types need to be regenerated after migration
    const { error } = await supabase
      .from('packing_items')
      .update({ taken_by: userName })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error taking item:', error);
    return { error: error.message || 'Fout bij claimen item' };
  }
}

/**
 * Verwijder "taken_by" van een item
 */
export async function untakeItem(itemId: string) {
  try {
    const supabase = await createClient();

    // @ts-ignore - packing_items table types need to be regenerated after migration
    const { error } = await supabase
      .from('packing_items')
      .update({ taken_by: null })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error untaking item:', error);
    return { error: error.message || 'Fout bij vrijgeven item' };
  }
}

/**
 * Verwijder een item
 */
export async function deleteItem(itemId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('packing_items').delete().eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return { error: error.message || 'Fout bij verwijderen item' };
  }
}

/**
 * Guest-friendly: Add a packing item (uses service role to bypass RLS)
 */
export async function addItemAsGuest(
  categoryId: string,
  tripId: string,
  name: string,
  guestName: string
) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const service = createServiceClient();

    // Get current max order_index for this category
    // @ts-ignore
    const { data: items } = await service
      .from('packing_items')
      .select('order_index')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: false })
      .limit(1);

    const maxOrder = items && items.length > 0 ? items[0].order_index : -1;

    // Insert new item with guest info
    // @ts-ignore
    const { error } = await service.from('packing_items').insert({
      category_id: categoryId,
      trip_id: tripId,
      name: name.trim(),
      order_index: maxOrder + 1,
      created_by: null,
      created_by_guest: guestName,
    });

    if (error) throw error;

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error adding item:', error);
    return { error: error.message || 'Fout bij toevoegen item' };
  }
}

/**
 * Guest-friendly: Toggle item checked status (uses service role to bypass RLS)
 */
export async function toggleItemCheckedAsGuest(
  itemId: string,
  checked: boolean,
  guestName: string
) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const service = createServiceClient();

    // Update with checked status and track who checked it
    // @ts-ignore
    const { error } = await service
      .from('packing_items')
      .update({
        checked: !checked,
        checked_by: !checked ? guestName : null,
        checked_at: !checked ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling item:', error);
    return { error: error.message || 'Fout bij wijzigen item' };
  }
}

/**
 * Guest-friendly: Mark item as "taken" by guest (uses service role to bypass RLS)
 */
export async function takeItemAsGuest(itemId: string, guestName: string) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const service = createServiceClient();

    // @ts-ignore
    const { error } = await service
      .from('packing_items')
      .update({
        taken_by: guestName,
        taken_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/packing');
    return { success: true };
  } catch (error: any) {
    console.error('Error taking item:', error);
    return { error: error.message || 'Fout bij wijzigen item' };
  }
}
