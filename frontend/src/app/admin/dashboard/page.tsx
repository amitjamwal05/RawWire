'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, LogOut, CheckCircle, Pin } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingNews, setPendingNews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'abandoned'>('live');
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
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(console.error);

    fetch(`${getApiUrl()}/admin/news/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPendingNews(Array.isArray(data) ? data : []))
    .catch(console.error);
  }, [router]);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const toastId = toast.loading('Approving post...');
    try {
      const res = await fetch(`${getApiUrl()}/admin/news/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingNews(prev => prev.filter(n => n._id !== id));
        toast.success('Post approved and is now live!', { id: toastId });
      } else {
        toast.error('Failed to approve post', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error.', { id: toastId });
    }
  };

  const handleDelete = async (id: string, isPending: boolean = false) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const token = localStorage.getItem('adminToken');
    const toastId = toast.loading('Deleting post...');
    try {
      const res = await fetch(`${getApiUrl()}/admin/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (isPending) {
          setPendingNews(prev => prev.filter(n => n._id !== id));
        } else {
          setStats((prev: any) => ({
            ...prev,
            newsStats: prev.newsStats?.filter((n: any) => n._id !== id) || [],
            abandonedStats: prev.abandonedStats?.filter((n: any) => n._id !== id) || []
          }));
        }
        toast.success('Post deleted successfully', { id: toastId });
      } else {
        toast.error('Failed to delete post', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    }
  };

  const handlePin = async (id: string, currentPinStatus: boolean) => {
    const token = localStorage.getItem('adminToken');
    const toastId = toast.loading(currentPinStatus ? 'Unpinning post...' : 'Pinning post...');
    try {
      const res = await fetch(`${getApiUrl()}/admin/news/${id}/pin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats((prev: any) => ({
          ...prev,
          newsStats: prev.newsStats?.map((n: any) => n._id === id ? { ...n, isPinned: data.news.isPinned } : n) || []
        }));
        toast.success(data.message, { id: toastId });
      } else {
        toast.error('Failed to toggle pin', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  if (!stats) return <div className="p-8 text-center text-muted">Loading dashboard...</div>;

  return (
    <div className="w-full flex flex-col min-h-screen pb-[100px] sm:pb-0">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/editor" className="bg-accent hover:bg-accent/90 text-white rounded-full p-2 transition-colors">
            <Plus size={20} />
          </Link>
          <button onClick={handleLogout} className="bg-hover-bg text-foreground rounded-full p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-hover-bg rounded-2xl p-4 border border-border">
            <div className="text-muted text-sm mb-1">Total Posts</div>
            <div className="text-3xl font-bold text-foreground">{stats.newsStats?.length || 0}</div>
          </div>
          <div className="bg-hover-bg rounded-2xl p-4 border border-border">
            <div className="text-muted text-sm mb-1">Today's Views</div>
            <div className="text-3xl font-bold text-accent">{stats.todayViews || 0}</div>
          </div>
        </div>

        {/* Pending Submissions */}
        {pendingNews.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              Pending Paid Submissions <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">{pendingNews.length}</span>
            </h2>
            <div className="flex flex-col border border-border rounded-2xl overflow-hidden">
              {pendingNews.map((news: any) => (
                <div key={news._id} className="p-4 border-b border-border last:border-b-0 hover:bg-hover-bg transition-colors flex flex-col gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{news.title}</span>
                    <span className="text-sm text-muted">Submitted by: <span className="font-bold text-foreground">{news.userName}</span> ({news.userPhone})</span>
                    <span className="text-sm text-muted">Aadhaar: {news.userAadhaar}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Link href={`/news/${news._id}`} target="_blank" className="text-sm text-blue-500 hover:underline">Preview Post</Link>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleApprove(news._id)} className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border border-green-500 py-2 rounded-xl transition-colors font-bold flex justify-center items-center gap-2">
                      <CheckCircle size={18} /> Approve & Publish
                    </button>
                    <button onClick={() => handleDelete(news._id, true)} className="p-2 text-muted hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors border border-border flex justify-center items-center">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Management */}
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-lg font-bold">Manage Posts</h2>
            <div className="flex bg-hover-bg rounded-lg p-1 border border-border">
              <button 
                onClick={() => setActiveTab('live')}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${activeTab === 'live' ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted hover:text-foreground'}`}
              >
                Live Posts
              </button>
              <button 
                onClick={() => setActiveTab('abandoned')}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${activeTab === 'abandoned' ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted hover:text-foreground'}`}
              >
                Abandoned Checkouts
              </button>
            </div>
          </div>
          <div className="flex flex-col border border-border rounded-xl overflow-hidden">
            {activeTab === 'live' && (
              stats.newsStats?.length === 0 ? (
                 <div className="p-8 text-center text-muted">No live posts found.</div>
              ) : (
                stats.newsStats?.map((news: any, index: number) => (
                  <div key={news._id} className={`flex items-center justify-between p-4 hover:bg-hover-bg transition-colors ${index !== stats.newsStats.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground mb-1">{news.title}</span>
                      <div className="flex gap-4 text-sm text-muted">
                        <span>{news.views} Views</span>
                        <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePin(news._id, news.isPinned)} className={`p-2 rounded-full transition-colors border border-transparent ${news.isPinned ? 'text-accent bg-accent/20 border-accent/20' : 'text-muted hover:text-accent hover:bg-accent/10 hover:border-accent/20'}`}>
                        <Pin size={20} className={news.isPinned ? 'fill-current rotate-45' : ''} />
                      </button>
                      <Link href={`/admin/editor?id=${news._id}`} className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-full transition-colors border border-transparent hover:border-accent/20">
                        <Edit size={20} />
                      </Link>
                      <button onClick={() => handleDelete(news._id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/20">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
            
            {activeTab === 'abandoned' && (
              stats.abandonedStats?.length === 0 ? (
                 <div className="p-8 text-center text-muted">No abandoned checkouts found.</div>
              ) : (
                stats.abandonedStats?.map((news: any, index: number) => (
                  <div key={news._id} className={`flex items-center justify-between p-4 hover:bg-hover-bg transition-colors ${index !== stats.abandonedStats.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground mb-1 line-clamp-1">{news.title}</span>
                      <div className="flex gap-4 text-sm text-muted">
                        <span className="text-orange-500 font-bold">Unpaid / Abandoned</span>
                        <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(news._id)} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/20">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
