export interface Valuation {
  amount: number;
  currency: string;
  timestamp: number;
  validatorId: string;
  transactionId: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Owner {
  accountId: string;
  name?: string;
}

export interface Metadata {
  createdAt: number;
  updatedAt: number;
  ipfsHash: string;
}

export interface Property {
  id: string;              // Unique identifier
  tokenId: string;          // Hedera NFT token ID
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  size: number;             // in square meters
  price: number;            // Property price
  landType: 'urban' | 'solar' | 'building' | 'commercial' | 'residential' | 'industrial';
  images: string[];        // IPFS hashes
  latestValuation?: {
    amount: number;
    currency: string;
    timestamp: number;     // Unix timestamp
    validatorId: string;  // Hedera account ID of validator
    transactionId: string; // Hedera transaction ID
  };
  // Property features for AI valuation
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lastSalePrice?: number;
  lastSaleDate?: number;
  features?: {
    floors?: number;
    hasParking?: boolean;
    hasGarden?: boolean;
  };
  owner: {
    accountId: string;    // Hedera account ID
    name?: string;
  };
  metadata: {
    createdAt: number;    // Unix timestamp
    updatedAt: number;    // Unix timestamp
    ipfsHash: string;     // IPFS hash of complete metadata
  };
}
