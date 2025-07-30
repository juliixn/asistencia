
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Employee } from '@/lib/types';

// This context is now a mock provider to grant full access in the offline version.
interface AuthContextType {
  user: object | null;
  employee: Employee | null;
  loading: boolean;
}

const defaultEmployee: Employee = {
    id: 'local-admin',
    name: 'Administrador Local',
    email: 'local@admin.com',
    role: 'Dirección',
    shiftRate: 1500,
};

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);

  // In the offline version, we are always "logged in" as a Director.
  const user = { uid: 'local-admin' };
  const employee = defaultEmployee;

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, employee, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
