import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import TrendingWidget from '@/components/TrendingWidget';
import WeatherWidget from '@/components/WeatherWidget';

import SocketProvider from '@/components/SocketProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RawWire',
  description: 'Breaking News delivered fast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans min-h-screen flex justify-center bg-background text-foreground`}>
        <ThemeProvider>
          <SocketProvider>
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            <div className="w-full max-w-[1265px] flex min-h-screen relative justify-center sm:justify-start">
              {/* Left Sidebar Spacer & Nav */}
              <header className="sm:w-[80px] xl:w-[275px] flex-shrink-0 sm:border-r border-border">
                <Sidebar />
              </header>

              {/* Main Center Content */}
              <main className="flex-1 min-w-0 sm:border-r border-border md:max-w-[600px] w-full pb-20 sm:pb-0">
                {children}
              </main>

              {/* Right Sidebar (Search & Trending) */}
              <aside className="hidden lg:block w-[350px] pl-8 py-4 flex-shrink-0">
                <div className="sticky top-4">
                  <SearchBar />
                  <WeatherWidget />
                  <TrendingWidget />
                </div>
              </aside>
            </div>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
