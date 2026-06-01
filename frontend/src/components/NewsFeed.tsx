'use client';
import { useState, useEffect, useCallback } from 'react';
import NewsCard from './NewsCard';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

export default function NewsFeed({ initialNews, totalPages, currentCategory }: { initialNews: any[], totalPages: number, currentCategory: string }) {
  const [news, setNews] = useState(initialNews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '400px',
  });

  const loadMore = useCallback(async () => {
    if (page >= totalPages || loading) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${getApiUrl()}/news?page=${nextPage}&category=${currentCategory || ''}`);
      if (res.ok) {
        const json = await res.json();
        setNews(prev => [...prev, ...json.data]);
        setPage(nextPage);
      } else {
        toast.error('Failed to load more news');
      }
    } catch (err) {
      toast.error('Network error while loading more news');
    } finally {
      setLoading(false);
    }
  }, [page, totalPages, loading, currentCategory]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  return (
    <div className="w-full flex flex-col pb-[100px] sm:pb-0">
      {news.length === 0 ? (
        <div className="p-8 text-center text-muted text-lg">
          {currentCategory && currentCategory !== 'All' 
            ? `No news has been posted in the ${currentCategory} category yet.` 
            : `Welcome to your timeline! No news has been posted yet.`}
        </div>
      ) : (
        news.map((item: any) => (
          <NewsCard key={item._id} item={item} />
        ))
      )}

      {page < totalPages && (
        <div 
          ref={ref}
          className="w-full p-6 flex justify-center text-accent text-sm"
        >
          {loading ? 'Loading more...' : ''}
        </div>
      )}
    </div>
  );
}
