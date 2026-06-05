'use client';

import { useState, useEffect } from 'react';
import { subscribeToPushNotifications } from '@/lib/push';
import { Bell, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PushButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already subscribed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (isSubscribed) {
      toast.success('You are already subscribed to Breaking News alerts!');
      return;
    }
    
    setLoading(true);
    try {
      // Request permission first
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      await subscribeToPushNotifications();
      setIsSubscribed(true);
      toast.success('Successfully subscribed to Breaking News alerts! 🚀');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to subscribe to notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || isSubscribed}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
        isSubscribed 
          ? 'bg-accent/10 text-accent cursor-default' 
          : 'bg-accent hover:bg-accent/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]'
      }`}
    >
      {isSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
      {loading ? 'Subscribing...' : isSubscribed ? 'Alerts Enabled' : 'Enable Breaking Alerts'}
    </button>
  );
}
