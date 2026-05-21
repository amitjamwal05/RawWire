'use client';
import { useEffect, useRef } from 'react';

export default function ViewTracker({ id }: { id: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      fetch(`http://localhost:5000/api/news/view/${id}`, { method: 'POST' })
        .catch(console.error);
      tracked.current = true;
    }
  }, [id]);

  return null;
}
