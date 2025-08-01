
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

  const { data: directorQuery, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['directorEmployee'],
    queryFn: findDirector,
  });

  useEffect(() => {
    // Initialize local storage if it's empty
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

  useEffect(() => {
    if (!isEmployeeLoading) {
      if (directorQuery && directorQuery.length > 0) {
        setEmployee(directorQuery[0]);
      } else {
        console.warn(`Director with email ${DIRECTOR_EMAIL_FOR_DEMO} not found, using fallback.`);
        const fallbackDirector = initialData.employees.find(e => e.email === DIRECTOR_EMAIL_FOR_DEMO);
        setEmployee(fallbackDirector || {
            id: 'temp-admin',
            name: 'Administrador (Fallback)',
            email: DIRECTOR_EMAIL_FOR_DEMO,
            role: 'Director de Seguridad',
            shiftRate: 1200
        });
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

    