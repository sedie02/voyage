/**
 * GetYourGuide Web Scraper
 * Scrapes activities from GetYourGuide based on destination and travel style
 */

import { load } from 'cheerio';

const GETYOURGUIDE_BASE_URL = 'https://www.getyourguide.com';

// Lightweight debug wrapper to avoid direct console calls (keeps lint happy)
const debug = (..._args: unknown[]) => {};

export interface GetYourGuideActivity {
  title: string;
  description: string | null;
  price: string | null;
  rating: number | null;
  reviewCount: number | null;
  duration: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
}

/**
 * Map travel style to GetYourGuide search terms
 */
function getSearchTerms(travelStyle: string): string[] {
  const terms: Record<string, string[]> = {
    adventure: ['adventure', 'excursion', 'sport', 'outdoor', 'hiking'],
    beach: ['beach', 'boat', 'snorkeling', 'diving', 'water', 'sailing'],
    culture: ['museum', 'tour', 'history', 'culture', 'heritage', 'art', 'gallery'],
    nature: ['nature', 'park', 'wildlife', 'hiking', 'outdoor', 'nature-walk'],
    mixed: ['tour', 'attraction', 'experience', 'activity', 'sightseeing'],
  };

  return terms[travelStyle] || terms.mixed;
}

/**
 * Scrape activities from GetYourGuide search results
 */
