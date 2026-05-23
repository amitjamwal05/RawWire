'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('id');
    setId(editId);
    
    if (editId) {
      fetch(`${getApiUrl()}/news/${editId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title);
          setContent(data.content);
        });
    }
  }, []);

  const handleSubmit = async () => {
    if (!title || !content) {
       alert("Headline and content are required.");
       return;
    }
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('media', file);

    const url = id ? `${getApiUrl()}/admin/news/${id}` : `${getApiUrl()}/admin/news`;
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        toast.success(id ? 'Post updated successfully!' : 'Post published successfully!');
        router.push('/admin/dashboard');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin/dashboard')} className="p-2 rounded-full hover:bg-hover-bg transition-colors">
             <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{id ? 'Edit post' : 'Draft new post'}</h1>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="x-btn-primary px-5 py-1.5 disabled:opacity-50 text-sm">
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
      
      <div className="p-4 flex gap-3">
        <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex flex-col flex-1 pt-1">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-foreground font-bold text-xl outline-none mb-3 placeholder:text-muted" 
            placeholder="Headline summary..."
            required
          />
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-foreground text-lg outline-none resize-none min-h-[200px] placeholder:text-muted leading-relaxed" 
            placeholder="What is happening?!"
            required
          />

          <div className="border-t border-border mt-4 pt-4 flex items-center">
             <label className="text-accent cursor-pointer hover:bg-accent/10 px-4 py-2 rounded-full inline-flex items-center gap-2 font-bold text-sm transition-colors">
                🖼️ Attach Media
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  className="hidden"
                />
             </label>
             {file && <span className="ml-4 text-sm text-foreground bg-hover-bg px-3 py-1 rounded-md">{file.name} attached</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
