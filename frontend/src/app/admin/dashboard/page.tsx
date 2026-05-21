'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, LogOut } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch(`${getApiUrl()}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => setStats(data))
    .catch(() => {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    });
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${getApiUrl()}/admin/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats((prev: any) => ({
      ...prev,
      newsStats: prev.newsStats.filter((n: any) => n._id !== id)
    }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (!stats) return <div className="p-8 text-center text-muted">Loading...</div>;

  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="p-4 border-b border-border flex gap-4">
        <div className="flex-1 bg-hover-bg rounded-2xl p-6">
          <p className="text-muted text-sm mb-1">Total Views Today</p>
          <p className="text-3xl font-bold text-foreground">{stats.todayViews}</p>
        </div>
        <div className="flex-1 bg-hover-bg rounded-2xl p-6">
          <p className="text-muted text-sm mb-1">Total Posts</p>
          <p className="text-3xl font-bold text-foreground">{stats.newsStats.length}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Posts</h2>
          <Link href="/admin/editor" className="x-btn-primary px-4 py-2 flex items-center gap-2">
            <Plus size={18} /> New Post
          </Link>
        </div>

        <div className="flex flex-col border border-border rounded-xl overflow-hidden">
          {stats.newsStats.length === 0 ? (
             <div className="p-8 text-center text-muted">No posts found.</div>
          ) : (
            stats.newsStats.map((news: any, index: number) => (
              <div key={news._id} className={`flex items-center justify-between p-4 x-hover ${index !== stats.newsStats.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground mb-1">{news.title}</span>
                  <div className="flex gap-4 text-sm text-muted">
                    <span>{news.views} Views</span>
                    <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/editor?id=${news._id}`} className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-full transition-colors">
                    <Edit size={20} />
                  </Link>
                  <button onClick={() => handleDelete(news._id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
