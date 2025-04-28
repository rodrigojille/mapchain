import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, jest } from '@jest/globals';
import ValuatorDashboard from '../app/valuator/dashboard/page';
import { useHederaContract } from '../hooks/useHederaContract';
import { useWallet } from '../hooks/useWallet';

jest.mock('../hooks/useHederaContract');
jest.mock('../hooks/useWallet');

describe('Valuator Dashboard', () => {
  const mockStats = {
    completedJobs: 15,
    totalEarnings: 5000,
    averageRating: 4.8,
    responseRate: 95
  };

  const mockRequests = [
    {
      id: 'req-1',
      propertyId: '0.0.123456',
      propertyTitle: 'Modern Villa',
      requestedAt: Date.now() - 86400000, // 1 day ago
      urgency: 'urgent',
      status: 'pending',
      estimatedFee: 1000
    },
    {
      id: 'req-2',
      propertyId: '0.0.123457',
      propertyTitle: 'Commercial Space',
      requestedAt: Date.now() - 43200000, // 12 hours ago
      urgency: 'normal',
      status: 'pending',
      estimatedFee: 800
    }
  ];

  beforeEach(() => {
    // Mock wallet connection
    (useWallet as jest.Mock).mockReturnValue({
      accountId: '0.0.12345',
      isConnected: true
    });

    // Mock Hedera contract interactions
    (useHederaContract as jest.Mock).mockReturnValue({
      getValuatorStats: jest.fn().mockResolvedValue(mockStats),
      isReady: true
    });

    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/valuator/requests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRequests)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders dashboard with stats', async () => {
    render(<ValuatorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Completed Jobs
      expect(screen.getByText('$5,000')).toBeInTheDocument(); // Total Earnings
      expect(screen.getByText('4.8/5.0')).toBeInTheDocument(); // Average Rating
      expect(screen.getByText('95%')).toBeInTheDocument(); // Response Rate
    });
  });

  test('displays pending valuation requests', async () => {
    render(<ValuatorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Modern Villa')).toBeInTheDocument();
      expect(screen.getByText('Commercial Space')).toBeInTheDocument();
    });

    // Verify request details
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('normal')).toBeInTheDocument();
  });

  test('handles request acceptance', async () => {
    const mockAcceptRequest = jest.fn().mockResolvedValue({ success: true });
    (useHederaContract as jest.Mock).mockReturnValue({
      ...useHederaContract(),
      acceptValuationRequest: mockAcceptRequest
    });

    render(<ValuatorDashboard />);

    await waitFor(() => {
      const acceptButtons = screen.getAllByText('Accept');
      fireEvent.click(acceptButtons[0]);
    });

    expect(mockAcceptRequest).toHaveBeenCalledWith('req-1');
  });

  test('handles request decline', async () => {
    const mockDeclineRequest = jest.fn().mockResolvedValue({ success: true });
    (useHederaContract as jest.Mock).mockReturnValue({
      ...useHederaContract(),
      declineValuationRequest: mockDeclineRequest
    });

    render(<ValuatorDashboard />);

    await waitFor(() => {
      const declineButtons = screen.getAllByText('Decline');
      fireEvent.click(declineButtons[0]);
    });

    expect(mockDeclineRequest).toHaveBeenCalledWith('req-1');
  });

  test('shows empty state when no requests', async () => {
    // Mock empty requests
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    render(<ValuatorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('No pending requests at the moment.')
      ).toBeInTheDocument();
    });
  });

  test('handles error states', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ValuatorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('Error loading dashboard data')
      ).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('updates request list after action', async () => {
    const mockAcceptRequest = jest.fn().mockResolvedValue({ success: true });
    (useHederaContract as jest.Mock).mockReturnValue({
      ...useHederaContract(),
      acceptValuationRequest: mockAcceptRequest
    });

    render(<ValuatorDashboard />);

    // Accept a request
    await waitFor(() => {
      const acceptButtons = screen.getAllByText('Accept');
      fireEvent.click(acceptButtons[0]);
    });

    // Verify fetch is called again to refresh the list
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('displays urgent request indicators', async () => {
    render(<ValuatorDashboard />);

    await waitFor(() => {
      const urgentBadge = screen.getByText('urgent');
      expect(urgentBadge).toHaveClass('bg-red-100 text-red-800');
    });
  });

  test('formats dates correctly', async () => {
    render(<ValuatorDashboard />);

    await waitFor(() => {
      // Check if dates are formatted as expected (e.g., "1 day ago", "12 hours ago")
      expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
      expect(screen.getByText(/12 hours ago/i)).toBeInTheDocument();
    });
  });
});
