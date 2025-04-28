// Create mock wallet state
const mockWalletState = {
  accountId: '0.0.12345',
  isConnected: true,
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined)
};

// Mock the hook
const useWallet = jest.fn().mockReturnValue(mockWalletState);

export { useWallet, mockWalletState };
