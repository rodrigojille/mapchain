import { useState, useEffect } from 'react';
import { Button, Container, Paper, Text, Title, Group, Stack, Alert, Code, Loader } from '@mantine/core';
import { useHederaContract } from '../hooks/useHederaContract';
import { useWallet } from '../hooks/useWallet';

// Test data
const PROPERTY_NAME = 'Test Property';
const PROPERTY_SYMBOL = 'TPROP';
const VALUATION_NAME = 'Test Valuation';
const VALUATION_SYMBOL = 'TVAL';
const METADATA_HASH = JSON.stringify({
  address: '123 Test Street, New York, NY 10001',
  size: 2000,
  bedrooms: 3,
  bathrooms: 2,
  yearBuilt: 2010,
  lastSalePrice: 500000,
  lastSaleDate: '2020-01-01'
});

interface TestResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export default function TestHedera() {
  const wallet = useWallet();
  const hederaContract = useHederaContract();
  const [isConnected, setIsConnected] = useState(false);
  const [propertyTokenId, setPropertyTokenId] = useState<string | null>(null);
  const [valuationTokenId, setValuationTokenId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({
    walletConnection: { status: 'pending', message: 'Not started' },
    createPropertyNFT: { status: 'pending', message: 'Not started' },
    mintPropertyNFT: { status: 'pending', message: 'Not started' },
    createValuationToken: { status: 'pending', message: 'Not started' },
    mintValuationToken: { status: 'pending', message: 'Not started' },
    createValuation: { status: 'pending', message: 'Not started' },
  });
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    if (wallet.accountId) {
      setIsConnected(true);
      updateTestResult('walletConnection', 'success', `Connected to account: ${wallet.accountId}`);
    } else {
      setIsConnected(false);
      updateTestResult('walletConnection', 'pending', 'Not connected');
    }
  }, [wallet.accountId]);

  const updateTestResult = (
    testName: string, 
    status: 'success' | 'error' | 'pending', 
    message: string, 
    data?: any
  ) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { status, message, data }
    }));
  };

  const runAllTests = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsRunningTests(true);

    try {
      // Test 1: Create Property NFT
      updateTestResult('createPropertyNFT', 'pending', 'Creating property NFT...');
      const tokenId = await hederaContract.createValuationToken(PROPERTY_NAME, PROPERTY_SYMBOL);
      
      if (!tokenId) {
        updateTestResult('createPropertyNFT', 'error', 'Failed to create property NFT');
        setIsRunningTests(false);
        return;
      }
      
      setPropertyTokenId(tokenId);
      updateTestResult('createPropertyNFT', 'success', `Property NFT created with token ID: ${tokenId}`, { tokenId });

      // Test 2: Mint Property NFT
      updateTestResult('mintPropertyNFT', 'pending', 'Minting property NFT...');
      try {
        await hederaContract.mintValuationToken(tokenId, METADATA_HASH);
        updateTestResult('mintPropertyNFT', 'success', 'Property NFT minted successfully');
      } catch (error) {
        updateTestResult('mintPropertyNFT', 'error', `Error minting property NFT: ${error instanceof Error ? error.message : String(error)}`);
        setIsRunningTests(false);
        return;
      }

      // Test 3: Create Valuation Token
      updateTestResult('createValuationToken', 'pending', 'Creating valuation token...');
      const valTokenId = await hederaContract.createValuationToken(VALUATION_NAME, VALUATION_SYMBOL);
      
      if (!valTokenId) {
        updateTestResult('createValuationToken', 'error', 'Failed to create valuation token');
        setIsRunningTests(false);
        return;
      }
      
      setValuationTokenId(valTokenId);
      updateTestResult('createValuationToken', 'success', `Valuation token created with token ID: ${valTokenId}`, { tokenId: valTokenId });

      // Test 4: Mint Valuation Token
      updateTestResult('mintValuationToken', 'pending', 'Minting valuation token...');
      try {
        await hederaContract.mintValuationToken(valTokenId, METADATA_HASH);
        updateTestResult('mintValuationToken', 'success', 'Valuation token minted successfully');
      } catch (error) {
        updateTestResult('mintValuationToken', 'error', `Error minting valuation token: ${error instanceof Error ? error.message : String(error)}`);
        setIsRunningTests(false);
        return;
      }

      // Test 5: Create Valuation
      if (process.env.NEXT_PUBLIC_VALUATION_CONTRACT_ID) {
        updateTestResult('createValuation', 'pending', 'Creating valuation...');
        try {
          const result = await hederaContract.createValuation(
            tokenId,
            750000, // Valuation amount in USD
            'ipfs://QmTest123456789', // Metadata URI
            true // Official valuation
          );
          updateTestResult('createValuation', 'success', `Valuation created successfully: ${result}`);
        } catch (error) {
          updateTestResult('createValuation', 'error', `Error creating valuation: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        updateTestResult('createValuation', 'pending', 'Skipped - Valuation contract ID not configured');
      }

    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const renderTestResult = (name: string, result: TestResult) => {
    const color = result.status === 'success' ? 'green' : result.status === 'error' ? 'red' : 'blue';
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳';
    
    return (
      <Paper p="md" withBorder key={name}>
        <Group position="apart">
          <Text weight={500}>{name}</Text>
          <Text color={color}>{icon} {result.status.toUpperCase()}</Text>
        </Group>
        <Text size="sm" mt="xs">{result.message}</Text>
        {result.data && (
          <Code block mt="xs">
            {JSON.stringify(result.data, null, 2)}
          </Code>
        )}
      </Paper>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg">MapChain Hedera Contract Test</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group position="apart">
          <Text>Wallet Connection Status:</Text>
          <Text color={isConnected ? 'green' : 'red'}>
            {isConnected ? '✅ Connected' : '❌ Not Connected'}
          </Text>
        </Group>
        {isConnected && <Text size="sm">Account ID: {wallet.accountId}</Text>}
      </Paper>

      <Button 
        onClick={runAllTests} 
        disabled={!isConnected || isRunningTests}
        loading={isRunningTests}
        mb="lg"
        fullWidth
      >
        Run All Tests
      </Button>

      {isRunningTests && (
        <Alert color="blue" mb="md">
          <Group>
            <Loader size="sm" />
            <Text>Running tests... Please wait and approve any transaction requests in your wallet.</Text>
          </Group>
        </Alert>
      )}

      <Stack spacing="md">
        {Object.entries(testResults).map(([name, result]) => 
          renderTestResult(name, result)
        )}
      </Stack>
    </Container>
  );
}
