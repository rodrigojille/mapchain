import { NextApiRequest, NextApiResponse } from 'next';
import { HederaService } from '../../../services/HederaIntegration';
import { prisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Parse form data
    const form = formidable({ multiples: true });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Validate required fields
    const {
      propertyName,
      propertySymbol,
      propertyValue,
      totalTokens,
      propertyDescription,
    } = fields;

    if (!propertyName || !propertySymbol || !propertyValue || !totalTokens) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Initialize Hedera service
    const hederaService = new HederaService();

    // Create token
    const result = await hederaService.createToken({
      name: propertyName as string,
      symbol: propertySymbol as string,
      initialSupply: parseInt(totalTokens as string),
      decimals: 0,
      treasury: session.user.walletAddress,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create token',
      });
    }

    // Save token information to database
    const tokenizedAsset = await prisma.tokenizedAsset.create({
      data: {
        propertyId: req.query.propertyId as string,
        ownerId: session.user.id,
        tokenId: result.tokenId!,
        tokenSymbol: propertySymbol as string,
        tokenName: propertyName as string,
        transactionId: result.transactionId!,
        metadata: {
          description: propertyDescription,
          value: parseFloat(propertyValue as string),
          totalSupply: parseInt(totalTokens as string),
        },
        status: 'ACTIVE',
      },
    });

    return res.status(200).json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      tokenizedAsset,
    });
  } catch (error: any) {
    console.error('Tokenization error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
