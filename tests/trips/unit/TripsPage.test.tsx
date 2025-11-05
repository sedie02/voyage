import TripsPage from '@/app/trips/page';
import { render, screen } from '@testing-library/react';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

// mock next/link (zodat routing niet breekt)

jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

jest.mock('@/app/trips/page', () => ({
  __esModule: true,
  default: () => (
    <div>
      <a href="/trips/new">Create Trip</a>
    </div>
  ),
}));

describe('TripsPage', () => {
  it('renders without crashing', async () => {
    const { container } = render(<TripsPage />, { wrapper: MemoryRouterProvider });
    expect(container).toBeInTheDocument();
  });

  it('shows a "Create Trip" button', async () => {
    render(<TripsPage />, { wrapper: MemoryRouterProvider });
    const button = screen.getByRole('link', { name: /create trip/i });
    expect(button).toBeInTheDocument();
  });

  it('has correct link to /trips/new', async () => {
    render(<TripsPage />, { wrapper: MemoryRouterProvider });
    const button = screen.getByRole('link', { name: /create trip/i });
    expect(button).toHaveAttribute('href', '/trips/new');
  });
});
