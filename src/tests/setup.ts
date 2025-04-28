import { expect } from '@jest/globals';
import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock process.env
process.env = {
  ...process.env,
  NEXT_PUBLIC_VALUATION_CONTRACT_ID: '0.0.123456',
  NEXT_PUBLIC_ESCROW_CONTRACT_ID: '0.0.123457',
  NEXT_PUBLIC_HEDERA_NETWORK: 'testnet',
};

export const setupTestEnvironment = async () => {
  // Create test client
  const testClient = Client.forTestnet();

  // Generate test accounts
  const operatorKey = PrivateKey.generateED25519();
  const operatorId = await createTestAccount(testClient, operatorKey);

  testClient.setOperator(operatorId, operatorKey);

  return {
    client: testClient,
    operatorId,
    operatorKey
  };
};

export const createTestAccount = async (
  client: Client,
  privateKey: PrivateKey
) => {
  // Implementation would create a test account on Hedera testnet
  // For tests, we'll use a mock account
  return AccountId.fromString('0.0.12345');
};

export const deployTestContracts = async (
  client: Client,
  operatorKey: PrivateKey
) => {
  // Implementation would deploy contracts to testnet
  // Return mock contract IDs for testing
  return {
    propertyNftId: '0.0.123456',
    valuationTokenId: '0.0.123457',
    escrowId: '0.0.123458'
  };
};
