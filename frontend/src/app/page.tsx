import Link from 'next/link';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api';
import NewsFeed from '@/components/NewsFeed';

import CategoryNav from '@/components/CategoryNav';

async function getNewsData(category: string) {
  try {
    const res = await fetch(`${getApiUrl()}/news?category=${category || ''}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], pages: 1 };
    const json = await res.json();
    return { data: json.data || [], pages: json.pages || 1 };
  } catch (err) {
    return { data: [], pages: 1 };
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || '';
  const { data: initialNews, pages: totalPages } = await getNewsData(currentCategory);

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

      {/* Category Navigation */}
      <CategoryNav currentCategory={currentCategory} />

      <NewsFeed key={currentCategory} initialNews={initialNews} totalPages={totalPages} currentCategory={currentCategory} />
    </div>
  );
}
