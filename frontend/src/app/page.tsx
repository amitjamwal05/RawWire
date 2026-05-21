import Link from 'next/link';
import Image from 'next/image';
import NewsCard from '@/components/NewsCard';
import { getApiUrl } from '@/lib/api';

async function getNews() {
  try {
    const res = await fetch(`${getApiUrl()}/news`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function Home() {
  const news = await getNews();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex flex-col pt-2 sm:pt-0">
        <div className="flex items-center px-4 py-2 sm:py-4">
          <Image src="/logo.png" alt="RawWire" width={32} height={32} className="w-8 h-8 rounded-full sm:hidden mr-4" />
          <h1 className="text-xl font-bold">Home</h1>
        </div>
        <div className="flex w-full">
          <button className="flex-1 hover:bg-hover-bg transition-colors relative flex justify-center py-4 text-foreground font-bold">
            For you
            <div className="absolute bottom-0 h-1 w-14 bg-accent rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex flex-col pb-20 pt-2">

        {news.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <p className="text-xl font-bold mb-2">Welcome to your timeline!</p>
            <p>Admin hasn't posted any news yet.</p>
          </div>
        ) : (
          news.map((item: any) => (
            <NewsCard 
              key={item._id}
              item={item}
            />
          ))
        )}
      </div>
    </div>
  );
}
