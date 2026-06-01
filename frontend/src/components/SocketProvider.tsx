'use client';
import { useEffect, useState, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Determine the base backend URL
    const apiUrl = getApiUrl();
    const backendUrl = apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
    
    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to RawWire Real-Time Server');
    });

    socketInstance.on('new_post_alert', (data) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2 min-w-[250px]">
            <span className="font-bold text-accent">🔥 Breaking News Available!</span>
            <span className="text-[15px] font-medium leading-tight">{data.title}</span>
            <button 
              onClick={() => {
                window.location.reload();
                toast.dismiss(t.id);
              }}
              className="mt-2 text-sm font-bold bg-accent text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 w-full hover:bg-accent/90 transition-transform active:scale-95"
            >
              <RefreshCw size={14} /> Refresh Feed
            </button>
          </div>
        ),
        { duration: 15000, position: 'top-center', style: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' } }
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
