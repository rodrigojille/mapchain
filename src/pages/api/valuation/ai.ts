import { NextApiRequest, NextApiResponse } from 'next';
import { ValuationService } from '../../../services/ValuationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    const valuationService = new ValuationService();
    const aiValuation = await valuationService.generateAIValuation(propertyId);

    return res.status(200).json(aiValuation);
  } catch (error: any) {
    console.error('AI Valuation API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
