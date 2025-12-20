'use client';

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

interface ActivityCardProps {
  activity: Activity;
  isDragging?: boolean;
}

function getDayPartLabel(dayPart: string): string {
  const labels: Record<string, string> = {
    morning: 'Ochtend',
    afternoon: 'Middag',
    evening: 'Avond',
    full_day: 'Hele dag',
  };
  return labels[dayPart] || dayPart;
}

export default function ActivityCard({ activity, isDragging }: ActivityCardProps) {
  // Extract GetYourGuide URL and image from notes field
  let getYourGuideUrl: string | null = null;
  let getYourGuideImageUrl: string | null = null;

  if (activity.notes) {
    const parts = activity.notes.split('|');
    for (const part of parts) {
      if (part.startsWith('GYG_URL:')) {
        getYourGuideUrl = part.replace('GYG_URL:', '');
      } else if (part.startsWith('GYG_IMG:')) {
        getYourGuideImageUrl = part.replace('GYG_IMG:', '');
      }
    }
  }

  // Build Google Maps link
  let mapsLink: string | null = null;
  if (activity.location_lat && activity.location_lng) {
    mapsLink = `https://www.google.com/maps?q=${activity.location_lat},${activity.location_lng}`;
  } else if (activity.location_address) {
    mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location_address)}`;
  } else if (activity.location_name) {
    mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location_name)}`;
  }

  // Calculate end time if we have start time and duration
  let endTime: string | null = activity.end_time || null;
  let durationText: string | null = null;

  if (activity.start_time && activity.duration_minutes && !endTime) {
    const [hours, minutes] = activity.start_time.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + activity.duration_minutes);
    const endHours = startDate.getHours().toString().padStart(2, '0');
    const endMins = startDate.getMinutes().toString().padStart(2, '0');
    endTime = `${endHours}:${endMins}`;
  }

  // Format duration text
  if (activity.duration_minutes) {
    const hours = Math.floor(activity.duration_minutes / 60);
    const mins = activity.duration_minutes % 60;
    if (hours > 0 && mins > 0) {
      durationText = `${hours}u ${mins}min`;
    } else if (hours > 0) {
      durationText = `${hours} uur`;
    } else {
      durationText = `${mins} minuten`;
    }
  }

  // Get activity image
  let activityImageUrl: string | null = null;
  if (getYourGuideImageUrl) {
    activityImageUrl = getYourGuideImageUrl;
  } else if (getYourGuideUrl) {
    activityImageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`;
  } else if (activity.location_name) {
    activityImageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`;
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-opacity ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      {/* Activity Image/Header */}
      {activityImageUrl || getYourGuideUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500">
          {activityImageUrl ? (
            <img
              src={activityImageUrl}
              alt={activity.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            {getYourGuideUrl ? (
              <a
                href={getYourGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <span>🔗</span>
                <span>Bekijk op GetYourGuide</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <span className="text-sm font-medium text-white">{activity.title}</span>
            )}
          </div>
        </div>
      ) : null}

      {/* Activity Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h5 className="text-lg font-bold text-gray-900">{activity.title}</h5>

            {activity.description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{activity.description}</p>
            )}

            {/* Time Information */}
            {(activity.start_time || endTime || durationText) && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">🕐 Tijd:</span>
                  <span>
                    {activity.start_time && endTime
                      ? `${activity.start_time.substring(0, 5)} - ${endTime.substring(0, 5)}`
                      : activity.start_time
                        ? `${activity.start_time.substring(0, 5)}`
                        : endTime
                          ? `${endTime.substring(0, 5)}`
                          : 'Tijd nog niet bepaald'}
                  </span>
                </div>
                {durationText && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">⏱️ Duur:</span>
                    <span>{durationText}</span>
                  </div>
                )}
              </div>
            )}

            {/* Location with Google Maps Link */}
            {activity.location_name && (
              <div className="mt-2">
                {mapsLink ? (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 {activity.location_name}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ) : (
                  <span className="text-sm text-gray-600">📍 {activity.location_name}</span>
                )}
                {activity.location_address && (
                  <p className="ml-5 mt-1 text-xs text-gray-500">{activity.location_address}</p>
                )}
              </div>
            )}

            {/* Additional Info Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {getDayPartLabel(activity.day_part)}
              </span>
              {activity.estimated_cost && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  €{activity.estimated_cost.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
