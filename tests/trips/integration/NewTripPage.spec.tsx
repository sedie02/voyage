import * as actions from '@/app/trips/actions';
import NewTripPage from '@/app/trips/new/page';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@/app/trips/actions', () => ({
  createTrip: jest.fn(),
}));

describe('NewTripPage - Toast integration', () => {
  it('shows success toast when trip is created successfully', async () => {
    // Arrange
    (actions.createTrip as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<NewTripPage />);

    // Simuleer minimale invoer (hangt af van je implementatie)
    // Je kunt eventueel mocken dat form valid is
    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => expect(screen.getByText(/trip succesvol aangemaakt/i)).toBeInTheDocument());
  });

  it('does not show success toast on error', async () => {
    (actions.createTrip as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

    render(<NewTripPage />);

    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/trip succesvol aangemaakt/i)).not.toBeInTheDocument();
      expect(screen.getByText(/er ging iets mis/i)).toBeInTheDocument();
    });
  });
});
