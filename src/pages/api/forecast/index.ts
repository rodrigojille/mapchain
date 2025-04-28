import { NextApiRequest, NextApiResponse } from 'next';
import { ForecastService } from '../../../services/ForecastService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { propertyId, timeframe, includeMarketFactors, includeNeighborhoodTrends, includeEconomicIndicators } = req.body;

    // Validate required fields
    if (!propertyId || !timeframe) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID and timeframe are required' 
      });
    }

    const forecastService = new ForecastService();
    const forecast = await forecastService.generateForecast({
      propertyId,
      timeframe,
      includeMarketFactors,
      includeNeighborhoodTrends,
      includeEconomicIndicators
    });

    return res.status(200).json(forecast);
  } catch (error: any) {
    console.error('Forecast API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
