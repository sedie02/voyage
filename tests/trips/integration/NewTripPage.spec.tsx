import * as actions from '@/app/trips/actions';
import NewTripPage from '@/app/trips/new/page';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockShowToast = jest.fn();
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock('@/app/trips/actions', () => ({
  createTrip: jest.fn(),
}));

describe('NewTripPage - Toast integration', () => {
  it('shows success toast when trip is created successfully', async () => {
    // Arrange
    (actions.createTrip as jest.Mock).mockResolvedValueOnce({ success: true, trip: { id: 'new-1' } });

    render(<NewTripPage />);

    // Complete minimal form flow so submit is available
    const adventureButton = screen.getByText('🏔️').closest('button');
    await Promise.resolve();
    if (adventureButton) fireEvent.click(adventureButton);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
    await Promise.resolve();
    fireEvent.change(destinationInput, { target: { value: 'Amsterdam, Netherlands' } });
    fireEvent.blur(destinationInput);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const startDateInput = screen.getByPlaceholderText(/selecteer startdatum/i);
    fireEvent.click(startDateInput);
    const endDateInput = screen.getByPlaceholderText(/selecteer einddatum/i);
    fireEvent.click(endDateInput);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
    fireEvent.change(budgetInput, { target: { value: '100' } });

    // Act
    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
    fireEvent.click(submitButton);

    // Assert
    // Assert: toast should be shown via useToast
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Trip succesvol aangemaakt!', 'success'));
  });

  it('does not show success toast on error', async () => {
    (actions.createTrip as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

    render(<NewTripPage />);

    // Complete minimal flow to reach submit
    const adventureButton = screen.getByText('🏔️').closest('button');
    if (adventureButton) fireEvent.click(adventureButton);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
    fireEvent.change(destinationInput, { target: { value: 'Amsterdam' } });
    fireEvent.blur(destinationInput);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const startDateInput = screen.getByPlaceholderText(/selecteer startdatum/i);
    fireEvent.click(startDateInput);
    const endDateInput = screen.getByPlaceholderText(/selecteer einddatum/i);
    fireEvent.click(endDateInput);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));

    const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
    fireEvent.change(budgetInput, { target: { value: '100' } });

    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Server error', 'error');
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });
});
