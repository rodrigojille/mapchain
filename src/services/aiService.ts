import axios from 'axios';

// Types for AI service requests and responses
export interface PropertyFeatures {
  size: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  location_lat: number;
  location_lng: number;
  previous_value?: number;
  last_sale_date?: string;
}

export interface ValuationRequest {
  property_id: string;
  features: PropertyFeatures;
}

export interface ValuationResponse {
  property_id: string;
  estimated_value: number;
  confidence_score: number;
  timestamp: string;
  explanation?: string;
}

export interface PropertyAnalysisRequest {
  property_id: string;
  features: PropertyFeatures;
  comparable_properties?: any[];
  market_trends?: any;
}

export interface PropertyAnalysisResponse {
  property_id: string;
  valuation: {
    estimated_value: number;
    confidence_score: number;
    explanation: string;
  };
  market_insights: any;
  investment_potential: any;
  timestamp: string;
}

// Base URL for AI service
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Get an AI-powered valuation for a property
 */
export const getPropertyValuation = async (request: ValuationRequest): Promise<ValuationResponse> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, request);
    return response.data;
  } catch (error) {
    console.error('Error getting property valuation:', error);
    throw new Error('Failed to get property valuation');
  }
};

/**
 * Get comprehensive property analysis including market insights and investment potential
 */
export const getPropertyAnalysis = async (request: PropertyAnalysisRequest): Promise<PropertyAnalysisResponse> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, request);
    return response.data;
  } catch (error) {
    console.error('Error getting property analysis:', error);
    throw new Error('Failed to get property analysis');
  }
};

/**
 * Convert RentCast property data to the format needed for AI analysis
 */
export const convertPropertyForAnalysis = (property: any): PropertyFeatures => {
  return {
    size: property.features?.squareFootage || 0,
    bedrooms: property.features?.bedrooms || 0,
    bathrooms: property.features?.bathrooms || 0,
    year_built: property.features?.yearBuilt || new Date().getFullYear() - 30, // Estimate if not available
    location_lat: property.location?.lat || 0,
    location_lng: property.location?.lng || 0,
    previous_value: property.valuation?.previousValue || property.valuation?.value || 0,
    last_sale_date: property.lastSaleDate || null
  };
};

/**
 * Get property valuation and analysis in one call
 */
export const getCompletePropertyInsights = async (propertyId: string, propertyData: any): Promise<{
  valuation: ValuationResponse;
  analysis: PropertyAnalysisResponse | null;
}> => {
  try {
    // Convert property data to the format needed for AI
    const features = convertPropertyForAnalysis(propertyData);
    
    // Get valuation
    const valuationRequest: ValuationRequest = {
      property_id: propertyId,
      features
    };
    
    const valuation = await getPropertyValuation(valuationRequest);
    
    // Try to get analysis if valuation was successful
    let analysis = null;
    if (valuation && valuation.estimated_value > 0) {
      try {
        const analysisRequest: PropertyAnalysisRequest = {
          property_id: propertyId,
          features,
          comparable_properties: propertyData.comparableProperties || [],
          market_trends: propertyData.marketTrends || {}
        };
        
        analysis = await getPropertyAnalysis(analysisRequest);
      } catch (analysisError) {
        console.error('Error getting property analysis:', analysisError);
        // Continue with just the valuation
      }
    }
    
    return {
      valuation,
      analysis
    };
  } catch (error) {
    console.error('Error getting property insights:', error);
    throw new Error('Failed to get property insights');
  }
};
