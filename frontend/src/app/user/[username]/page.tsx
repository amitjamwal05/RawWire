import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import NewsCard from '@/components/NewsCard';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  return {
    title: `${username} (@${username.toLowerCase().replace(/\s+/g, '')}) | RawWire`,
    description: `News reported by ${username} on RawWire`,
  };
}

async function getUserNews(username: string) {
  try {
    const res = await fetch(`${getApiUrl()}/news/user/${encodeURIComponent(username)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const decodedUsername = decodeURIComponent(resolvedParams.username);
  const news = await getUserNews(decodedUsername);

  // Derive an avatar from the first post (if they have one)
  const avatarUrl = news.find((n: any) => n.userPhotoUrl)?.userPhotoUrl;
  
  // Calculate total stats
  const totalViews = news.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0);
  const totalUpvotes = news.reduce((acc: number, curr: any) => acc + (curr.upvotes || 0), 0);

  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-6 px-4 py-3">
        <Link href="/" className="p-2 rounded-full hover:bg-hover-bg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-tight">{decodedUsername}</h1>
          <span className="text-xs text-muted">{news.length} posts</span>
        </div>
      </div>

      <div className="border-b border-border p-6 flex flex-col items-center sm:items-start text-center sm:text-left relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-accent/20 to-pink-500/20 -z-10"></div>
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-hover-bg overflow-hidden flex items-center justify-center mb-4 mt-8 shadow-xl">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={decodedUsername} width={128} height={128} className="w-full h-full object-cover" />
          ) : (
            <UserRound size={48} className="text-muted" />
          )}
        </div>
        
        <h2 className="text-2xl font-extrabold">{decodedUsername}</h2>
        <span className="text-muted mb-4">@{decodedUsername.toLowerCase().replace(/\s+/g, '')}</span>
        
        <div className="flex gap-4 mb-2 text-sm">
          <div className="flex gap-1.5">
            <span className="font-bold">{totalViews}</span>
            <span className="text-muted">Views</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold">{totalUpvotes}</span>
            <span className="text-muted">Likes</span>
          </div>
        </div>
      </div>

      <div className="flex w-full border-b border-border">
        <div className="flex-1 cursor-pointer flex justify-center pt-4 relative">
          <span className="font-bold text-foreground pb-4">Posts</span>
          <div className="absolute bottom-0 w-16 h-1 bg-accent rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-col">
        {news.length === 0 ? (
          <div className="p-8 text-center text-muted">This user hasn't published any news yet.</div>
        ) : (
          news.map((item: any) => <NewsCard key={item._id} item={item} />)
        )}
      </div>
    </div>
  );
}
