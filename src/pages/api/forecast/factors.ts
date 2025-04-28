import { NextApiRequest, NextApiResponse } from 'next';
import { ForecastService } from '../../../services/ForecastService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { propertyId, timeframe } = req.body;

    // Validate required fields
    if (!propertyId || !timeframe) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID and timeframe are required' 
      });
    }

    const forecastService = new ForecastService();
    const factorImpact = await forecastService.getFactorImpact(propertyId, timeframe);

    return res.status(200).json(factorImpact);
  } catch (error: any) {
    console.error('Factor impact API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
