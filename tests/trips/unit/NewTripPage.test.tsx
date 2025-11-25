import NewTripPage from '@/app/trips/new/page';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// mock next/link
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name s
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

describe('NewTripPage', () => {
  it('renders all required fields and buttons', () => {
    render(<NewTripPage />);
    expect(screen.getByText(/wat voor soort reis/i)).toBeInTheDocument();
    expect(screen.getByText(/annuleren/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volgende/i })).toBeInTheDocument();
  });

  it('advances to step 2 when trip type is selected', () => {
    render(<NewTripPage />);
    fireEvent.click(screen.getByText(/avontuur/i));
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    expect(screen.getByText(/waar ga je naartoe/i)).toBeInTheDocument();
  });

  it('shows destination input in step 2', () => {
    render(<NewTripPage />);
    fireEvent.click(screen.getByText(/avontuur/i));
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    const input = screen.getByPlaceholderText(/barcelona/i);
    expect(input).toBeInTheDocument();
  });

  it('has "Trip Aanmaken" button in final step', async () => {
    render(<NewTripPage />);
    fireEvent.click(screen.getByText(/avontuur/i));
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    const destinationInput = screen.getByPlaceholderText(/barcelona/i);
    fireEvent.change(destinationInput, { target: { value: 'Rome' } });
    fireEvent.blur(destinationInput);
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    // Select dates via the mocked datepicker (clicking triggers onChange)
    const startDateInput = screen.getByPlaceholderText(/selecteer startdatum/i);
    fireEvent.click(startDateInput);
    const endDateInput = screen.getByPlaceholderText(/selecteer einddatum/i);
    fireEvent.click(endDateInput);

    // Advance to final step
    const nextButton = screen.getByRole('button', { name: /volgende/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trip aanmaken/i })).toBeInTheDocument();
    });
  });
});
