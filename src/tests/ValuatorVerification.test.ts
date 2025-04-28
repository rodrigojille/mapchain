import { describe, expect, test } from '@jest/globals';
import { ValuatorVerificationService } from '../services/ValuatorVerification';

describe('Valuator Verification System', () => {
  const verificationService = new ValuatorVerificationService();

  const mockValidProfile = {
    accountId: '0.0.12345',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    experience: 5,
    specializations: ['residential', 'commercial'],
    documents: [
      {
        type: 'license',
        documentId: 'LIC123',
        issuer: 'State Licensing Board',
        issuanceDate: '2023-01-01',
        expiryDate: '2025-01-01',
        ipfsHash: 'QmTestHash1'
      },
      {
        type: 'certification',
        documentId: 'CERT456',
        issuer: 'National Association of Realtors',
        issuanceDate: '2023-01-01',
        expiryDate: '2025-01-01',
        ipfsHash: 'QmTestHash2'
      },
      {
        type: 'insurance',
        documentId: 'INS789',
        issuer: 'State Licensing Board',
        issuanceDate: '2023-01-01',
        expiryDate: '2025-01-01',
        ipfsHash: 'QmTestHash3'
      },
      {
        type: 'identity',
        documentId: 'ID012',
        issuer: 'State Licensing Board',
        issuanceDate: '2023-01-01',
        expiryDate: '2025-01-01',
        ipfsHash: 'QmTestHash4'
      }
    ],
    verificationStatus: 'pending'
  };

  test('should verify valid valuator profile', async () => {
    const result = await verificationService.verifyValuator(mockValidProfile);

    expect(result.isVerified).toBe(true);
    expect(result.reasons).toBeUndefined();
  });

  test('should reject profile with missing documents', async () => {
    const incompleteProfile = {
      ...mockValidProfile,
      documents: mockValidProfile.documents.slice(0, 2)
    };

    const result = await verificationService.verifyValuator(incompleteProfile);

    expect(result.isVerified).toBe(false);
    expect(result.reasons).toContain('Missing required documents: insurance, identity');
  });

  test('should reject profile with insufficient experience', async () => {
    const inexperiencedProfile = {
      ...mockValidProfile,
      experience: 1
    };

    const result = await verificationService.verifyValuator(inexperiencedProfile);

    expect(result.isVerified).toBe(false);
    expect(result.reasons).toContain('Minimum 2 years of experience required');
  });

  test('should reject profile with invalid contact info', async () => {
    const invalidContactProfile = {
      ...mockValidProfile,
      email: 'invalid-email',
      phone: '123'
    };

    const result = await verificationService.verifyValuator(invalidContactProfile);

    expect(result.isVerified).toBe(false);
    expect(result.reasons).toContain('Unable to verify contact information');
  });

  test('should check verification status', async () => {
    const status = await verificationService.getVerificationStatus('0.0.12345');

    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('lastChecked');
    expect(status).toHaveProperty('expiryDate');
    expect(['pending', 'verified', 'rejected']).toContain(status.status);
  });
});
