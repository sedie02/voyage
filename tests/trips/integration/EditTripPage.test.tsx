/**
 * @file EditTripPage.test.tsx
 * @description Integration test: server fetch + client rendering
 */

import EditTripPage from '@/app/trips/[id]/edit/page';
import * as supabaseServer from '@/lib/supabase/server';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabase/server');
jest.mock('@/app/trips/[id]/edit/EditTripClient', () =>
  jest.fn(() => <div>MockEditTripClient</div>)
);

describe('EditTripPage', () => {
  const mockTrip = {
    id: 'trip123',
    title: 'Zomervakantie',
    destination: 'Italië',
    start_date: '2025-07-01',
    end_date: '2025-07-15',
  };

  it('roept supabase aan en rendert EditTripClient met data', async () => {
    const mockFrom = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({ data: mockTrip });

    (supabaseServer.createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      }),
    });

    const Page = await EditTripPage({ params: { id: 'trip123' } });
    render(Page);

    expect(mockSingle).toHaveBeenCalled();
    expect(screen.getByText('MockEditTripClient')).toBeInTheDocument();
  });

  it('roept notFound aan als trip niet bestaat', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: null, error: new Error('not found') });
    (supabaseServer.createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      }),
    });

    const notFound = jest
      .spyOn(require('next/navigation'), 'notFound')
      .mockImplementation(() => {});
    await EditTripPage({ params: { id: 'invalid' } });
    expect(notFound).toHaveBeenCalled();
  });
});
