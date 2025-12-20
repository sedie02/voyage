'use client';

import { updateActivityOrder } from '@/app/trips/[id]/itinerary/actions';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

function SortableActivityItem({ activity }: { activity: Activity }) {
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
      {/* Drag Handle - alleen dit deel is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 z-10 flex h-full w-12 cursor-grab items-center justify-center bg-gray-50/80 hover:bg-gray-100 active:cursor-grabbing active:bg-gray-200 sm:w-10"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="h-6 w-6 text-gray-400 sm:h-5 sm:w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      {/* Activity Card met padding voor drag handle */}
      <div className="ml-12 sm:ml-10">
        <ActivityCard activity={activity} isDragging={isDragging} />
      </div>
    </div>
  );
}

export default function DraggableActivityList({ dayId, activities }: DraggableActivityListProps) {
  const [_isPending, startTransition] = useTransition();
  const [localActivities, setLocalActivities] = useState(activities);

  // Update local state when activities prop changes
  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 10px movement before drag starts (betere UX)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay voor touch (voorkomt scroll conflicts)
        tolerance: 8, // 8px tolerance
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={localActivities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 sm:space-y-4">
          {localActivities.map((activity) => (
            <SortableActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
