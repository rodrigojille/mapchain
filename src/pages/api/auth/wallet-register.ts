import { NextApiRequest, NextApiResponse } from 'next';
import AuthService from '../../../services/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { walletAddress, name, role } = req.body;

    // Validate required fields
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet address is required' 
      });
    }

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

    if (!role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role is required' 
      });
    }

    // Register user with wallet
    const result = await AuthService.register({
      walletAddress,
      name,
      role,
      email: `${walletAddress.toLowerCase()}@hedera.wallet` // Generate email for wallet users
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('Wallet registration API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
