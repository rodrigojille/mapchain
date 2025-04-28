import { NextApiRequest, NextApiResponse } from 'next';
import { ValuationService } from '../../../services/ValuationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const valuationService = new ValuationService();
    const metrics = await valuationService.getValuatorMetrics();

    return res.status(200).json(metrics);
  } catch (error: any) {
    console.error('Valuator Metrics API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
