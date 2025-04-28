import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import { AuthContext, MockAuthService, AuthService } from '../services/auth';
import { useWallet } from '../hooks/useWallet';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authService] = useState<AuthService>(() => {
    const service = new MockAuthService();
    service.initialize();
    return service;
  });
  
  const wallet = useWallet();
  
  // Auto-login with wallet if connected
  useEffect(() => {
    const autoLoginWithWallet = async () => {
      if (wallet.accountId && !authService.isAuthenticated) {
        try {
          await authService.loginWithWallet(wallet.accountId);
        } catch (error) {
          console.error('Auto wallet login failed:', error);
        }
      }
    };
    
    autoLoginWithWallet();
  }, [wallet.accountId, authService]);

  return (
    <AuthContext.Provider value={authService}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth in components
export const useAuth = () => useContext(AuthContext);
