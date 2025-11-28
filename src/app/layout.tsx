import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { NotificationManager } from '@/components/notifications/notification-manager';
import { NotificationProvider } from '@/context/notification-context';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500']
})

export const metadata: Metadata = {
  title: 'Zenith Vision',
  description: 'Your personal dashboard for a visionary day.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <FirebaseClientProvider>
          <NotificationProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
              {children}
              <Toaster />
              <NotificationManager />
            </ThemeProvider>
          </NotificationProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
