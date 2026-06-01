'use client';
import { useEffect, useState } from 'react';

export default function ClientDate({ isoString }: { isoString: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (!isoString) return;
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setFormattedDate(`${timeStr} · ${dateStr}`);
    }
  }, [isoString]);

  if (!formattedDate) {
    return <span className="opacity-0">00:00 PM · Jan 1, 2024</span>;
  }

  return <span>{formattedDate}</span>;
}
