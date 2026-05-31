'use client';
import { useState } from 'react';
import NewsCard from './NewsCard';
import { getApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewsFeed({ initialNews, totalPages, currentCategory }: { initialNews: any[], totalPages: number, currentCategory: string }) {
  const [news, setNews] = useState(initialNews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (page >= totalPages) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${getApiUrl()}/news?page=${nextPage}&category=${currentCategory || ''}`);
      if (res.ok) {
        const json = await res.json();
        setNews([...news, ...json.data]);
        setPage(nextPage);
      } else {
        toast.error('Failed to load more news');
      }
    } catch (err) {
      toast.error('Network error while loading more news');
    } finally {
      setLoading(false);
    }
  };

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
        <button 
          onClick={loadMore} 
          disabled={loading}
          className="w-full p-4 border-b border-border text-accent hover:bg-hover-bg transition-colors font-medium text-[15px]"
        >
          {loading ? 'Loading...' : 'Show more'}
        </button>
      )}
    </div>
  );
}
