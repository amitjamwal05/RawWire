import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import LiveViewCounter from '@/components/LiveViewCounter';
import { formatCompactNumber } from '@/lib/utils';

async function getTrendingNews() {
  try {
    const res = await fetch(`${getApiUrl()}/news/trending`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function TrendingWidget() {
  const trending = await getTrendingNews();

  if (!trending || trending.length === 0) return null;

  return (
    <div className="bg-hover-bg rounded-2xl border border-border mt-4 overflow-hidden">
      <h2 className="font-bold text-xl p-4 pb-2 flex items-center gap-2">
        <TrendingUp size={20} className="text-accent" /> Trending Now
      </h2>
      <div className="flex flex-col">
        {trending.map((news: any, index: number) => (
          <Link 
            key={news._id} 
            href={`/news/${news._id}`}
            className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex gap-3">
              <span className="text-muted font-bold text-lg">{index + 1}</span>
              <div className="flex flex-col">
                <span className="text-sm text-muted mb-1 flex items-center gap-1">
                  {news.isUserSubmitted ? news.userName : 'RawWire'}
                </span>
                <span className="font-bold text-foreground group-hover:underline line-clamp-2 leading-snug">
                  {news.title}
                </span>
                <span className="text-xs text-muted mt-1">
                  <LiveViewCounter newsId={news._id} initialViews={news.views || 0} /> views {news.upvotes > 0 && `· ${formatCompactNumber(news.upvotes)} likes`}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
