'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ShieldAlert, Moon, Sun, Feather, PenTool } from 'lucide-react';
import { MdVerified } from 'react-icons/md';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('adminToken')) {
      setIsAdmin(true);
    }
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <>
      {/* Mobile Bottom Nav & Desktop Left Sidebar */}
      <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border z-50 sm:top-0 sm:w-[80px] xl:w-[275px] sm:h-screen sm:border-t-0 sm:border-r sm:flex sm:flex-col items-center xl:items-start xl:pl-8 py-2 sm:py-4 flex justify-around sm:justify-start">
        
        {/* Logo (Hidden on mobile) */}
        <Link href="/" className="hidden sm:flex w-14 h-14 xl:w-auto xl:h-auto rounded-full x-hover items-center justify-center xl:justify-start xl:p-3 xl:-ml-3 mb-2">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="hidden xl:inline">RawWire</span>
            <span className="xl:hidden">RW</span>
          </h1>
        </Link>

        {/* Nav Links */}
        <nav className="flex sm:flex-col gap-2 w-full items-center justify-around sm:justify-start xl:items-start mt-0 sm:mt-2">
          <Link href="/" className="flex items-center gap-4 p-3 xl:pr-6 rounded-full x-hover w-max">
            <Home size={28} />
            <span className="hidden xl:inline text-xl font-medium">Home</span>
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-4 p-3 xl:pr-6 rounded-full x-hover w-max">
            <ShieldAlert size={28} />
            <span className="hidden xl:inline text-xl font-medium">Admin</span>
          </Link>
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-4 p-3 xl:pr-6 rounded-full x-hover w-max"
          >
            {mounted ? (currentTheme === 'dark' ? <Sun size={28} /> : <Moon size={28} />) : <Moon size={28} />}
            <span className="hidden xl:inline text-xl font-medium">
              {mounted ? (currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}
            </span>
          </button>
        </nav>

        {/* Public Submit News Button */}
        {!isAdmin && (
          <div className="hidden sm:flex w-full mt-6 justify-center xl:justify-start xl:px-4">
            <Link href="/submit" className="bg-accent hover:bg-accent/90 text-white rounded-full p-3 xl:py-3 xl:px-8 font-bold transition-colors w-auto xl:w-[90%] flex items-center justify-center shadow-lg hover:shadow-accent/25">
              <span className="hidden xl:inline">Submit News</span>
              <PenTool className="xl:hidden" size={24} />
            </Link>
          </div>
        )}

        {/* Admin Post Button */}
        {isAdmin && (
          <Link href="/admin/editor" className="hidden sm:flex mt-6 w-14 h-14 xl:w-[90%] xl:h-auto items-center justify-center x-btn-primary xl:py-4">
            <Feather size={24} className="xl:hidden" />
            <span className="hidden xl:inline text-xl">Post</span>
          </Link>
        )}

        {/* Profile (Hidden on mobile) */}
        <div className="hidden sm:flex mt-auto mb-4 w-14 h-14 xl:w-[90%] xl:h-auto items-center xl:p-3 rounded-full x-hover cursor-pointer justify-center xl:justify-start">
          <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="hidden xl:flex flex-col ml-3">
            <span className="font-bold text-sm leading-tight flex items-center">
              RawWire <MdVerified className="text-accent ml-1 text-[16px]" />
            </span>
            <span className="text-muted text-sm">@rawwire</span>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <Link 
        href={isAdmin ? "/admin/editor" : "/submit"} 
        className="sm:hidden fixed bottom-[72px] right-4 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(29,155,240,0.5)] z-50 hover:bg-accent-hover transition-colors"
      >
        <Feather size={26} />
      </Link>
    </>
  );
}
