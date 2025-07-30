
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
// import { listEmployees } from '@firebasegen/default-connector';
// import { getDataConnect } from '@/lib/dataconnect';
import { initialEmployees } from '@/lib/data';


interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && user.email) {
            // Using mock data until connector is ready
            let foundEmployee = initialEmployees.find(emp => emp.email === user.email) || null;
            if (!foundEmployee) {
                // If user is logged in but not in mock data, assign a default admin profile
                // to prevent being logged out. This is a temporary measure.
                console.warn(`User ${user.email} not found in mock data. Assigning default 'Dirección' role.`);
                foundEmployee = {
                    id: 'temp-admin',
                    name: user.displayName || 'Admin Temporal',
                    email: user.email,
                    role: 'Dirección',
                    shiftRate: 1500,
                };
            }
            setEmployee(foundEmployee);
      } else {
          setEmployee(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    } else if(user && !employee && !isAuthPage) {
        // Logged in with firebase, but no mapping to an employee profile.
        // For security, log them out. THIS SHOULD NOT HAPPEN WITH THE NEW LOGIC.
        console.error("Error: Logged in user has no employee profile. Logging out.");
        auth.signOut();
    }
  }, [user, employee, loading, router, pathname]);


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
    