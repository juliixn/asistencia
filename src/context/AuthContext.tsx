
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import { ListEmployees } from '@/dataconnect/generated';
import { getDataConnect } from '@/lib/dataconnect';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: { uid: string } | null;
  employee: Employee | null; // The employee profile of the logged-in user.
  loading: boolean;
}

const DIRECTOR_EMAIL_FOR_DEMO = 'director@test.com';

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const dataConnect = getDataConnect();

  const { data: employees, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['directorEmployee'],
    queryFn: () => ListEmployees(dataConnect, { where: { email: { eq: DIRECTOR_EMAIL_FOR_DEMO } } }),
  });

  useEffect(() => {
    if (!isEmployeeLoading) {
      if (employees && employees.length > 0) {
        setEmployee(employees[0]);
      } else {
        console.warn(`Director with email ${DIRECTOR_EMAIL_FOR_DEMO} not found in the database.`);
        setEmployee({
            id: 'temp-admin',
            name: 'Administrador (Fallback)',
            email: DIRECTOR_EMAIL_FOR_DEMO,
            role: 'Dirección',
            shiftRate: 1200
        });
      }
      setLoading(false);
    }
  }, [employees, isEmployeeLoading]);

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
