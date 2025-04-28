import { NextApiRequest, NextApiResponse } from 'next';
import AuthService from '../../../services/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name, role, walletAddress } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!password && !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either password or wallet address is required' 
      });
    }

    // Register user
    const result = await AuthService.register({
      email,
      password,
      name,
      role,
      walletAddress
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
        token: result.token
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error: any) {
    console.error('Registration API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
