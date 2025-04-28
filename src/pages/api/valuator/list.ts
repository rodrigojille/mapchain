import type { NextApiRequest, NextApiResponse } from 'next';
import { ValuatorService } from '../../../services/ValuatorService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const valuatorService = new ValuatorService();
    const valuators = await valuatorService.getAllValuators();
    return res.status(200).json({ success: true, valuators });
  } catch (error: any) {
    console.error('Valuator List API error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
