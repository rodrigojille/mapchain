/**
 * Custom hook for wallet integration
 * Provides wallet connection state and methods for the MapChain application
 */
export function useWallet() {
  return {
    accountId: '0.0.12345',
    isConnected: true,
    connect: async (): Promise<void> => {},
    disconnect: async (): Promise<void> => {}
  };
}
