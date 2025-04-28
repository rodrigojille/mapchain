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
      nftName,
      nftSymbol,
      nftDescription,
      royaltyFee,
    } = fields;

    if (!nftName || !nftSymbol) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate symbol format
    if (!/^[A-Z0-9]+$/.test(nftSymbol as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token symbol format',
      });
    }

    // Initialize Hedera service
    const hederaService = new HederaService();

    // Create NFT
    const result = await hederaService.createNFT({
      name: nftName as string,
      symbol: nftSymbol as string,
      maxSupply: 1,
      royaltyFee: parseFloat(royaltyFee as string) || 0,
      treasury: session.user.walletAddress,
      metadata: {
        description: nftDescription,
        creator: session.user.name,
        createdAt: new Date().toISOString(),
      },
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create NFT',
      });
    }

    // Save NFT information to database
    const nft = await prisma.nft.create({
      data: {
        ownerId: session.user.id,
        tokenId: result.tokenId!,
        serialNumber: result.serialNumber!,
        tokenSymbol: nftSymbol as string,
        tokenName: nftName as string,
        transactionId: result.transactionId!,
        metadata: {
          description: nftDescription,
          royaltyFee: parseFloat(royaltyFee as string) || 0,
        },
        status: 'ACTIVE',
      },
    });

    return res.status(200).json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      serialNumber: result.serialNumber,
      nft,
    });
  } catch (error: any) {
    console.error('NFT creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
