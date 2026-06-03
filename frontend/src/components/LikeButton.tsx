'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useSocket } from '@/components/SocketProvider';
import { formatCompactNumber } from '@/lib/utils';

export default function LikeButton({ newsId, initialUpvotes }: { newsId: string, initialUpvotes: number }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    // Check local storage on mount
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    if (likedPosts[newsId]) {
      setIsLiked(true);
    }

    // Listen for Real-Time Updates from WebSockets
    if (socket) {
      const handleUpvoteChanged = (data: { newsId: string, upvotes: number }) => {
        if (data.newsId === newsId) {
          setUpvotes(data.upvotes);
        }
      };

      socket.on('upvote_changed', handleUpvoteChanged);

      return () => {
        socket.off('upvote_changed', handleUpvoteChanged);
      };
    }
  }, [newsId, socket]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    
    // Optimistic UI Update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setUpvotes(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    // Update Local Storage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    if (newIsLiked) {
      likedPosts[newsId] = true;
    } else {
      delete likedPosts[newsId];
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    // Update Backend
    try {
      const endpoint = newIsLiked ? 'upvote' : 'downvote';
      await fetch(`${getApiUrl()}/news/${newsId}/${endpoint}`, {
        method: 'PUT'
      });
    } catch (err) {
      // Revert if failed
      setIsLiked(!newIsLiked);
      setUpvotes(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      
      const revertedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (!newIsLiked) {
        revertedPosts[newsId] = true;
      } else {
        delete revertedPosts[newsId];
      }
      localStorage.setItem('likedPosts', JSON.stringify(revertedPosts));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleLike}
      className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
        isLiked 
          ? 'text-pink-500 hover:bg-pink-500/10' 
          : 'text-muted hover:text-pink-500 hover:bg-pink-500/10'
      }`}
    >
      <Heart size={20} className={isLiked ? 'fill-current' : ''} />
      <span className="text-sm font-medium">{upvotes > 0 ? formatCompactNumber(upvotes) : ''}</span>
    </button>
  );
}
