
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Employee } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchEmployees } from '@/lib/api';

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

  // Check for a logged-in user in session storage on initial load
  useEffect(() => {
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

    // User exists, is not a guard, and password matches
    if (foundEmployee && foundEmployee.role !== 'Guardia' && foundEmployee.password === password) {
      handleSetEmployee(foundEmployee);
    } else {
      // If user is not found, or is a guard, or password doesn't match
      throw new Error('Invalid credentials');
    }
  }, [handleSetEmployee]);

  const logout = useCallback(() => {
    handleSetEmployee(null);
    // Clear react-query cache on logout to ensure fresh data for next user
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
