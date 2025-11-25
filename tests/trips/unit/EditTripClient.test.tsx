/**
 * @file EditTripClient.test.tsx
 * @description Unit tests voor EditTripClient component
 */

import EditTripClient from '@/app/trips/[id]/edit/EditTripClient';
import { updateTrip } from '@/app/trips/actions';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/app/trips/actions', () => ({
  updateTrip: jest.fn(),
  archiveTrip: jest.fn(),
  deleteTrip: jest.fn(),
  duplicateTrip: jest.fn(),
}));

describe('EditTripClient', () => {
  const mockPush = jest.fn();
  const trip = {
    id: 'trip123',
    title: 'Zomervakantie',
    destination: 'Italië',
    start_date: '2025-07-01',
    end_date: '2025-07-15',
    description: 'Heerlijke reis',
    travel_style: 'mixed',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('toont de bestaande tripgegevens in het formulier', () => {
    render(<EditTripClient trip={trip} />);
    expect(screen.getByDisplayValue('Zomervakantie')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Italië')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-07-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-07-15')).toBeInTheDocument();
  });

  it('werkt state bij wanneer velden gewijzigd worden', () => {
    render(<EditTripClient trip={trip} />);
    const titleInput = screen.getByLabelText(/Titel/i);
    fireEvent.change(titleInput, { target: { value: 'Wintertrip' } });
    expect((titleInput as HTMLInputElement).value).toBe('Wintertrip');
  });

  it('roept updateTrip aan en toont succesmelding bij opslaan', async () => {
    (updateTrip as jest.Mock).mockResolvedValueOnce({});
    render(<EditTripClient trip={trip} />);

    const saveButton = screen.getByRole('button', { name: /Wijzigingen Opslaan/i });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(screen.getByText(/Reis succesvol bijgewerkt!/i)).toBeInTheDocument()
    );
  });

  it('toont foutmelding bij mislukte update', async () => {
    (updateTrip as jest.Mock).mockRejectedValueOnce(new Error('Failed to update trip'));
    render(<EditTripClient trip={trip} />);

    const saveButton = screen.getByRole('button', { name: /Wijzigingen Opslaan/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(screen.getByText(/Failed to update trip/i)).toBeInTheDocument());
  });
});
