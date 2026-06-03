'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/components/SocketProvider';

import { formatCompactNumber } from '@/lib/utils';

export default function LiveViewCounter({ newsId, initialViews }: { newsId: string, initialViews: number }) {
  const [views, setViews] = useState(initialViews || 0);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleViewsChanged = (data: { newsId: string, views: number }) => {
      if (data.newsId === newsId) {
        setViews(data.views);
      }
    };

    socket.on('view_count_changed', handleViewsChanged);

    return () => {
      socket.off('view_count_changed', handleViewsChanged);
    };
  }, [newsId, socket]);

  return <>{formatCompactNumber(views)}</>;
}
