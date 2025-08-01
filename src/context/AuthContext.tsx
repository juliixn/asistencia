
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import { ListEmployees } from '@/dataconnect/hooks';

// This context provides a simulated "logged-in" user experience.
// In a real-world scenario, you would integrate a full authentication provider.
interface AuthContextType {
  user: { uid: string } | null;
  employee: Employee | null; // The employee profile of the logged-in user.
  loading: boolean;
}

// We'll simulate the "Director" logging in, as they have the highest permissions.
const DIRECTOR_EMAIL_FOR_DEMO = 'director@test.com';

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // In this hook, we're fetching the "Director" employee to simulate a login.
  // The `useSWR` hook from the Data Connect client library handles fetching, caching, and revalidation.
  const { data: employees, isLoading: isEmployeeLoading } = ListEmployees({
    where: { email: { eq: DIRECTOR_EMAIL_FOR_DEMO } },
  });

  useEffect(() => {
    if (!isEmployeeLoading) {
      if (employees && employees.length > 0) {
        // Found the director employee, set them as the current user.
        setEmployee(employees[0]);
      } else {
        // Handle case where the director isn't found (e.g., first run, database empty).
        // For this demo, we can provide a default admin user object.
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

  // The user object is simulated, but in a real app, this would come from Firebase Auth.
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
