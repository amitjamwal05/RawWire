import ViewTracker from '@/components/ViewTracker';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MdVerified } from 'react-icons/md';
import ShareButtons from '@/components/ShareButtons';
import AdminEditButton from '@/components/AdminEditButton';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

async function getNewsData(id: string) {
  try {
    const res = await fetch(`${getApiUrl()}/news/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const news = await getNewsData(resolvedParams.id);
  
  if (!news) {
    notFound();
  }

  const date = new Date(news.createdAt);
  const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full flex flex-col min-h-screen">
      <ViewTracker id={news._id} />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-6 px-4 py-3">
        <Link href="/" className="p-2 rounded-full hover:bg-hover-bg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      <div className="p-4 flex flex-col border-b border-border">
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-4">
          <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold hover:underline cursor-pointer leading-tight flex items-center">
              RawWire <MdVerified className="text-accent ml-1 text-[18px]" />
            </span>
            <span className="text-muted text-sm">@rawwire</span>
          </div>
          <AdminEditButton id={news._id} />
        </div>

        {/* Content */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{news.title}</h2>
          <div className="text-[17px] leading-relaxed text-foreground whitespace-pre-wrap">
            {news.content}
          </div>
        </div>

        {/* Media Attachment */}
        <div className="w-full relative rounded-2xl overflow-hidden border border-border bg-hover-bg mb-4">
          {news.mediaType === 'video' ? (
            <video src={news.mediaUrl} className="w-full max-h-[600px] object-contain" controls playsInline autoPlay />
          ) : (
            <Image 
               src={news.mediaUrl} 
               alt={news.title} 
               width={800} 
               height={600} 
               className="w-full h-auto object-cover" 
            />
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[15px] text-muted mb-4">
          <span>{timeString}</span>
          <span>·</span>
          <span>{dateString}</span>
          <span>·</span>
          <span className="font-bold text-foreground">{news.views || 0}</span>
          <span>Views</span>
        </div>

        <hr className="border-border w-full" />

        {/* Action Bar */}
        <ShareButtons item={news} isDetail={true} />

        <hr className="border-border w-full" />
      </div>
    </div>
  );
}
