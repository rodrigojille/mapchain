import { describe, expect, test } from '@jest/globals';
import { AIValuationService } from '../services/AIValuation';
import { Property } from '../types/Property';

describe('AI Valuation System', () => {
  const aiService = new AIValuationService();

  const mockProperty: Property = {
    id: '123',
    tokenId: '0.0.123456',
    title: 'Test Property',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      coordinates: {
        latitude: 19.4326,
        longitude: -99.1332
      }
    },
    size: 150,
    landType: 'urban' as const,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2010,
    lastSalePrice: 250000,
    lastSaleDate: new Date('2023-01-15'),
    images: ['test-hash'],
    owner: {
      accountId: '0.0.12345',
      name: 'Test Owner'
    },
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ipfsHash: 'test-metadata-hash'
    }
  };

  test('should generate valuation with confidence score', async () => {
    const valuation = await aiService.generateValuation(mockProperty);

    expect(valuation).toBeDefined();
    expect(valuation.estimatedValue).toBeGreaterThan(0);
    expect(valuation.confidenceScore).toBeGreaterThan(0);
    expect(valuation.confidenceScore).toBeLessThanOrEqual(1);
    expect(valuation.factors).toBeInstanceOf(Array);
    expect(valuation.factors.length).toBe(4); // Location, Property Characteristics, Market History, AI Confidence
  });

  test('should include relevant valuation factors', async () => {
    const valuation = await aiService.generateValuation(mockProperty);

    const factorTypes = valuation.factors.map(f => f.factor);
    expect(factorTypes).toContain('Location');
    expect(factorTypes).toContain('Property Characteristics');
    expect(factorTypes).toContain('Market History');
    expect(factorTypes).toContain('AI Confidence');
  });

  test('should handle properties with missing data', async () => {
    const minimalProperty = {
      ...mockProperty,
      bedrooms: undefined,
      bathrooms: undefined,
      yearBuilt: undefined,
      lastSalePrice: undefined,
      lastSaleDate: undefined
    };

    const valuation = await aiService.generateValuation(minimalProperty);

    expect(valuation).toBeDefined();
    expect(valuation.estimatedValue).toBeGreaterThan(0);
    expect(valuation.confidenceScore).toBeGreaterThan(0);
    expect(valuation.confidenceScore).toBeLessThanOrEqual(1);
  });

  test('should handle API errors gracefully', async () => {
    // Temporarily change API URL to trigger error
    const originalUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL;
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    process.env.NEXT_PUBLIC_AI_SERVICE_URL = 'http://localhost:9999';

    await expect(aiService.generateValuation(mockProperty))
      .rejects
      .toThrow('Failed to connect to AI Service');

    // Reset environment
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv });
    process.env.NEXT_PUBLIC_AI_SERVICE_URL = originalUrl;
  });
});

