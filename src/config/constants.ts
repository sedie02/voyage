/**
 * Application Constants
 * Centralized configuration values
 */

/**
 * App Info
 */
export const APP_NAME = 'Voyage';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Slimme collaboratieve reisplanner';

/**
 * URLs
 * Prefers environment variable, falls back to production domain or localhost
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://voyagetravel.nl' : 'http://localhost:3000');

/**
 * Travel Styles
 */
export const TRAVEL_STYLES = {
  adventure: {
    label: 'Adventure & Outdoors',
    icon: '🏔️',
    description: 'Actief, wandelen, klimmen, avontuur',
  },
  beach: {
    label: 'Chill & Beach',
    icon: '🏖️',
    description: 'Ontspannen, strand, zwemmen',
  },
  culture: {
    label: 'Culture & City',
    icon: '🏛️',
    description: 'Musea, architectuur, geschiedenis',
  },
  nature: {
    label: 'Nature & Scenic',
    icon: '🌲',
    description: 'Natuur, landschappen, wildlife',
  },
  mixed: {
    label: 'Mixed',
    icon: '🎯',
    description: 'Combinatie van alles',
  },
} as const;

/**
 * Day Parts voor heuristische planning
 */
export const DAY_PARTS = {
  morning: {
    label: 'Ochtend',
    icon: '🌅',
    timeRange: '08:00 - 12:00',
  },
  afternoon: {
    label: 'Middag',
    icon: '☀️',
    timeRange: '12:00 - 18:00',
  },
  evening: {
    label: 'Avond',
    icon: '🌆',
    timeRange: '18:00 - 23:00',
  },
  full_day: {
    label: 'Hele Dag',
    icon: '🕐',
    timeRange: '08:00 - 23:00',
  },
} as const;

/**
 * Participant Roles
 */
export const PARTICIPANT_ROLES = {
  owner: {
    label: 'Eigenaar',
    description: 'Volledige controle over de trip',
    permissions: ['read', 'write', 'delete', 'invite', 'manage_participants'],
  },
  editor: {
    label: 'Editor',
    description: 'Kan bewerken en toevoegen',
    permissions: ['read', 'write', 'invite'],
  },
  viewer: {
    label: 'Kijker',
    description: 'Alleen bekijken',
    permissions: ['read'],
  },
  guest: {
    label: 'Gast',
    description: 'Beperkte toegang zonder account',
    permissions: ['read'],
  },
} as const;

/**
 * Packing Categories
 */
export const PACKING_CATEGORIES = [
  { value: 'clothing', label: 'Kleding', icon: '👕' },
  { value: 'toiletries', label: 'Toiletspullen', icon: '🧴' },
  { value: 'electronics', label: 'Elektronica', icon: '📱' },
  { value: 'documents', label: 'Documenten', icon: '📄' },
  { value: 'medication', label: 'Medicijnen', icon: '💊' },
  { value: 'other', label: 'Overig', icon: '📦' },
] as const;

/**
 * Expense Categories
 */
export const EXPENSE_CATEGORIES = [
  { value: 'accommodation', label: 'Accommodatie', icon: '🏨' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'food', label: 'Eten & Drinken', icon: '🍽️' },
  { value: 'activities', label: 'Activiteiten', icon: '🎟️' },
  { value: 'shopping', label: 'Winkelen', icon: '🛍️' },
  { value: 'other', label: 'Overig', icon: '💳' },
] as const;

/**
 * Supported Currencies
 */
export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

/**
 * API Rate Limits
 */
export const RATE_LIMITS = {
  authenticated: {
    requests: 100,
    window: 60, // seconds
  },
  guest: {
    requests: 30,
    window: 60,
  },
} as const;

/**
 * Validation Limits
 */
export const LIMITS = {
  trip: {
    titleMin: 3,
    titleMax: 255,
    descriptionMax: 1000,
    maxDays: 90,
  },
  activity: {
    titleMax: 255,
    descriptionMax: 1000,
  },
  poll: {
    questionMin: 5,
    questionMax: 500,
    optionsMin: 2,
    optionsMax: 10,
  },
  invite: {
    tokenLength: 64,
  },
} as const;

/**
 * Cache Durations (in seconds)
 */
export const CACHE_DURATION = {
  weather: 3600, // 1 hour
  places: 86400, // 24 hours
  static: 604800, // 7 days
} as const;
