
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavbar } from '@/components/bottom-navbar';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

// This can't be in the same file as the 'use client' component that uses it.
// export const metadata: Metadata = {
//   title: 'Guardian Payroll',
//   description: 'Attendance and Payroll Management for Security Personnel',
// };

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const showNavbar = !loading && user;

  return (
    <>
      <div className={showNavbar ? "pb-20" : ""}>
        {children}
      </div>
      {showNavbar && <BottomNavbar />}
      <Toaster />
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>Guardian Payroll</title>
        <meta name="description" content="Attendance and Payroll Management for Security Personnel" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
