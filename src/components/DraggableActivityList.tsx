'use client';

import { updateActivityOrder } from '@/app/trips/[id]/itinerary/actions';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState, useTransition } from 'react';
import ActivityCard from './ActivityCard';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  day_part: 'morning' | 'afternoon' | 'evening' | 'full_day';
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  estimated_cost: number | null;
  notes: string | null;
}

interface DraggableActivityListProps {
  dayId: string;
  activities: Activity[];
}

interface SortableActivityItemProps {
  activity: Activity;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableActivityItem({
  activity,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
}: SortableActivityItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all ${
        isDragging ? 'z-50 scale-105 shadow-2xl' : 'shadow-sm'
      }`}
    >
      {/* Desktop: Drag Handle - alleen dit deel is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 z-10 hidden h-full w-10 cursor-grab items-center justify-center bg-gray-50/80 hover:bg-gray-100 active:cursor-grabbing active:bg-gray-200 md:flex"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Mobile: Up/Down Buttons (zoals grote bedrijven doen) */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 md:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index > 0) onMoveUp();
          }}
          disabled={index === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-md transition-all hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Verplaats omhoog"
        >
          <svg
            className="h-4 w-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index < totalItems - 1) onMoveDown();
          }}
          disabled={index === totalItems - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-md transition-all hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Verplaats omlaag"
        >
          <svg
            className="h-4 w-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Activity Card met padding voor controls */}
      <div className="md:ml-10">
        <ActivityCard activity={activity} isDragging={isDragging} />
      </div>
    </div>
  );
}

export default function DraggableActivityList({ dayId, activities }: DraggableActivityListProps) {
  const [_isPending, startTransition] = useTransition();
  const [localActivities, setLocalActivities] = useState(activities);
  const [isMobile, setIsMobile] = useState(false);

  // Update local state when activities prop changes
  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 10px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localActivities.findIndex((a) => a.id === active.id);
    const newIndex = localActivities.findIndex((a) => a.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(localActivities, oldIndex, newIndex);
    updateOrder(newOrder);
  };

  // Mobile: Button-based reordering (zoals grote bedrijven doen)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = arrayMove(localActivities, index, index - 1);
    updateOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === localActivities.length - 1) return;
    const newOrder = arrayMove(localActivities, index, index + 1);
    updateOrder(newOrder);
  };

  const updateOrder = (newOrder: Activity[]) => {
    setLocalActivities(newOrder);

    // Save to server
    startTransition(async () => {
      try {
        const activityIds = newOrder.map((a) => a.id);
        await updateActivityOrder(dayId, activityIds);
      } catch (error) {
        console.error('Error updating activity order:', error);
        // Revert on error
        setLocalActivities(activities);
      }
    });
  };

  if (localActivities.length === 0) {
    return null;
  }

  // Mobile: Simple list with buttons (geen drag-and-drop)
  if (isMobile) {
    return (
      <div className="space-y-3">
        {localActivities.map((activity, index) => (
          <SortableActivityItem
            key={activity.id}
            activity={activity}
            index={index}
            totalItems={localActivities.length}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
          />
        ))}
      </div>
    );
  }

  // Desktop: Drag and drop
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={localActivities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {localActivities.map((activity, index) => (
            <SortableActivityItem
              key={activity.id}
              activity={activity}
              index={index}
              totalItems={localActivities.length}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