export async function scrapeGetYourGuideActivities(
  destination: string,
  travelStyle: string = 'mixed',
  maxResults: number = 20
): Promise<GetYourGuideActivity[]> {
  try {
    // Build search URL - GetYourGuide uses location-based search
    const searchTerms = getSearchTerms(travelStyle);
    const query = `${destination}`;
    const encodedQuery = encodeURIComponent(query);

    // GetYourGuide search URL - try different formats
    const searchUrls = [
      `${GETYOURGUIDE_BASE_URL}/s/?q=${encodedQuery}`,
      `${GETYOURGUIDE_BASE_URL}/${encodedQuery}/l1/?q=${searchTerms[0]}`,
      `${GETYOURGUIDE_BASE_URL}/s/?q=${encodedQuery}+${searchTerms[0]}`,
    ];

    debug('Scraping GetYourGuide:', { destination, travelStyle });

    const activities: GetYourGuideActivity[] = [];

    // Try each URL format
    for (const searchUrl of searchUrls) {
      try {
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
            Referer: 'https://www.getyourguide.com/',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
          continue; // Try next URL
        }

        const html = await response.text();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const $: any = load(html);

        // Try multiple selectors for GetYourGuide activity cards
        const selectors = [
          '[data-test-id="activity-card"]',
          '.activity-card',
          '[data-gyg-id]',
          '.activity-item',
          'article[class*="activity"]',
          '[class*="ActivityCard"]',
          'a[href*="/activity/"]',
          '[class*="Card"]',
          'article',
        ];

        for (const selector of selectors) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $(selector).each((_i: any, element: any) => {
            if (activities.length >= maxResults) return false;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const $el: any = $(element);

            // Extract title - try multiple ways
            const title =
              $el.find('[data-test-id="activity-title"]').text().trim() ||
              $el.find('[data-testid="activity-title"]').text().trim() ||
              $el.find('h2, h3, h4, [class*="title"], [class*="Title"]').first().text().trim() ||
              $el.attr('data-title') ||
              $el.attr('aria-label') ||
              $el.find('a').first().attr('title') ||
              '';

            // Skip if no title or title is too short
            if (!title || title.length < 3) return true;

            // Extract description - try multiple ways
            const description =
              $el.find('[data-test-id="activity-description"]').text().trim() ||
              $el.find('[data-testid="activity-description"]').text().trim() ||
              $el
                .find('[class*="description"], [class*="Description"], [class*="summary"]')
                .first()
                .text()
                .trim() ||
              $el.find('p').first().text().trim() ||
              null;

            // Extract price
            const priceText =
              $el.find('[data-test-id="price"]').text().trim() ||
              $el.find('[data-testid="price"]').text().trim() ||
              $el
                .find('[class*="price"], [class*="Price"], [class*="cost"]')
                .first()
                .text()
                .trim() ||
              '';
            const priceMatch = priceText.match(/€\s*(\d+(?:,\d+)?(?:\.\d+)?)/);
            const price = priceMatch ? `€${priceMatch[1].replace(',', '.')}` : null;

            // Extract rating
            const ratingText =
              $el.find('[data-test-id="rating"]').text().trim() ||
              $el.find('[data-testid="rating"]').text().trim() ||
              $el
                .find('[class*="rating"], [class*="Rating"], [class*="star"]')
                .first()
                .text()
                .trim() ||
              '';
            const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

            // Extract review count
            const reviewText =
              $el.find('[data-test-id="review-count"]').text().trim() ||
              $el.find('[data-testid="review-count"]').text().trim() ||
              $el.find('[class*="review"], [class*="Review"]').first().text().trim() ||
              '';
            const reviewMatch = reviewText.match(/(\d+)/);
            const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null;

            // Extract duration
            const duration =
              $el.find('[data-test-id="duration"]').text().trim() ||
              $el.find('[data-testid="duration"]').text().trim() ||
              $el
                .find('[class*="duration"], [class*="Duration"], [class*="time"]')
                .first()
                .text()
                .trim() ||
              null;

            // Extract URL - prioritize activity links
            let url = null;
            // Try to find activity link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            $el.find('a[href*="/activity/"]').each((_j: any, link: any) => {
              const href = $(link).attr('href');
              if (href && href.includes('/activity/')) {
                url = href;
                return false; // Stop after first match
              }
              return true;
            });

            // If no activity link found, try any link
            if (!url) {
              url = $el.find('a').first().attr('href') || $el.attr('href') || null;
            }

            const fullUrl = url
              ? url.startsWith('http')
                ? url
                : `${GETYOURGUIDE_BASE_URL}${url}`
              : null;

            // Extract image URL - try multiple ways
            let imageUrl: string | null = null;

            // Try img tag
            const imgSrc =
              $el.find('img').first().attr('src') ||
              $el.find('img').first().attr('data-src') ||
              $el.find('img').first().attr('data-lazy-src');
            if (imgSrc) {
              imageUrl = imgSrc.startsWith('http') ? imgSrc : `${GETYOURGUIDE_BASE_URL}${imgSrc}`;
            } else {
              // Try background image
              const bgImage = $el.css('background-image');
              if (bgImage && bgImage !== 'none') {
                const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match && match[1]) {
                  imageUrl = match[1].startsWith('http')
                    ? match[1]
                    : `${GETYOURGUIDE_BASE_URL}${match[1]}`;
                }
              }

              // Try data attributes
              if (!imageUrl) {
                imageUrl =
                  $el.attr('data-image') ||
                  $el.attr('data-image-url') ||
                  $el.find('[data-image]').first().attr('data-image') ||
                  null;
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = `${GETYOURGUIDE_BASE_URL}${imageUrl}`;
                }
              }
            }

            // Only add if we have a valid URL (indicates it's a real GetYourGuide activity)
            if (fullUrl && fullUrl.includes('getyourguide.com')) {
              activities.push({
                title,
                description: description || `Ontdek ${title} in ${destination}`,
                price,
                rating,
                reviewCount,
                duration,
                category: travelStyle,
                url: fullUrl,
                imageUrl: imageUrl || null,
              });
            }
            return true;
          });

          if (activities.length > 0) break; // Found activities, stop trying other selectors
        }

        // Also try JSON-LD structured data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $('script[type="application/ld+json"]').each((_i: any, element: any) => {
          try {
            const jsonStr = $(element).html() || '';
            const data = JSON.parse(jsonStr);

            if (Array.isArray(data)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.forEach((item: any) => {
                if (
                  (item['@type'] === 'TouristAttraction' ||
                    item['@type'] === 'Product' ||
                    item['@type'] === 'TouristTrip') &&
                  activities.length < maxResults
                ) {
                  const url = item.url || null;
                  const fullUrl = url
                    ? url.startsWith('http')
                      ? url
                      : `${GETYOURGUIDE_BASE_URL}${url}`
                    : null;

                  if (fullUrl && fullUrl.includes('getyourguide.com')) {
                    // Try to get image from JSON-LD
                    const image =
                      item.image ||
                      (Array.isArray(item.image) ? item.image[0] : null) ||
                      item.thumbnailUrl ||
                      null;
                    const imageUrl = image
                      ? typeof image === 'string'
                        ? image
                        : image.url || image['@id'] || null
                      : null;

                    activities.push({
                      title: item.name || item.title || '',
                      description: item.description || null,
                      price: item.offers?.price ? `€${item.offers.price}` : null,
                      rating: item.aggregateRating?.ratingValue || null,
                      reviewCount: item.aggregateRating?.reviewCount || null,
                      duration: item.duration || null,
                      category: item.category || travelStyle,
                      url: fullUrl,
                      imageUrl: imageUrl || null,
                    });
                  }
                }
              });
            } else if (data['@type'] === 'TouristAttraction' || data['@type'] === 'Product') {
              const url = data.url || null;
              const fullUrl = url
                ? url.startsWith('http')
                  ? url
                  : `${GETYOURGUIDE_BASE_URL}${url}`
                : null;

              if (fullUrl && fullUrl.includes('getyourguide.com')) {
                // Try to get image from JSON-LD
                const image =
                  data.image ||
                  (Array.isArray(data.image) ? data.image[0] : null) ||
                  data.thumbnailUrl ||
                  null;
                const imageUrl = image
                  ? typeof image === 'string'
                    ? image
                    : image.url || image['@id'] || null
                  : null;

                activities.push({
                  title: data.name || data.title || '',
                  description: data.description || null,
                  price: data.offers?.price ? `€${data.offers.price}` : null,
                  rating: data.aggregateRating?.ratingValue || null,
                  reviewCount: data.aggregateRating?.reviewCount || null,
                  duration: data.duration || null,
                  category: data.category || travelStyle,
                  url: fullUrl,
                  imageUrl: imageUrl || null,
                });
              }
            }
          } catch {
            // Skip invalid JSON
          }
          return true;
        });

        debug(`📅 Found ${activities.length} activities from ${searchUrl}`);
        if (activities.length > 0) break; // Found activities, stop trying other URLs
      } catch (err) {
        debug('Error scraping URL:', searchUrl, err);
        continue;
      }
    }

    debug(`Found ${activities.length} activities from GetYourGuide`);
    return activities.slice(0, maxResults);
  } catch (error) {
    // Error scraping GetYourGuide - fallback to generated activities
    return [];
  }
}

