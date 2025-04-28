import React, { useState } from 'react';
import { useHederaContract } from '../hooks/useHederaContract';
import { useWallet } from '../hooks/useWallet';

export const ContractTest: React.FC = () => {
  const wallet = useWallet();
  const {
    mintProperty,
    getPropertyMetadata,
    createValuation,
    getValuatorStats,
    createEscrow,
    createValuationToken,
    mintValuationToken
  } = useHederaContract();

  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runTests = async () => {
    try {
      setStatus('Starting tests...');

      // Test 1: Create and mint a valuation token
      setStatus('Test 1: Creating valuation token...');
      const tokenId = await createValuationToken('Test Token', 'TEST');
      if (!tokenId) throw new Error('Failed to create token');
      setStatus(`Created token with ID: ${tokenId}`);

      setStatus('Minting valuation token...');
      await mintValuationToken(tokenId, 'QmTestMetadataHash');
      setStatus('Successfully minted token');

      // Test 2: Create a property
      setStatus('Test 2: Creating property...');
      const propertyId = await mintProperty('TEST123', 'QmPropertyMetadataHash');
      setStatus(`Created property with ID: ${propertyId}`);

      // Test 3: Create a valuation
      setStatus('Test 3: Creating valuation...');
      const valuationStatus = await createValuation(propertyId, 100000, 'QmValuationMetadataHash', true);
      setStatus(`Created valuation with status: ${valuationStatus}`);

      // Test 4: Get valuator stats
      setStatus('Test 4: Getting valuator stats...');
      const stats = await getValuatorStats(wallet.accountId || '');
      setStatus(`Valuator stats: ${JSON.stringify(stats)}`);

      // Test 5: Create escrow
      setStatus('Test 5: Creating escrow...');
      const escrowStatus = await createEscrow('REQ123', wallet.accountId || '', 1000, false);
      setStatus(`Created escrow with status: ${escrowStatus}`);

      setStatus('All tests completed successfully!');
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Tests failed');
    }
  };

  if (!wallet.accountId) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contract Test Suite</h1>
      
      <button
        onClick={runTests}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Run Tests
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Status:</h2>
        <pre className="bg-gray-100 p-2 rounded">{status}</pre>
      </div>

      {error && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-red-600">Error:</h2>
          <pre className="bg-red-100 p-2 rounded text-red-700">{error}</pre>
        </div>
      )}
    </div>
  );
};
