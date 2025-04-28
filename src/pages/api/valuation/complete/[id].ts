import { NextApiRequest, NextApiResponse } from 'next';
import { ValuationService } from '../../../../services/ValuationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { valuationAmount, valuationReport, factors } = req.body;

    if (!id || !valuationAmount || !valuationReport || !factors) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const valuationService = new ValuationService();
    const result = await valuationService.completeValuation(id as string, {
      valuationAmount,
      valuationReport,
      factors
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Complete Valuation API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
