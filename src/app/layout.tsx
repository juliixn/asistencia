
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavbar } from '@/components/bottom-navbar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './login/page';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent({ children }: { children: React.ReactNode }) {
  const { employee, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return <LoginPage />;
  }
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto lg:pb-0 pb-20">
            {children}
        </div>
        <BottomNavbar />
      </main>
      <Toaster />
    </div>
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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
              <AppContent>{children}</AppContent>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
