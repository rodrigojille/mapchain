const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    ".*hooks\/useHederaContract": "<rootDir>/src/__mocks__/useHederaContract.ts",
    ".*hooks\/useWallet": "<rootDir>/src/__mocks__/useWallet.ts"
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/']
};

module.exports = createJestConfig(customJestConfig);
