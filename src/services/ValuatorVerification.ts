interface VerificationDocument {
  type: 'license' | 'certification' | 'insurance' | 'identity';
  documentId: string;
  issuer: string;
  issuanceDate: string;
  expiryDate: string;
  ipfsHash: string;
}

interface ValuatorProfile {
  accountId: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  specializations: string[];
  documents: VerificationDocument[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: string;
}

export class ValuatorVerificationService {
  private async verifyDocument(doc: VerificationDocument): Promise<boolean> {
    // In production, this would:
    // 1. Verify document authenticity with issuing authority
    // 2. Check document validity dates
    // 3. Verify document hasn't been tampered with using IPFS hash
    // 4. Check against blacklist database
    
    const isValid = await this.checkDocumentValidity(doc);
    const isAuthentic = await this.verifyDocumentAuthenticity(doc);
    const isNotExpired = new Date(doc.expiryDate) > new Date();

    return isValid && isAuthentic && isNotExpired;
  }

  private async checkDocumentValidity(doc: VerificationDocument): Promise<boolean> {
    // This would integrate with document verification APIs
    // For now, return true if document exists
    return !!doc.ipfsHash;
  }

  private async verifyDocumentAuthenticity(doc: VerificationDocument): Promise<boolean> {
    // This would verify with issuing authorities
    // For now, check if issuer is in our trusted list
    const trustedIssuers = [
      'National Association of Realtors',
      'Appraisal Institute',
      'State Licensing Board'
    ];
    
    return trustedIssuers.includes(doc.issuer);
  }

  public async verifyValuator(profile: ValuatorProfile): Promise<{
    isVerified: boolean;
    reasons?: string[];
  }> {
    try {
      const reasons: string[] = [];

      // 1. Check required documents
      const requiredDocs = ['license', 'certification', 'insurance', 'identity'];
      const missingDocs = requiredDocs.filter(
        reqDoc => !profile.documents.find(d => d.type === reqDoc)
      );

      if (missingDocs.length > 0) {
        reasons.push(`Missing required documents: ${missingDocs.join(', ')}`);
        return { isVerified: false, reasons };
      }

      // 2. Verify each document
      const documentVerifications = await Promise.all(
        profile.documents.map(async doc => ({
          type: doc.type,
          isValid: await this.verifyDocument(doc)
        }))
      );

      const invalidDocs = documentVerifications.filter(v => !v.isValid);
      if (invalidDocs.length > 0) {
        reasons.push(
          `Invalid documents: ${invalidDocs.map(d => d.type).join(', ')}`
        );
      }

      // 3. Check experience requirements
      if (profile.experience < 2) {
        reasons.push('Minimum 2 years of experience required');
      }

      // 4. Verify contact information
      const isContactValid = await this.verifyContactInfo(profile);
      if (!isContactValid) {
        reasons.push('Unable to verify contact information');
      }

      const isVerified = reasons.length === 0;

      // 5. If verified, grant VALUATOR_ROLE in smart contract
      if (isVerified) {
        await this.grantValuatorRole(profile.accountId);
      }

      return {
        isVerified,
        reasons: reasons.length > 0 ? reasons : undefined
      };
    } catch (error) {
      console.error('Error in valuator verification:', error);
      throw new Error('Verification process failed');
    }
  }

  private async verifyContactInfo(profile: ValuatorProfile): Promise<boolean> {
    // This would integrate with email/phone verification services
    // For now, check basic format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    return emailRegex.test(profile.email) && phoneRegex.test(profile.phone);
  }

  private async grantValuatorRole(accountId: string): Promise<void> {
    // This would call the ValuationToken contract to grant VALUATOR_ROLE
    // Implementation depends on your Hedera contract interaction setup
    try {
      // const contract = await getValuationContract();
      // await contract.grantRole(VALUATOR_ROLE, accountId);
    } catch (error) {
      console.error('Error granting valuator role:', error);
      throw new Error('Failed to grant valuator role');
    }
  }

  public async getVerificationStatus(accountId: string): Promise<{
    status: 'pending' | 'verified' | 'rejected';
    lastChecked: string;
    expiryDate?: string;
  }> {
    // This would check the verification status in your database
    // and the smart contract role status
    try {
      // const contract = await getValuationContract();
      // const hasRole = await contract.hasRole(VALUATOR_ROLE, accountId);
      
      return {
        status: 'pending',
        lastChecked: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw new Error('Failed to check verification status');
    }
  }
}
