
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import { initialEmployees } from '@/lib/data';


interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, employee: null, loading: true });

// Mock mapping from email to employee ID. In a real app, this would come from your database.
const emailToEmployeeIdMap: Record<string, string> = {
    'guardia@test.com': '1',
    'guardia2@test.com': '2',
    'supervisor@test.com': '3',
    'coordinador@test.com': '4',
    'director@test.com': '5',
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email) {
          const employeeId = emailToEmployeeIdMap[user.email];
          const foundEmployee = initialEmployees.find(e => e.id === employeeId) || null;
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
