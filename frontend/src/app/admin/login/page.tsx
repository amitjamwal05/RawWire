'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        toast.success('Login successful!');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center h-full min-h-[80vh] px-4">
      <form onSubmit={handleLogin} className="w-full max-w-[360px] flex flex-col">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Sign in to RawWire Admin</h1>
        <p className="text-muted mb-8">Manage the RawWire feed</p>
        
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full border border-border p-4 bg-transparent text-foreground rounded-md mb-4 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
          required
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-border p-4 bg-transparent text-foreground rounded-md mb-6 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
          required
        />
        
        <button type="submit" className="w-full bg-foreground text-background font-bold py-3.5 rounded-full hover:opacity-90 transition-opacity">
          Log in
        </button>
      </form>
    </div>
  );
}
