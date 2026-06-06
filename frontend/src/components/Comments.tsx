'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import Image from 'next/image';
import { io } from 'socket.io-client';
import { getApiUrl } from '@/lib/api';

interface Comment {
  _id?: string;
  text: string;
  author: string;
  avatarUrl: string;
  createdAt: string;
}

interface CommentsProps {
  newsId: string;
  initialComments?: Comment[];
}

export default function Comments({ newsId, initialComments = [] }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestProfile, setGuestProfile] = useState<{ name: string; avatar: string } | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Guest Profile and Socket
  useEffect(() => {
    // Generate or retrieve guest profile
    let profile = localStorage.getItem('rawwire_guest_profile');
    if (!profile) {
      const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const guestName = `Guest_${randomId}`;
      const guestAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      
      const newProfile = { name: guestName, avatar: guestAvatar };
      localStorage.setItem('rawwire_guest_profile', JSON.stringify(newProfile));
      setGuestProfile(newProfile);
    } else {
      setGuestProfile(JSON.parse(profile));
    }

    // Connect to Socket.io for live comments
    const socket = io(getApiUrl().replace('/api', ''), {
      transports: ['websocket'],
    });

    socket.on('new_comment', (data: { newsId: string, comment: Comment }) => {
      if (data.newsId === newsId) {
        setComments(prev => {
          // Prevent duplicates
          if (prev.some(c => c.text === data.comment.text && c.author === data.comment.author && new Date(c.createdAt).getTime() === new Date(data.comment.createdAt).getTime())) {
             return prev;
          }
          return [...prev, data.comment];
        });
        // Scroll to bottom
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [newsId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !guestProfile) return;

    setIsSubmitting(true);
    const commentData = {
      text: newComment.trim(),
      author: guestProfile.name,
      avatarUrl: guestProfile.avatar
    };

    try {
      const res = await fetch(`${getApiUrl()}/news/${newsId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (res.ok) {
        const addedComment = await res.json();
        setComments(prev => [...prev, addedComment]);
        setNewComment('');
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  };

  return (
    <div className="mt-12 mb-8 bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-accent">💬</span> Discussions <span className="text-sm font-normal text-foreground/50 bg-accent/10 px-2 py-0.5 rounded-full">{comments.length}</span>
      </h3>

      <div className="space-y-5 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-foreground/50 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-accent/10 border border-border">
                {comment.avatarUrl ? (
                  <img src={comment.avatarUrl} alt={comment.author} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-accent"><User size={20} /></div>
                )}
              </div>
              <div className="flex-1 bg-background border border-border rounded-2xl rounded-tl-none p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-foreground">{comment.author}</span>
                  <span className="text-xs text-foreground/50">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed break-words">{comment.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-accent/10 border border-border hidden sm:block">
          {guestProfile && (
            <img src={guestProfile.avatar} alt="You" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add an anonymous comment..."
            className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent transition-colors"
          >
            <Send size={16} className={isSubmitting ? 'animate-pulse' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
}
