// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/app/contexts/NotificationContext';
import { AuthProvider } from '@/lib/auth'; // If you have an auth provider
import { ThemeProvider } from '@/lib/theme-context'; // If you have theme context

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tepi Gibie Gubaye',
  description: 'Tepi Gibie Gubaye Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap with all necessary providers */}
        <ThemeProvider> {/* If you have theme provider */}
          <AuthProvider> {/* If you have auth provider */}
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}