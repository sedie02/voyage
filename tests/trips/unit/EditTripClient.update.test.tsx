/**
 * @file EditTripClient.update.test.tsx
 * @description Unit test voor opslaan van wijzigingen
 */

import EditTripClient from '@/app/trips/[id]/edit/EditTripClient';
import { updateTrip } from '@/app/trips/actions';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/app/trips/actions', () => ({
  updateTrip: jest.fn(),
}));

describe('US47 - Opslaan van wijzigingen', () => {
  const mockPush = jest.fn();
  const trip = {
    id: 'trip987',
    title: 'Oude titel',
    destination: 'Parijs',
    start_date: '2025-05-01',
    end_date: '2025-05-05',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('roept updateTrip aan met gewijzigde data', async () => {
    render(<EditTripClient trip={trip} />);
    const titleInput = screen.getByLabelText(/Titel/i);
    fireEvent.change(titleInput, { target: { value: 'Nieuwe titel' } });

    fireEvent.click(screen.getByRole('button', { name: /Wijzigingen Opslaan/i }));

    await waitFor(() => {
      expect(updateTrip).toHaveBeenCalledWith(
        'trip987',
        expect.objectContaining({
          title: 'Nieuwe titel',
        })
      );
    });
  });

  it('toont succesmelding en redirect', async () => {
    (updateTrip as jest.Mock).mockResolvedValueOnce({});
    jest.useFakeTimers();
    render(<EditTripClient trip={trip} />);

    fireEvent.click(screen.getByRole('button', { name: /Wijzigingen Opslaan/i }));

    await waitFor(() =>
      expect(screen.getByText(/Reis succesvol bijgewerkt!/i)).toBeInTheDocument()
    );

    // Fast-forward the redirect timeout
    jest.runAllTimers();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/trips/trip987'));
    jest.useRealTimers();
  });

  it('behoudt invoer bij foutmelding', async () => {
    (updateTrip as jest.Mock).mockRejectedValueOnce(new Error('Failed to update trip'));
    render(<EditTripClient trip={trip} />);

    const input = screen.getByLabelText(/Titel/i);
    fireEvent.change(input, { target: { value: 'Tussentijdse wijziging' } });
    fireEvent.click(screen.getByRole('button', { name: /Wijzigingen Opslaan/i }));

    await waitFor(() => expect(screen.getByText(/Failed to update trip/i)).toBeInTheDocument());
    expect((input as HTMLInputElement).value).toBe('Tussentijdse wijziging');
  });
});
