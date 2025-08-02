
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Employee, EmployeeRole } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { initialData } from '@/lib/data';

interface AuthContextType {
  user: { uid: string } | null;
  employee: Employee | null; 
  loading: boolean;
  login: (role: EmployeeRole, name: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    employee: null, 
    loading: true,
    login: async () => {},
    logout: () => {},
});

// Helper to get all employees from localStorage
async function fetchAllEmployees(): Promise<Employee[]> {
    const data = localStorage.getItem('employees');
    // Initialize with mock data if it's empty
    if (!data) {
        localStorage.setItem('employees', JSON.stringify(initialData.employees));
        return initialData.employees;
    }
    return JSON.parse(data);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize local storage with mock data if it's empty
  useEffect(() => {
    const initLocalStorage = () => {
        if (!localStorage.getItem('employees')) {
            localStorage.setItem('employees', JSON.stringify(initialData.employees));
        }
        if (!localStorage.getItem('workLocations')) {
            localStorage.setItem('workLocations', JSON.stringify(initialData.workLocations));
        }
        if (!localStorage.getItem('loanRequests')) {
            localStorage.setItem('loanRequests', JSON.stringify(initialData.loanRequests));
        }
        if (!localStorage.getItem('attendanceRecords')) {
            localStorage.setItem('attendanceRecords', JSON.stringify(initialData.attendanceRecords));
        }
    };
    initLocalStorage();
  }, []);

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

  const login = useCallback(async (role: EmployeeRole, name: string, password?: string) => {
    const employees = await fetchAllEmployees();
    const foundEmployee = employees.find(
      (e) => e.role === role && e.name.toLowerCase() === name.toLowerCase() && e.password === password
    );

    if (foundEmployee) {
      setEmployee(foundEmployee);
      sessionStorage.setItem('currentEmployee', JSON.stringify(foundEmployee));
    } else {
      throw new Error('Invalid credentials');
    }
  }, []);

  const logout = useCallback(() => {
    setEmployee(null);
    sessionStorage.removeItem('currentEmployee');
    // Clear react-query cache on logout to ensure fresh data for next user
    queryClient.clear();
  }, [queryClient]);
  

  const user = employee ? { uid: employee.id } : null;

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout }}>
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
