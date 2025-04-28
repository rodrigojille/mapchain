import { UserRole, AuthMethod } from '../services/auth';

// Base user interface
export interface User {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  authMethod: AuthMethod;
  createdAt: string;
  isEmailVerified: boolean;
  walletAddresses: string[];
  profileImage?: string;
  bio?: string;
}

// Property owner specific data
export interface PropertyOwner extends User {
  properties: string[]; // Array of property IDs owned by the user
  valuationRequests: string[]; // Array of valuation request IDs
}

// Valuator specific data
export interface Valuator extends User {
  license?: string; // Professional license number
  specializations: string[]; // Areas of expertise
  experience: number; // Years of experience
  rating: number; // Average rating (1-5)
  completedValuations: number; // Number of valuations completed
  certifications: string[]; // Professional certifications
  availability: boolean; // Whether the valuator is currently accepting new requests
  fees: {
    standard: number; // Standard fee in USD
    urgent: number; // Urgent fee in USD
  };
}

// Admin specific data
export interface Admin extends User {
  permissions: string[]; // Array of permission keys
  lastLogin: string; // ISO date string
}

// Valuation request status
export enum ValuationRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

// Valuation request
export interface ValuationRequest {
  id: string;
  propertyId: string;
  requesterId: string;
  valuatorId?: string; // Optional until a valuator accepts the request
  status: ValuationRequestStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isUrgent: boolean;
  price: number;
  notes?: string;
  aiValuation?: {
    value: number;
    confidence: number;
    factors: Record<string, number>;
  };
  officialValuation?: {
    value: number;
    tokenId?: string; // Hedera token ID if tokenized
    report?: string; // IPFS hash of the valuation report
  };
}

// User notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
  link?: string; // Optional link to navigate to
}

// User settings
export interface UserSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP';
  language: string;
  privacySettings: {
    showProfile: boolean;
    showProperties: boolean;
    showValuations: boolean;
  };
}
