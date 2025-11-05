import Toast from '@/components/ui/Toast';
import { act, fireEvent, render, screen } from '@testing-library/react';

// Mock timer
jest.useFakeTimers();

describe('Toast Component', () => {
  it('should render success toast with correct message', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Trip succesvol aangemaakt"
        type="success"
        isVisible={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Trip succesvol aangemaakt')).toBeInTheDocument();
    expect(screen.getByLabelText('Sluit melding')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" isVisible={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Sluit melding'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isVisible is false', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" isVisible={false} onClose={onClose} />);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should auto-close after duration', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Test message"
        type="success"
        isVisible={true}
        onClose={onClose}
        duration={1000}
      />
    );

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show correct icon for error type', () => {
    const onClose = jest.fn();
    render(<Toast message="Error message" type="error" isVisible={true} onClose={onClose} />);

    // Should show error icon (exclamation triangle)
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
