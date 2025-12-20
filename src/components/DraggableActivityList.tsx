'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateActivityOrder } from '@/app/trips/[id]/itinerary/actions';
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
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ActivityCard activity={activity} isDragging={isDragging} />
    </div>
  );
}

export default function DraggableActivityList({
  dayId,
  activities,
}: DraggableActivityListProps) {
  const [isPending, startTransition] = useTransition();
  const [localActivities, setLocalActivities] = useState(activities);

  // Update local state when activities prop changes
  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
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
      <SortableContext items={localActivities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {localActivities.map((activity) => (
            <SortableActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
