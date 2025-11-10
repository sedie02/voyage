import { createTrip } from '@/app/trips/actions';
import NewTripPage from '@/app/trips/new/page';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock implementations
jest.mock('@/app/trips/actions', () => ({
  createTrip: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

const mockCreateTrip = createTrip as jest.MockedFunction<typeof createTrip>;

describe('NewTripForm Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full form flow with valid data', async () => {
    const user = userEvent.setup();
    mockCreateTrip.mockResolvedValue({
      success: true,
      trip: { id: '123', title: 'Amsterdam, Netherlands' },
      message: 'Trip succesvol aangemaakt',
    });

    render(<NewTripPage />);

    // Step 1: Select trip type
    const adventureButton = screen.getByText('🏔️').closest('button');
    await user.click(adventureButton!);
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    // Step 2: Enter destination
    const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
    await user.type(destinationInput, 'Amsterdam, Netherlands');
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    // Step 3: Select dates (simplified for test)
    // In a real test, you'd mock the date picker
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    // Step 4: Enter budget and submit
    const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
    await user.type(budgetInput, '500');

    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTrip).toHaveBeenCalledWith({
        title: 'Amsterdam, Netherlands',
        destination: 'Amsterdam, Netherlands',
        startDate: expect.any(String),
        endDate: expect.any(String),
        tripType: 'adventure',
        activitiesBudget: 500,
      });
    });
  });

  it('should show error when form submission fails', async () => {
    const user = userEvent.setup();
    mockCreateTrip.mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    });

    render(<NewTripPage />);

    // Complete form steps...
    const adventureButton = screen.getByText('🏔️').closest('button');
    await user.click(adventureButton!);
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
    await user.type(destinationInput, 'Amsterdam');
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    await user.click(screen.getByRole('button', { name: /volgende/i }));

    const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
    await user.type(budgetInput, '500');

    const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/database connection failed/i)).toBeInTheDocument();
    });
  });

  it('should maintain form state when navigating between steps', async () => {
    const user = userEvent.setup();
    render(<NewTripPage />);

    // Step 1: Select type
    const adventureButton = screen.getByText('🏔️').closest('button');
    await user.click(adventureButton!);
    await user.click(screen.getByRole('button', { name: /volgende/i }));

    // Step 2: Enter destination
    const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
    await user.type(destinationInput, 'Amsterdam');
    await user.click(screen.getByRole('button', { name: /terug/i }));

    // Back to step 1 - type should still be selected
    expect(adventureButton).toHaveClass('border-primary');

    await user.click(screen.getByRole('button', { name: /volgende/i }));

    // Back to step 2 - destination should be preserved
    expect(destinationInput).toHaveValue('Amsterdam');
  });
});
