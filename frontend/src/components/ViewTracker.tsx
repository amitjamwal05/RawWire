'use client';
import { useEffect, useRef } from 'react';

import { getApiUrl } from '@/lib/api';

export default function ViewTracker({ id }: { id: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      fetch(`${getApiUrl()}/news/view/${id}`, { method: 'POST' })
        .catch(console.error);
      tracked.current = true;
    }
  }, [id]);

  return null;
}
