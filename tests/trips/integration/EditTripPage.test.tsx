/**
 * @file EditTripPage.test.tsx
 * @description Integration test: server fetch + client rendering
 */

import EditTripPage from '@/app/trips/[id]/edit/page';
import * as supabaseServer from '@/lib/supabase/server';
import * as nav from 'next/navigation';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabase/server');
jest.mock('@/app/trips/[id]/edit/EditTripClient', () => ({
  __esModule: true,
  default: () => <div>MockEditTripClient</div>,
}));

describe('EditTripPage', () => {
  const mockTrip = {
    id: 'trip123',
    title: 'Zomervakantie',
    destination: 'Italië',
    start_date: '2025-07-01',
    end_date: '2025-07-15',
  };

  it('roept supabase aan en rendert EditTripClient met data', async () => {
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
    await screen.findByText('MockEditTripClient');
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

    (nav as any).notFound = jest.fn();
    await EditTripPage({ params: { id: 'invalid' } });
    expect(nav.notFound).toHaveBeenCalled();
  });
});
