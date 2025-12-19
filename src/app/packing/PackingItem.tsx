'use client';

/**
 * Packing Item Component - Client Component voor interactieve item
 */

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteItem, takeItem, toggleItemChecked, untakeItem } from './actions';

interface PackingItemProps {
  item: {
    id: string;
    name: string;
    checked: boolean;
    taken_by: string | null;
  };
  currentUserName?: string;
}

export default function PackingItem({ item: initialItem, currentUserName }: PackingItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [userName, setUserName] = useState(currentUserName || '');

  // Optimistic UI: local state voor item
  const [item, setItem] = useState(initialItem);

  const handleCheck = async () => {
    // Optimistic update: toggle direct in UI
    const newChecked = !item.checked;
    setItem({ ...item, checked: newChecked });

    try {
      const result = await toggleItemChecked(item.id, item.checked);
      if (result?.error) {
        // Rollback bij error
        setItem(initialItem);
        alert(result.error);
      } else {
        // Refresh in background
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      // Rollback bij error
      setItem(initialItem);
      console.error('Error toggling item:', err);
    }
  };

  const handleTake = async () => {
    if (!userName.trim()) {
      alert('Vul je naam in');
      return;
    }

    // Optimistic update
    setItem({ ...item, taken_by: userName.trim() });
    setShowTakeModal(false);

    try {
      const result = await takeItem(item.id, userName.trim());
      if (result?.error) {
        // Rollback bij error
        setItem(initialItem);
        alert(result.error);
        setShowTakeModal(true);
      } else {
        // Refresh in background
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      // Rollback bij error
      setItem(initialItem);
      setShowTakeModal(true);
      console.error('Error taking item:', err);
    }
  };

  const handleUntake = async () => {
    // Optimistic update
    setItem({ ...item, taken_by: null });

    try {
      const result = await untakeItem(item.id);
      if (result?.error) {
        // Rollback bij error
        setItem(initialItem);
        alert(result.error);
      } else {
        // Refresh in background
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      // Rollback bij error
      setItem(initialItem);
      console.error('Error untaking item:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      return;
    }

    // Optimistic update: hide item immediately
    const previousItem = item;
    setItem({ ...item, name: '', checked: false }); // Hide visually

    try {
      const result = await deleteItem(item.id);
      if (result?.error) {
        // Rollback bij error
        setItem(previousItem);
        alert(result.error);
      } else {
        // Refresh in background
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      // Rollback bij error
      setItem(previousItem);
      console.error('Error deleting item:', err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 transition-all hover:bg-white/80">
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            item.checked
              ? 'border-pink-500 bg-pink-500'
              : 'border-gray-300 bg-white hover:border-pink-400'
          }`}
        >
          {item.checked && (
            <svg
              className="h-4 w-4 text-white"
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

        {/* Item naam */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}
          >
            {item.name}
          </p>
          {item.taken_by && (
            <p className="text-xs text-pink-600">
              <span className="font-semibold">✓</span> {item.taken_by} neemt mee
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Take/Untake button */}
          {item.taken_by ? (
            <button
              onClick={handleUntake}
              className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 transition-colors hover:bg-pink-200"
              title="Vrijgeven"
            >
              Vrijgeven
            </button>
          ) : (
            <button
              onClick={() => setShowTakeModal(true)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              title="Ik neem dit mee"
            >
              Neem mee
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Verwijderen"
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

      {/* Take Modal */}
      {showTakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Ik neem dit mee</h3>
            <p className="mb-4 text-sm text-gray-600">Wie neemt &quot;{item.name}&quot; mee?</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Vul je naam in"
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTake();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTakeModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleTake}
                className="flex-1 rounded-lg bg-pink-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
              >
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