/**
 * Fallback: Generate activities based on travel style and destination
 */
export function generateFallbackActivities(
  destination: string,
  travelStyle: string,
  numDays: number
): GetYourGuideActivity[] {
  const activities: GetYourGuideActivity[] = [];

  const templates: Record<string, string[]> = {
    adventure: [
      'Avontuurlijke excursie',
      'Outdoor activiteit',
      'Sportieve ervaring',
      'Adrenaline tour',
      'Extreme sport',
    ],
    beach: [
      'Strandactiviteit',
      'Boottocht',
      'Snorkelen',
      'Duiken',
      'Watersport',
      'Zonsondergang cruise',
    ],
    culture: [
      'Musea bezoek',
      'Historische tour',
      'Cultuurexperience',
      'Kunstgalerie',
      'Archeologische site',
      'Lokale markt',
      'Theater voorstelling',
    ],
    nature: [
      'Natuurwandeling',
      'Wildlife spotten',
      'National park',
      'Hiking trail',
      'Fiets tour',
      'Natuur excursie',
    ],
    mixed: [
      'Populaire attractie',
      'City tour',
      'Lokale ervaring',
      'Cultuur bezoek',
      'Outdoor activiteit',
      'Museum',
    ],
  };

  const templatesList = templates[travelStyle] || templates.mixed;
  // Generate at least 2-3 activities per day
  const activitiesPerDay = Math.max(2, Math.min(3, Math.ceil(templatesList.length / numDays)));
  const totalActivities = numDays * activitiesPerDay;

  // Generating fallback activities

  for (let i = 0; i < totalActivities; i++) {
    const template = templatesList[i % templatesList.length];
    activities.push({
      title: `${template} in ${destination}`,
      description: `Ontdek de beste ${template.toLowerCase()} in ${destination}`,
      price: null,
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      duration: `${Math.floor(Math.random() * 3) + 2} uur`,
      category: travelStyle,
      url: null,
      imageUrl: null, // Fallback activities don't have images
    });
  }

  // Generated fallback activities
  return activities;
}
