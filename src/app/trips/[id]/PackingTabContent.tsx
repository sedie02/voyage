'use client';

import { addItem, deleteItem, toggleItemChecked } from '@/app/packing/actions';
import { initializeDefaultCategories } from '@/app/packing/init-categories-action';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
const DEFAULT_CATEGORIES = [
  { name: 'Kleding', icon: '👕', color: 'blue' },
  { name: 'Toiletartikelen', icon: '🧴', color: 'pink' },
  { name: 'Elektronica', icon: '🔌', color: 'purple' },
  { name: 'Documenten', icon: '📄', color: 'yellow' },
  { name: 'Medicijnen', icon: '💊', color: 'red' },
  { name: 'Overig', icon: '📦', color: 'gray' },
];

interface PackingTabProps {
  tripId: string;
  categories: any[];
  items: any[];
  currentUserName?: string;
}

function PackingTabContent({ tripId, categories, items, currentUserName }: PackingTabProps) {
  const router = useRouter();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const totalItems = items.length;
  const checkedItems = items.filter((item) => item.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Auto-select first category when modal opens
  useEffect(() => {
    if (isAddingItem && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [isAddingItem, categories, selectedCategory]);

  const handleInitializeCategories = async () => {
    setIsInitializing(true);
    setInitError(null);

    try {
      const result = await initializeDefaultCategories(tripId);

      if (result.success) {
        router.refresh();
      } else {
        setInitError(result.error || 'Onbekende fout');
      }
    } catch (error: any) {
      setInitError(error.message || 'Onbekende fout');
    } finally {
      setIsInitializing(false);
    }
  };

  // (debug export moved to module scope)

  const handleQuickAddItem = async () => {
    if (!newItemText.trim() || !selectedCategory) {
      return;
    }

    const formData = new FormData();
    formData.append('category_id', selectedCategory);
    formData.append('trip_id', tripId);
    formData.append('name', newItemText.trim());

    const result = await addItem(formData);

    if (result?.error) {
      alert('Fout bij toevoegen: ' + result.error);
    } else {
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const handleToggleCheck = async (itemId: string, checked: boolean) => {
    await toggleItemChecked(itemId, checked);
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
  };

  return (
    <div className="relative space-y-6">
      {/* Progress Header - Clean & Minimal */}
      {totalItems > 0 && (
        <div className="sticky top-0 z-10 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voortgang</p>
              <p className="text-2xl font-bold text-gray-900">
                {checkedItems} / {totalItems}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-3xl font-bold text-pink-600">{progress}%</p>
              </div>
              <div className="h-16 w-16">
                <svg className="h-16 w-16 -rotate-90 transform">
                  <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#ec4899"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Grouped by Category - Modern Cards */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.category_id === category.id);
          const catChecked = categoryItems.filter((i) => i.checked).length;
          const catTotal = categoryItems.length;
          const defaultCat = DEFAULT_CATEGORIES.find((c) => c.name === category.name);

          return (
            <div
              key={category.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Category Header - Compact */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{defaultCat?.icon || '📦'}</span>
                    <h3 className="text-base font-bold text-gray-900">{category.name}</h3>
                    {catTotal > 0 && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {catChecked}/{catTotal}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsAddingItem(true);
                    }}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-pink-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Items List - Clean */}
              <div className="divide-y divide-gray-100">
                {categoryItems.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-400">Geen items</p>
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleCheck(item.id, item.checked)}
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                          item.checked
                            ? 'border-pink-500 bg-pink-500'
                            : 'border-gray-300 hover:border-pink-400'
                        }`}
                      >
                        {item.checked && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Item Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                        >
                          {item.name}
                        </p>
                        {item.taken_by && (
                          <p className="text-xs text-pink-600">
                            <span className="font-semibold">✓</span> {item.taken_by}
                          </p>
                        )}
                      </div>

                      {/* Actions - Hidden until hover */}
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Verwijderen"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add - Modern FAB (Floating Action Button) */}
      {!isAddingItem && (
        <button
          onClick={() => setIsAddingItem(true)}
          className="fixed bottom-24 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-pink-600 text-white shadow-2xl transition-all hover:scale-110 hover:bg-pink-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Quick Add Modal - Modern */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Nieuw Item</h3>

            {/* Category Picker */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Categorie</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const defaultCat = DEFAULT_CATEGORIES.find((c) => c.name === cat.name);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all ${
                        selectedCategory === cat.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <span className="text-2xl">{defaultCat?.icon || '📦'}</span>
                      <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Item naam</label>
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickAddItem();
                  if (e.key === 'Escape') setIsAddingItem(false);
                }}
                placeholder="Bijv. T-shirts, Tandenborstel..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingItem(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleQuickAddItem}
                disabled={!newItemText.trim() || !selectedCategory}
                className="flex-1 rounded-lg bg-pink-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Beautiful */}
      {totalItems === 0 && categories.length > 0 && !isAddingItem && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <svg
              className="h-8 w-8 text-pink-600"
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
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Packinglist is leeg</h3>
          <p className="mb-6 text-gray-600">Begin met het toevoegen van items</p>
          <button
            onClick={() => setIsAddingItem(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Eerste Item Toevoegen
          </button>
        </div>
      )}

      {/* No Categories - Auto-Fix Button! */}
      {categories.length === 0 && (
        <div className="rounded-2xl border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <svg
              className="h-10 w-10 text-pink-600"
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
          </div>

          <h3 className="mb-3 text-2xl font-bold text-gray-900">Eerste Keer? 🎉</h3>
          <p className="mb-6 text-base leading-relaxed text-gray-700">
            Laten we eerst de <strong>standaard categorieën</strong> aanmaken!
            <br />
            <span className="text-sm text-gray-600">
              (👕 Kleding, 🧴 Toiletartikelen, 🔌 Elektronica, 📄 Documenten, 💊 Medicijnen, 📦
              Overig)
            </span>
          </p>

          {/* Big Fix Button */}
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

          {/* Error Message */}
          {initError && (
            <div className="mt-6 rounded-xl border-2 border-red-300 bg-red-50 p-4">
              <p className="mb-2 text-sm font-bold text-red-900">❌ Fout bij aanmaken</p>
              <p className="mb-3 text-xs text-red-800">{initError}</p>

              {initError.includes('RLS') && (
                <div className="rounded-lg border border-red-200 bg-white p-3 text-left">
                  <p className="mb-2 text-xs font-bold text-gray-900">🔧 Manual Fix (Supabase):</p>
                  <code className="block rounded bg-gray-100 p-2 text-xs">
                    ALTER TABLE packing_categories DISABLE ROW LEVEL SECURITY;
                  </code>
                  <p className="mt-2 text-xs text-gray-600">
                    Run dit in Supabase SQL Editor, dan opnieuw proberen
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Alternative Manual Fix */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900">
              ⚙️ Werkt de knop niet? Klik hier voor manual fix
            </summary>
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 text-left">
              <p className="mb-2 text-xs font-bold text-gray-900">
                📝 Run dit in Supabase SQL Editor:
              </p>
              <code className="block overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                {`INSERT INTO packing_categories (trip_id, name, order_index) VALUES
  ('${tripId}', 'Kleding', 0),
  ('${tripId}', 'Toiletartikelen', 1),
  ('${tripId}', 'Elektronica', 2),
  ('${tripId}', 'Documenten', 3),
  ('${tripId}', 'Medicijnen', 4),
  ('${tripId}', 'Overig', 5);`}
              </code>
              <p className="mt-2 text-xs text-gray-600">
                Daarna deze pagina refreshen (Cmd+R / Ctrl+R)
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

// Debug: confirm exported type at module load
// This will print when the module is imported so we can verify it's a function
console.log('DEBUG: PackingTabContent module loaded, typeof export:', typeof PackingTabContent);

export default PackingTabContent;
