import { NextApiRequest, NextApiResponse } from 'next';
import { ValuationService } from '../../../services/ValuationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { propertyId, valuatorId } = req.body;

    if (!propertyId || !valuatorId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and valuator ID are required'
      });
    }

    const valuationService = new ValuationService();
    const request = await valuationService.createValuationRequest(propertyId, valuatorId);

    return res.status(201).json(request);
  } catch (error: any) {
    console.error('Valuation Request API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
