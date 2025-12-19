'use client';

/**
 * Packing Category Component - Een categorie met items
 */

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addItem, deleteCategory } from './actions';
import PackingItem from './PackingItem';

interface PackingCategoryProps {
  category: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    name: string;
    checked: boolean;
    taken_by: string | null;
  }>;
  tripId: string;
  currentUserName?: string;
}

export default function PackingCategory({
  category,
  items: initialItems,
  tripId,
  currentUserName,
}: PackingCategoryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Optimistic UI: local state voor items
  const [localItems, setLocalItems] = useState(initialItems);

  // Sync local items with initial items when they change (from router.refresh)
  // Only update if there are no temporary items (optimistic updates)
  useEffect(() => {
    const hasTempItems = localItems.some((item) => item.id.startsWith('temp-'));
    if (!hasTempItems && JSON.stringify(localItems) !== JSON.stringify(initialItems)) {
      setLocalItems(initialItems);
    }
  }, [initialItems]);

  // Use local items for display (optimistic updates)
  const items = localItems;
  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsAdding(true);
    setError(null);

    // Save current state for rollback
    const previousItems = [...localItems];
    const itemName = newItemName.trim();

    // Optimistic update: voeg item direct toe aan UI
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      name: itemName,
      checked: false,
      taken_by: null,
    };
    setLocalItems([...previousItems, optimisticItem]);
    setNewItemName('');
    setShowAddItem(false);

    try {
      const formData = new FormData();
      formData.append('category_id', category.id);
      formData.append('trip_id', tripId);
      formData.append('name', itemName);

      const result = await addItem(formData);

      if (result?.error) {
        // Rollback optimistic update bij error
        setLocalItems(previousItems);
        setError(result.error);
        setShowAddItem(true);
        setNewItemName(itemName);
      } else {
        // Refresh data in background (zonder blocking)
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      // Rollback optimistic update bij error
      setLocalItems(previousItems);
      console.error('❌ Unexpected error:', err);
      setError('Er ging iets mis. Probeer opnieuw.');
      setShowAddItem(true);
      setNewItemName(itemName);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (
      confirm(
        `Weet je zeker dat je de categorie "${category.name}" wilt verwijderen? Alle items worden ook verwijderd.`
      )
    ) {
      startTransition(async () => {
        await deleteCategory(category.id);
        router.refresh();
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Category Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              {checkedCount} / {totalCount}
            </span>
            <button
              onClick={handleDeleteCategory}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
              title="Categorie verwijderen"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2 p-4">
        {items.length === 0 && !showAddItem && (
          <p className="py-4 text-center text-sm text-gray-400">Nog geen items in deze categorie</p>
        )}

        {items
          .filter((item) => item.name && item.name.trim().length > 0) // Filter out deleted items (optimistic update)
          .map((item) => (
            <PackingItem key={item.id} item={item} currentUserName={currentUserName} />
          ))}

        {/* Add Item Form */}
        {showAddItem ? (
          <div>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item naam..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none disabled:bg-gray-100"
                autoFocus
                disabled={isAdding}
              />
              <button
                type="submit"
                disabled={isAdding || !newItemName.trim()}
                className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Toevoegen...</span>
                  </>
                ) : (
                  'Toevoegen'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddItem(false);
                  setNewItemName('');
                  setError(null);
                }}
                disabled={isAdding}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuleren
              </button>
            </form>
            {error && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <p className="font-semibold">❌ {error}</p>
                <p className="mt-1 text-xs">Tip: Zorg dat de database migratie is uitgevoerd.</p>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-pink-400 hover:text-pink-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Item toevoegen
          </button>
        )}
      </div>
    </div>
  );
}
