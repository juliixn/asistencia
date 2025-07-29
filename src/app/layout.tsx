import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavbar } from '@/components/bottom-navbar';

export const metadata: Metadata = {
  title: 'Guardian Payroll',
  description: 'Attendance and Payroll Management for Security Personnel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="pb-20">
          {children}
        </div>
        <BottomNavbar />
        <Toaster />
      </body>
    </html>
  );
}
