/**
 * Google Places helper utilities (server-side)
 * Fetches a representative city photo using Places "Find Place" and the Photos API
 */

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PlacesFindPlaceResponse {
  candidates?: Array<{
    name?: string;
    formatted_address?: string;
    photos?: Array<{
      photo_reference: string;
      width?: number;
      height?: number;
      html_attributions?: string[];
    }>;
  }>;
  status?: string;
}

export async function getCityPhotoUrl(
  query: string,
  maxWidth: number = 1600
): Promise<string | null> {
  if (!query) return unsplashFallback(query);

  try {
    if (GOOGLE_MAPS_API_KEY) {
      const params = new URLSearchParams({
        input: query,
        inputtype: 'textquery',
        fields: 'photos,name,formatted_address',
        key: GOOGLE_MAPS_API_KEY,
      });

      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`,
        {
          next: { revalidate: 60 * 60 },
        }
      );
      if (resp.ok) {
        const data = (await resp.json()) as PlacesFindPlaceResponse;
        const photoRef = data.candidates?.[0]?.photos?.[0]?.photo_reference;
        if (photoRef) {
          return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${GOOGLE_MAPS_API_KEY}`;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch city photo:', error);
  }

  return unsplashFallback(query);
}

function unsplashFallback(query: string | null): string | null {
  const q = encodeURIComponent((query || 'travel city') + ' skyline');
  // Unsplash Source returns a random but stable set given the query
  return `https://source.unsplash.com/featured/1600x900/?${q}`;
}
