'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-hover-bg rounded-full px-4 py-3 flex items-center gap-3 text-muted focus-within:ring-1 focus-within:ring-accent focus-within:text-accent transition-all">
      <span>🔍</span>
      <input 
        type="text" 
        placeholder="Search RawWire" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-transparent outline-none w-full text-foreground" 
      />
    </div>
  );
}
