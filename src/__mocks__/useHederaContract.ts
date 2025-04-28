// Create mock contract functions
const mockHederaContract = {
  isReady: true,
  mintProperty: jest.fn().mockResolvedValue('dummy-property-id'),
  getPropertyMetadata: jest.fn().mockResolvedValue({}),
  createValuation: jest.fn().mockResolvedValue('SUCCESS'),
  getValuationToken: jest.fn().mockResolvedValue('dummy-token-id'),
  getPropertyValuations: jest.fn().mockResolvedValue([]),
  getValuatorStats: jest.fn().mockResolvedValue({
    completedJobs: 5,
    totalEarnings: 1000,
    averageRating: 4.5,
    responseRate: 80
  }),
  createEscrow: jest.fn().mockResolvedValue('SUCCESS'),
  createValuationToken: jest.fn().mockResolvedValue('dummy-token-id'),
  mintValuationToken: jest.fn().mockResolvedValue('SUCCESS'),
  acceptValuationRequest: jest.fn().mockResolvedValue('SUCCESS'),
  declineValuationRequest: jest.fn().mockResolvedValue('SUCCESS')
};

// Mock the hook
const useHederaContract = jest.fn().mockReturnValue(mockHederaContract);

export { useHederaContract, mockHederaContract };
