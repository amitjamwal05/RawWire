import NewsCard from '@/components/NewsCard';
import { getApiUrl } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getSearchResults(query: string) {
  try {
    const res = await fetch(`${getApiUrl()}/news?search=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const news = await getSearchResults(query);

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex flex-col px-4 py-3">
        <div className="flex items-center gap-6 mb-2">
          <Link href="/" className="p-2 rounded-full hover:bg-hover-bg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight">Search</h1>
          </div>
        </div>
        <p className="text-sm text-muted">Showing results for &quot;{query}&quot;</p>
      </div>

      <div className="flex-1 w-full flex flex-col pb-[100px] sm:pb-0">
        {news.length === 0 ? (
          <div className="p-8 text-center text-muted text-lg">
            No results found for &quot;{query}&quot;
          </div>
        ) : (
          news.map((item: any) => (
            <NewsCard key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
