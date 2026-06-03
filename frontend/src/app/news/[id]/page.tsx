import ViewTracker from '@/components/ViewTracker';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MdVerified } from 'react-icons/md';
import ShareButtons from '@/components/ShareButtons';
import AdminEditButton from '@/components/AdminEditButton';
import LikeButton from '@/components/LikeButton';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import sanitizeHtml from 'sanitize-html';
import ClientDate from '@/components/ClientDate';
import LiveViewCounter from '@/components/LiveViewCounter';
import WeatherWidget from '@/components/WeatherWidget';
import { Metadata, ResolvingMetadata } from 'next';

async function getNewsData(id: string) {
  try {
    const res = await fetch(`${getApiUrl()}/news/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const news = await getNewsData(resolvedParams.id);

  if (!news) {
    return { title: 'Post Not Found | RawWire' };
  }

  const title = news.title || 'RawWire News Update';
  // Strip HTML tags for clean description
  const cleanContent = sanitizeHtml(news.content || '', { allowedTags: [] });
  const description = cleanContent.length > 0 ? cleanContent.substring(0, 160) + '...' : 'Read the latest breaking news on RawWire.';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rawwire.onrender.com';
  // Use post image if available, else fallback to site logo
  const ogImage = news.mediaType === 'image' && news.mediaUrl ? news.mediaUrl : `${siteUrl}/logo.png`;

  return {
    title: `${title} | RawWire`,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/news/${news._id}`,
      siteName: 'RawWire',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
      publishedTime: news.createdAt,
      authors: [news.userName || 'RawWire'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const news = await getNewsData(resolvedParams.id);
  
  if (!news) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rawwire.onrender.com';
  
  // JSON-LD structured data for Google News
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title || 'RawWire News Update',
    image: [news.mediaType === 'image' && news.mediaUrl ? news.mediaUrl : `${siteUrl}/logo.png`],
    datePublished: news.createdAt,
    dateModified: news.updatedAt || news.createdAt,
    author: [{
      '@type': 'Person',
      name: news.userName || 'RawWire',
      url: news.isUserSubmitted ? `${siteUrl}/user/${news.authorId || news.userName}` : siteUrl
    }],
    publisher: {
      '@type': 'Organization',
      name: 'RawWire',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker id={news._id} />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-full hover:bg-hover-bg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
        
        {/* Compact Mobile Weather Widget */}
        <div className="block lg:hidden">
          <WeatherWidget compact={true} />
        </div>
      </div>

      <div className="p-4 flex flex-col border-b border-border">
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-4">
          {news.isUserSubmitted ? (
            news.userPhotoUrl ? (
              <Image src={news.userPhotoUrl} alt={news.userName} width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-border" />
            ) : (
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-accent text-white flex items-center justify-center font-bold border border-border text-sm">
                {news.userName ? (news.userName.trim().split(' ').length >= 2 ? (news.userName.trim().split(' ')[0][0] + news.userName.trim().split(' ')[news.userName.trim().split(' ').length - 1][0]).toUpperCase() : news.userName[0].toUpperCase()) : 'U'}
              </div>
            )
          ) : (
            <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0 border border-border" />
          )}
          <div className="flex flex-col">
            {news.isUserSubmitted ? (
              <>
                <span className="font-bold hover:underline cursor-pointer leading-tight flex items-center">
                  {news.userName} 
                  <span className="relative inline-flex items-center justify-center ml-1">
                    <span className="absolute w-[10px] h-[10px] bg-white rounded-full"></span>
                    <MdVerified className="text-pink-500 text-[18px] relative z-10" />
                  </span>
                </span>
                <span className="text-muted text-sm">@{news.userName.toLowerCase().replace(/\s+/g, '')}</span>
              </>
            ) : (
              <>
                <span className="font-bold hover:underline cursor-pointer leading-tight flex items-center">
                  RawWire 
                  <span className="relative inline-flex items-center justify-center ml-1">
                    <span className="absolute w-[10px] h-[10px] bg-white rounded-full"></span>
                    <MdVerified className="text-accent text-[18px] relative z-10" />
                  </span>
                </span>
                <span className="text-muted text-sm">@rawwire</span>
              </>
            )}
          </div>
          <AdminEditButton id={news._id} />
        </div>

        <div className="mb-4">
          {news.title && <h2 className="text-3xl font-extrabold mb-4 leading-tight break-words">{news.title}</h2>}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml((news.content || '').replace(/&nbsp;/g, ' ')) }}
          />
        </div>

        {/* Media Attachment */}
        {news.mediaUrl && (
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
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[15px] text-muted mb-4">
          <ClientDate isoString={news.createdAt || new Date().toISOString()} />
          <span>·</span>
          <span className="font-bold text-foreground"><LiveViewCounter newsId={news._id} initialViews={news.views || 0} /></span>
          <span>Views</span>
        </div>

        <hr className="border-border w-full" />

        {/* Action Bar */}
        <div className="flex items-center gap-8 my-2">
          <LikeButton newsId={news._id} initialUpvotes={news.upvotes || 0} />
          <ShareButtons item={news} isDetail={true} />
        </div>

        <hr className="border-border w-full" />
      </div>
    </div>
  );
}
