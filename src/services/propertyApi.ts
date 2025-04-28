// MapChain Property API Service
// This service provides property data for the application

// Types for property data
export interface PropertyData {
  tokenId?: string; // Optional Hedera token ID if tokenized
  id: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    yearBuilt: number;
    lotSize?: number;
    propertyType: string;
  };
  valuation: {
    value: number;
    rentEstimate: number;
    lastSalePrice?: number;
    lastSaleDate?: string;
  };
  images: string[];
}

// Function to search properties by location
export async function searchPropertiesByLocation(
  latitude: number, 
  longitude: number, 
  radius: number = 1, // miles
  limit: number = 20
): Promise<PropertyData[]> {
  console.log('Fetching properties near:', latitude, longitude);
  // Return mock data
  return getMockProperties([latitude, longitude], limit);
}

// Function to get property details by ID
export async function getPropertyById(id: string): Promise<PropertyData | null> {
  console.log('Fetching property with ID:', id);
  // Generate mock properties and find the one with matching ID
  const mockProperties = getMockProperties([0, 0], 20);
  const property = mockProperties.find(p => p.id === id);
  
  // Return the found property or the first one as fallback
  return property || mockProperties[0];
}

// Function to get property market data by zip code
export async function getMarketDataByZipCode(zipCode: string) {
  console.log('Fetching market data for zip code:', zipCode);
  // Return mock market data
  return {
    medianPrice: 450000,
    medianRent: 2200,
    priceToRentRatio: 17.5,
    averageDaysOnMarket: 32,
    inventoryCount: 125,
    monthlySupply: 3.2,
    yearOverYearChange: 5.8,
    marketHealth: 'Strong',
    trends: {
      lastThreeMonths: 2.3,
      lastSixMonths: 4.1,
      lastYear: 5.8
    }
  };
}

// Fallback mock data in case API is not available
export const getMockProperties = (center: [number, number], count: number = 20): PropertyData[] => {
  const properties: PropertyData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random coordinates around the center
    const lat = center[0] + (Math.random() - 0.5) * 0.05;
    const lng = center[1] + (Math.random() - 0.5) * 0.05;
    
    // Generate random property data
    properties.push({
      id: `property-${i}`,
      address: {
        line1: `${1000 + i} Main St`,
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      location: {
        lat,
        lng,
      },
      features: {
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        squareFootage: Math.floor(Math.random() * 2000) + 800,
        yearBuilt: Math.floor(Math.random() * 50) + 1970,
        propertyType: Math.random() > 0.3 ? 'Single Family' : 'Condo',
      },
      valuation: {
        value: Math.floor(Math.random() * 1000000) + 200000,
        rentEstimate: Math.floor(Math.random() * 3000) + 1000,
        lastSalePrice: Math.floor(Math.random() * 900000) + 150000,
        lastSaleDate: `${2010 + Math.floor(Math.random() * 13)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      },
      images: [
        `https://source.unsplash.com/random/800x600?house&sig=${i}1`,
        `https://source.unsplash.com/random/800x600?house&sig=${i}2`,
        `https://source.unsplash.com/random/800x600?house&sig=${i}3`,
      ],
    });
  }
  
  return properties;
};
