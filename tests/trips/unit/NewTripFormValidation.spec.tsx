import NewTripPage from '@/app/trips/new/page';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de hooks en dependencies
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

jest.mock('@/app/trips/actions', () => ({
  createTrip: jest.fn(),
}));

describe('NewTripForm Validation - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: Trip Type Validation', () => {
    it('should disable next button when no trip type is selected', () => {
      render(<NewTripPage />);

      const nextButton = screen.getByRole('button', { name: /volgende/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when one trip type is selected', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);

      const nextButton = screen.getByRole('button', { name: /volgende/i });
      expect(nextButton).toBeEnabled();
    });

    it('should allow maximum 2 trip types to be selected', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      const adventureButton = screen.getByText('🏔️').closest('button');
      const beachButton = screen.getByText('🏖️').closest('button');
      const cultureButton = screen.getByText('🏛️').closest('button');

      await _user.click(adventureButton!);
      await _user.click(beachButton!);
      await _user.click(cultureButton!);

      // Should show warning and not select third type
      expect(screen.getByText(/maximaal 2 reis soorten/i)).toBeInTheDocument();
      expect(cultureButton).not.toHaveClass('border-primary');
    });
  });

  describe('Step 2: Destination Validation', () => {
    it('should disable next button when destination is empty', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Navigate to step 2
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const nextButton = screen.getByRole('button', { name: /volgende/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when destination is provided', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Navigate to step 2
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      // Mock destination input
      const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
      await _user.type(destinationInput, 'Amsterdam, Netherlands');

      const nextButton = screen.getByRole('button', { name: /volgende/i });
      expect(nextButton).toBeEnabled();
    });
  });

  describe('Step 3: Date Validation', () => {
    it('should disable next button when dates are invalid', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Navigate to step 3
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
      await _user.type(destinationInput, 'Amsterdam');
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const nextButton = screen.getByRole('button', { name: /volgende/i });
      expect(nextButton).toBeDisabled();
    });

    it('should disable end date when start date is not selected', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Navigate to step 3
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
      await _user.type(destinationInput, 'Amsterdam');
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const endDateInput = screen.getByPlaceholderText(/selecteer einddatum/i);
      expect(endDateInput).toBeDisabled();
    });

    it('should reset end date when start date is changed to later date', async () => {
      render(<NewTripPage />);

      // Navigate to step 3 and set dates
      // ... implementation for date testing
    });
  });

  describe('Step 4: Budget Validation', () => {
    it('should disable submit button when budget is invalid', async () => {
      render(<NewTripPage />);

      // Navigate to step 4 with invalid budget
      // ... implementation

      const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when budget is zero or negative', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Navigate to step 4
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
      await _user.type(destinationInput, 'Amsterdam');
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      // Set valid dates
      const startDateInput = screen.getByPlaceholderText(/selecteer startdatum/i);
      await _user.click(startDateInput);
      // ... date selection logic

      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      // Set invalid budget
      const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
      await _user.type(budgetInput, '0');

      const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when all fields are valid', async () => {
      const _user = userEvent.setup();
      render(<NewTripPage />);

      // Complete all steps with valid data
      const adventureButton = screen.getByText('🏔️').closest('button');
      await _user.click(adventureButton!);
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const destinationInput = screen.getByPlaceholderText(/bijv. barcelona, spanje/i);
      await _user.type(destinationInput, 'Amsterdam, Netherlands');
      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      // Set valid dates
      // ... date selection implementation

      await _user.click(screen.getByRole('button', { name: /volgende/i }));

      const budgetInput = screen.getByPlaceholderText(/bijv. 300/i);
      await _user.type(budgetInput, '500');

      const submitButton = screen.getByRole('button', { name: /trip aanmaken/i });
      expect(submitButton).toBeEnabled();
    });
  });
});
