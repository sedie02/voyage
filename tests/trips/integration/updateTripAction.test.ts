/**
 * @file updateTripAction.test.ts
 * @description Integration test voor updateTrip server action
 */

import { updateTrip } from '@/app/trips/actions';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('US47 - updateTrip server action', () => {
  const mockUpdate = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockResolvedValue({ data: [{ id: 'trip987' }], error: null });

  beforeEach(() => {
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        update: (...args: unknown[]) => {
          mockUpdate(...args);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return Promise.resolve({ error: null });
            },
          };
        },
        select: () => mockSelect(),
      }),
    });
    jest.clearAllMocks();
  });

  it('werkt trip correct bij in de database', async () => {
    await updateTrip('trip987', {
      title: 'Nieuwe titel',
      destination: 'Berlin, Germany',
      startDate: '2025-01-01',
      endDate: '2025-01-05',
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'trip987');
  });

  it('gooit fout bij mislukte update', async () => {
    const mockError = new Error('DB error');
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        update: () => ({
          eq: () => ({ error: mockError }),
        }),
      }),
    });

    await expect(
      updateTrip('trip987', {
        title: 'X',
        destination: 'Nowhere',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
      })
    ).rejects.toThrow('DB error');
  });
});
