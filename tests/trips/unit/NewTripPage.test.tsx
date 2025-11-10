import NewTripPage from '@/app/trips/new/page';
import { fireEvent, render, screen } from '@testing-library/react';

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

  it('has "Trip Aanmaken" button in final step', () => {
    render(<NewTripPage />);
    fireEvent.click(screen.getByText(/avontuur/i));
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    fireEvent.change(screen.getByPlaceholderText(/barcelona/i), { target: { value: 'Rome' } });
    fireEvent.click(screen.getByRole('button', { name: /volgende/i }));
    const fromInputs = screen.queryAllByLabelText(/van/i);
    if (fromInputs.length > 0) {
      fireEvent.change(fromInputs[0], { target: { value: '2025-10-01' } });
    }

    const toInputs = screen.queryAllByLabelText(/tot/i);
    if (toInputs.length > 0) {
      fireEvent.change(toInputs[0], { target: { value: '2025-10-05' } });
    }

    expect(screen.getByRole('button', { name: /trip aanmaken/i })).toBeInTheDocument();
  });
});
