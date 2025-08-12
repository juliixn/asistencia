
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Employee } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchEmployees, seedInitialData } from '@/lib/api';

interface AuthContextType {
  user: { uid: string } | null;
  employee: Employee | null; 
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setEmployee: (employee: Employee | null) => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    employee: null, 
    loading: true,
    login: async () => {},
    logout: () => {},
    setEmployee: () => {},
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeApp = async () => {
      // Ensure data is seeded before attempting to log in
      await seedInitialData();
      try {
          const storedEmployee = sessionStorage.getItem('currentEmployee');
          if (storedEmployee) {
              setEmployee(JSON.parse(storedEmployee));
          }
      } catch (error) {
          console.error("Could not parse employee from session storage", error);
          sessionStorage.removeItem('currentEmployee');
      } finally {
          setLoading(false);
      }
    };
    initializeApp();
  }, []);
  
  const handleSetEmployee = useCallback((newEmployee: Employee | null) => {
    setEmployee(newEmployee);
    if (newEmployee) {
      sessionStorage.setItem('currentEmployee', JSON.stringify(newEmployee));
    } else {
      sessionStorage.removeItem('currentEmployee');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const employees = await fetchEmployees();
    const foundEmployee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());

    if (foundEmployee && foundEmployee.role !== 'Guardia' && foundEmployee.password === password) {
      handleSetEmployee(foundEmployee);
    } else {
      throw new Error('Las credenciales proporcionadas son incorrectas.');
    }
  }, [handleSetEmployee]);

  const logout = useCallback(() => {
    handleSetEmployee(null);
    queryClient.clear();
  }, [handleSetEmployee, queryClient]);
  
  const user = employee ? { uid: employee.id } : null;

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout, setEmployee: handleSetEmployee }}>
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
