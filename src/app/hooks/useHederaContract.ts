export function useHederaContract() {
  return {
    isReady: true,
    mintProperty: async (propertyId: string, metadataHash: string) => 'dummy-property-id',
    getPropertyMetadata: async (tokenId: string) => {},
    createValuation: async (propertyTokenId: string, value: number, metadataUri: string, isOfficial: boolean) => 'SUCCESS',
    getValuatorStats: async (valuatorId: string) => ({
      completedJobs: 5,
      totalEarnings: 1000,
      averageRating: 4.5,
      responseRate: 80
    }),
    createEscrow: async (requestId: string, valuatorId: string, amount: number, isUrgent: boolean) => 'SUCCESS',
    createValuationToken: async (name: string, symbol: string) => 'dummy-token-id',
    mintValuationToken: async (tokenId: string, metadataUri: string) => 'SUCCESS',
    acceptValuationRequest: async (valuatorId: string, reqId: string) => 'SUCCESS',
    declineValuationRequest: async (valuatorId: string, reqId: string) => 'SUCCESS'
  };
}
