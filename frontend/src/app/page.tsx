import Link from 'next/link';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api';
import NewsFeed from '@/components/NewsFeed';

async function getNewsData() {
  try {
    const res = await fetch(`${getApiUrl()}/news`, { cache: 'no-store' });
    if (!res.ok) return { data: [], pages: 1 };
    const json = await res.json();
    return { data: json.data || [], pages: json.pages || 1 };
  } catch (err) {
    return { data: [], pages: 1 };
  }
}

export default async function Home() {
  const { data: initialNews, pages: totalPages } = await getNewsData();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile Logo Avatar */}
          <Link href="/" className="sm:hidden block">
            <Image src="/logo.png" alt="RawWire" width={32} height={32} className="w-8 h-8 rounded-full" />
          </Link>
          <h1 className="text-xl font-bold">Home</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex w-full border-b border-border">
        <div className="flex-1 hover:bg-hover-bg transition-colors cursor-pointer flex justify-center pt-4">
          <div className="relative pb-4">
            <span className="font-bold text-foreground">For you</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full"></div>
          </div>
        </div>
      </div>

      <NewsFeed initialNews={initialNews} totalPages={totalPages} />
    </div>
  );
}
