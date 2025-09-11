import React, { createContext, useContext } from 'react';

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  verificationStatus: string;
  preferredLanguage: string;
  qrCode: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};