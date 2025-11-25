import { createTrip } from '@/app/trips/actions';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock the entire module
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/session');
jest.mock('@/lib/external/places');
jest.mock('next/cache');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe('Trip Creation Endpoint - Integration Tests', () => {
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

  describe('Successful Trip Creation', () => {
    it('should create trip and return success response', async () => {
      const mockUser = { id: 'user-123' };
      const mockTrip = {
        id: 'trip-123',
        title: 'Amsterdam Adventure',
        destination: 'Amsterdam, Netherlands',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        owner_id: mockUser.id,
        guest_session_id: null,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock successful trip creation
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockTrip,
            error: null,
          }),
        }),
      });

      const formData = {
        title: 'Amsterdam Adventure',
        destination: 'Amsterdam, Netherlands',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        tripType: 'adventure',
        activitiesBudget: 500,
      };

      const result = await createTrip(formData);

      // Verify success response structure
      expect(result.success).toBe(true);
      expect(result.trip).toEqual(mockTrip);
      expect(result.message).toBe('Trip succesvol aangemaakt');

      // Verify database call
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: formData.title,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          travel_style: formData.tripType,
          activities_budget: formData.activitiesBudget,
          owner_id: mockUser.id,
          guest_session_id: null,
        })
      );

      // Verify cache invalidation
      expect(mockRevalidatePath).toHaveBeenCalledWith('/trips');
    });

    it('should handle guest user trip creation', async () => {
      const mockGuestSessionId = 'guest-session-789';

      // Mock no authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Mock guest session creation
      require('@/lib/session').getOrCreateGuestSession.mockResolvedValue(mockGuestSessionId);

      const mockTrip = {
        id: 'trip-guest-123',
        guest_session_id: mockGuestSessionId,
        owner_id: null,
      };

      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockTrip,
            error: null,
          }),
        }),
      });

      const formData = {
        title: 'Guest Trip',
        destination: 'Berlin, Germany',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        tripType: 'mixed',
        activitiesBudget: 300,
      };

      const result = await createTrip(formData);

      expect(result.success).toBe(true);
      expect(result.trip.guest_session_id).toBe(mockGuestSessionId);
      expect(result.trip.owner_id).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return error response for database failures', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock database error
      const dbError = new Error('Connection timeout');
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: dbError,
          }),
        }),
      });

      const formData = {
        title: 'Failing Trip',
        destination: 'Paris, France',
        startDate: '2024-08-01',
        endDate: '2024-08-07',
        tripType: 'culture',
        activitiesBudget: 400,
      };

      const result = await createTrip(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create trip');
      expect(result.error).toContain('Connection timeout');
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock auth error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth service unavailable'),
      });

      const formData = {
        title: 'Auth Error Trip',
        destination: 'London, UK',
        startDate: '2024-09-01',
        endDate: '2024-09-05',
        tripType: 'adventure',
        activitiesBudget: 350,
      };

      // Provide a successful insert response so the action can create a guest trip
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'trip-auth-123' },
            error: null,
          }),
        }),
      });

      const result = await createTrip(formData);

      // The action will create a guest trip even when auth lookup errors;
      // assert that a trip is returned rather than failing the whole action.
      expect(result.success).toBe(true);
      expect(result.trip).toBeDefined();
    });
  });

  describe('Data Processing', () => {
    it('should compose description from multiple fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      let insertedData: any;

      mockSupabase.insert.mockImplementation((data: any) => {
        insertedData = data;
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'trip-desc-123' },
              error: null,
            }),
          }),
        };
      });

      const formData = {
        title: 'Description Test',
        destination: 'Vienna, Austria',
        startDate: '2024-10-01',
        endDate: '2024-10-04',
        description: 'Cultural exploration',
        tripType: 'culture',
        activitiesBudget: 450,
      };

      await createTrip(formData);

      // Verify description composition
      expect(insertedData.description).toContain('Cultural exploration');
      expect(insertedData.description).toContain('Activities budget: 450');
    });

    it('should handle optional fields correctly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      let insertedData: any;

      mockSupabase.insert.mockImplementation((data: any) => {
        insertedData = data;
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'trip-optional-123' },
              error: null,
            }),
          }),
        };
      });

      const formData = {
        title: 'Minimal Trip',
        destination: 'Prague, Czech Republic',
        startDate: '2024-11-01',
        endDate: '2024-11-03',
        // No description, no activitiesBudget
      };

      await createTrip(formData as any);

      expect(insertedData.description).toBeNull();
      expect(insertedData.activities_budget).toBeNull();
      expect(insertedData.travel_style).toBe('mixed'); // Default value
    });
  });
});
