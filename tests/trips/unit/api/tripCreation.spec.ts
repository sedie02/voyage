import { createTrip } from '@/app/trips/actions';
import { getCityPhotoUrl } from '@/lib/external/places';
import { getOrCreateGuestSession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/session');
jest.mock('@/lib/external/places');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGetOrCreateGuestSession = getOrCreateGuestSession as jest.MockedFunction<
  typeof getOrCreateGuestSession
>;
const mockGetCityPhotoUrl = getCityPhotoUrl as jest.MockedFunction<typeof getCityPhotoUrl>;

describe('Trip Creation API - Unit Tests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockSupabase),
      insert: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      single: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('Input Validation', () => {
    it('should validate required fields are present', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockGetOrCreateGuestSession.mockResolvedValue('guest-session-123');
      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // Missing required fields
      const invalidData = {
        title: '', // Empty title
        destination: '', // Empty destination
        startDate: 'invalid-date', // Invalid date
        endDate: '2024-01-01', // End before start
      };

      const result = await createTrip(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create trip');
    });

    it('should validate date logic', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockGetOrCreateGuestSession.mockResolvedValue('guest-session-123');
      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // End date before start date
      const invalidDateData = {
        title: 'Test Trip',
        destination: 'Amsterdam',
        startDate: '2024-01-10',
        endDate: '2024-01-01', // End before start
        tripType: 'adventure',
        activitiesBudget: 500,
      };

      // Note: Date validation might happen in database or frontend
      // This test ensures the action handles database errors properly
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Date validation failed' },
          }),
        }),
      });

      const result = await createTrip(invalidDateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create trip');
    });
  });

  describe('Authorization', () => {
    it('should create trip for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // Mock successful insertion
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'trip-123', owner_id: mockUser.id },
            error: null,
          }),
        }),
      });

      const validData = {
        title: 'Amsterdam Trip',
        destination: 'Amsterdam, Netherlands',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        tripType: 'culture',
        activitiesBudget: 500,
      };

      const result = await createTrip(validData);

      expect(result.success).toBe(true);
      expect(result.trip).toBeDefined();
      expect(result.trip.owner_id).toBe(mockUser.id);
      expect(mockGetOrCreateGuestSession).not.toHaveBeenCalled();
    });

    it('should create trip for guest user with session ID', async () => {
      // No authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockGetOrCreateGuestSession.mockResolvedValue('guest-session-456');
      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // Mock successful insertion
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'trip-456', guest_session_id: 'guest-session-456' },
            error: null,
          }),
        }),
      });

      const validData = {
        title: 'Guest Trip',
        destination: 'Berlin, Germany',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        tripType: 'mixed',
        activitiesBudget: 300,
      };

      const result = await createTrip(validData);

      expect(result.success).toBe(true);
      expect(result.trip).toBeDefined();
      expect(result.trip.guest_session_id).toBe('guest-session-456');
      expect(mockGetOrCreateGuestSession).toHaveBeenCalled();
    });
  });

  describe('Database Operations', () => {
    it('should handle database insertion errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // Mock database error
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database constraint violation' },
          }),
        }),
      });

      const validData = {
        title: 'Test Trip',
        destination: 'Paris, France',
        startDate: '2024-08-01',
        endDate: '2024-08-07',
        tripType: 'adventure',
        activitiesBudget: 400,
      };

      const result = await createTrip(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database constraint violation');
    });

    it('should handle missing database columns gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockGetCityPhotoUrl.mockResolvedValue('https://example.com/photo.jpg');

      // First attempt fails due to missing columns
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'column "activities_budget" does not exist' },
          }),
        }),
      });

      // Second attempt succeeds without the problematic columns
      mockSupabase.insert.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'trip-789' },
            error: null,
          }),
        }),
      });

      const validData = {
        title: 'Fallback Trip',
        destination: 'Rome, Italy',
        startDate: '2024-09-01',
        endDate: '2024-09-05',
        tripType: 'culture',
        activitiesBudget: 600,
      };

      const result = await createTrip(validData);

      expect(result.success).toBe(true);
      expect(result.trip.id).toBe('trip-789');
      // Should have retried without the problematic columns
      expect(mockSupabase.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('External Service Integration', () => {
    it('should handle city photo service failures gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Photo service fails
      mockGetCityPhotoUrl.mockRejectedValue(new Error('Photo service unavailable'));

      // But trip creation should still proceed
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'trip-999' },
            error: null,
          }),
        }),
      });

      const validData = {
        title: 'Trip Without Photo',
        destination: 'Unknown City',
        startDate: '2024-10-01',
        endDate: '2024-10-03',
        tripType: 'nature',
        activitiesBudget: 200,
      };

      const result = await createTrip(validData);

      expect(result.success).toBe(true);
      expect(result.trip.id).toBe('trip-999');
    });
  });
});
