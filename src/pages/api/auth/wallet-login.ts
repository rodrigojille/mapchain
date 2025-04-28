import { NextApiRequest, NextApiResponse } from 'next';
import AuthService from '../../../services/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { walletAddress, signedMessage } = req.body;

    // Validate required fields
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet address is required' 
      });
    }

    // Login user with wallet
    const result = await AuthService.loginWithWallet({ 
      walletAddress, 
      signedMessage 
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error: any) {
    console.error('Wallet login API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
