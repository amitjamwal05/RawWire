'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

export default function AdminEditButton({ id }: { id: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/admin/editor?id=${id}`);
      }} 
      className="ml-auto flex items-center gap-1 text-muted hover:text-accent transition-colors"
    >
      <Edit size={16} />
      <span className="text-sm font-bold">Edit</span>
    </button>
  );
}
