
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { initialData } from '@/lib/data';

interface AuthContextType {
  user: { uid: string } | null;
  employee: Employee | null; // The employee profile of the logged-in user.
  loading: boolean;
}

const DIRECTOR_EMAIL_FOR_DEMO = 'director@test.com';

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

async function findDirector(): Promise<Employee[]> {
    const data = localStorage.getItem('employees');
    const employees: Employee[] = data ? JSON.parse(data) : initialData.employees;
    return employees.filter(e => e.email === DIRECTOR_EMAIL_FOR_DEMO);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize local storage with mock data if it's empty
  // This is a one-time setup for the demo environment
  useEffect(() => {
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
  }, []);

  // For this demo, we'll "log in" as the director by default.
  // We fetch the director's data from localStorage to simulate a user session.
  const { data: directorQuery, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['directorEmployee'],
    queryFn: findDirector,
  });

  useEffect(() => {
    if (!isEmployeeLoading) {
      if (directorQuery && directorQuery.length > 0) {
        setEmployee(directorQuery[0]);
      } else {
        // Fallback in case the director is not found in localStorage
        const fallbackDirector = initialData.employees.find(e => e.email === DIRECTOR_EMAIL_FOR_DEMO);
        setEmployee(fallbackDirector || null);
      }
      setLoading(false);
    }
  }, [directorQuery, isEmployeeLoading]);

  const user = employee ? { uid: employee.id } : null;

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
