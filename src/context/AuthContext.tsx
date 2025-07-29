
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import { listEmployees } from '@firebasegen/default-connector';
import { getDataConnect } from '@/lib/dataconnect';
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
        try {
            // This will fail on first build, but succeed on subsequent builds
            const dc = getDataConnect();
            const {data: employees} = await listEmployees(dc, {
                filter: { email: { eq: user.email }}
            });
            const foundEmployee = employees[0] || null;
            
            if (foundEmployee) {
                 setEmployee({
                    id: foundEmployee.employeeId,
                    name: foundEmployee.name,
                    role: foundEmployee.role as Employee['role'],
                    shiftRate: foundEmployee.shiftRate,
                    email: foundEmployee.email,
                 });
            } else {
                setEmployee(null);
            }
        } catch(e) {
            console.warn("DataConnect not ready, falling back to mock data for auth.", e);
            // Fallback to initialEmployees if DataConnect fails (e.g., during build)
            const foundEmployee = initialEmployees.find(emp => emp.email === user.email) || null;
            setEmployee(foundEmployee);
        }
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
        // For security, log them out.
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
