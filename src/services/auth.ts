import { User } from '../types/user';
import { createContext, useContext } from 'react';

// Define user roles
export enum UserRole {
  GUEST = 'guest',
  PROPERTY_OWNER = 'property_owner',
  VALUATOR = 'valuator',
  ADMIN = 'admin'
}

// Define authentication methods
export enum AuthMethod {
  EMAIL = 'email',
  WALLET = 'wallet',
  GUEST = 'guest'
}

// Auth service interface
export interface AuthService {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithWallet: (walletAddress: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<User>;
  registerWithWallet: (walletAddress: string, name: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<User>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

// Mock implementation for development
export class MockAuthService implements AuthService {
  private _currentUser: User | null = null;
  private _isLoading: boolean = false;

  get currentUser(): User | null {
    return this._currentUser;
  }

  get isAuthenticated(): boolean {
    return !!this._currentUser;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  async login(email: string, password: string): Promise<User> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role: UserRole.PROPERTY_OWNER,
        authMethod: AuthMethod.EMAIL,
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
        walletAddresses: []
      };
      
      this._currentUser = user;
      localStorage.setItem('mapchain_user', JSON.stringify(user));
      
      return user;
    } finally {
      this._isLoading = false;
    }
  }

  async loginWithWallet(walletAddress: string): Promise<User> {
    this._isLoading = true;
    
    try {
      // Try to find an existing user in localStorage
      const storedUser = localStorage.getItem('mapchain_user');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        if (user.walletAddresses && user.walletAddresses.includes(walletAddress)) {
          this._currentUser = user;
          return user;
        }
      }
      // Otherwise, create a new mock user
      const user: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: null,
        name: 'Wallet User ' + walletAddress.substring(0, 6),
        role: UserRole.PROPERTY_OWNER,
        authMethod: AuthMethod.WALLET,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        walletAddresses: [walletAddress]
      };
      this._currentUser = user;
      localStorage.setItem('mapchain_user', JSON.stringify(user));
      return user;
    } finally {
      this._isLoading = false;
    }
  }

  async register(email: string, password: string, name: string, role: UserRole): Promise<User> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        role,
        authMethod: AuthMethod.EMAIL,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        walletAddresses: []
      };
      
      this._currentUser = user;
      localStorage.setItem('mapchain_user', JSON.stringify(user));
      
      return user;
    } finally {
      this._isLoading = false;
    }
  }

  async registerWithWallet(walletAddress: string, name: string, role: UserRole): Promise<User> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: null,
        name,
        role,
        authMethod: AuthMethod.WALLET,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        walletAddresses: [walletAddress]
      };
      
      this._currentUser = user;
      localStorage.setItem('mapchain_user', JSON.stringify(user));
      
      return user;
    } finally {
      this._isLoading = false;
    }
  }

  async logout(): Promise<void> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this._currentUser = null;
      localStorage.removeItem('mapchain_user');
    } finally {
      this._isLoading = false;
    }
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    this._isLoading = true;
    
    try {
      if (!this._currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser: User = {
        ...this._currentUser,
        ...userData
      };
      
      this._currentUser = updatedUser;
      localStorage.setItem('mapchain_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } finally {
      this._isLoading = false;
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } finally {
      this._isLoading = false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } finally {
      this._isLoading = false;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    this._isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this._currentUser) {
        this._currentUser.isEmailVerified = true;
        localStorage.setItem('mapchain_user', JSON.stringify(this._currentUser));
      }
      
      return true;
    } finally {
      this._isLoading = false;
    }
  }

  // Initialize from localStorage on app start
  initialize() {
    const storedUser = localStorage.getItem('mapchain_user');
    if (storedUser) {
      try {
        this._currentUser = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('mapchain_user');
      }
    }
  }
}

// Create auth context for React
export const AuthContext = createContext<AuthService>(new MockAuthService());

// Hook for using auth in components
export const useAuth = () => useContext(AuthContext);
