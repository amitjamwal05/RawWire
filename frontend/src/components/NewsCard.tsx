import Link from 'next/link';
import Image from 'next/image';
import { MdVerified } from 'react-icons/md';
import ShareButtons from './ShareButtons';
import AdminEditButton from './AdminEditButton';
import LikeButton from './LikeButton';
import { Pin, Sparkles } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';
import sanitizeHtml from 'sanitize-html';

export default function NewsCard({ item }: { item: any }) {
  const isVideo = item.mediaType === 'video';
  
  const formattedDate = getTimeAgo(item.createdAt);

  return (
    <div className="block w-full border-b border-border x-hover cursor-pointer transition-colors p-4">
      {item.isPinned && (
        <div className="flex items-center gap-2 text-muted font-bold text-sm mb-2 pl-10">
          <Pin size={14} className="fill-current rotate-45" /> Pinned
        </div>
      )}
      <div className="flex gap-3">
        {/* Avatar */}
        {item.isUserSubmitted ? (
          item.userPhotoUrl ? (
            <Link href={`/user/${item.userName}`}>
              <Image src={item.userPhotoUrl} alt={item.userName} width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-border hover:opacity-80 transition-opacity" />
            </Link>
          ) : (
            <Link href={`/user/${item.userName}`}>
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-accent text-white flex items-center justify-center font-bold border border-border text-sm hover:opacity-80 transition-opacity">
                {item.userName ? (item.userName.trim().split(' ').length >= 2 ? (item.userName.trim().split(' ')[0][0] + item.userName.trim().split(' ')[item.userName.trim().split(' ').length - 1][0]).toUpperCase() : item.userName[0].toUpperCase()) : 'U'}
              </div>
            </Link>
          )
        ) : (
          <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0 border border-border" />
        )}
        
        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1 text-[15px]">
            {item.isUserSubmitted ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5">
                <Link href={`/user/${item.userName}`} className="font-bold text-foreground hover:underline flex items-center">
                  {item.userName} 
                  <span className="relative inline-flex items-center justify-center ml-1">
                    <span className="absolute w-[10px] h-[10px] bg-white rounded-full"></span>
                    <MdVerified className="text-pink-500 text-[18px] relative z-10" />
                  </span>
                </Link>
                <Link href={`/user/${item.userName}`} className="text-muted hover:underline">{item.userEmail || `@${item.userName.toLowerCase().replace(/\s+/g, '')}`}</Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground flex items-center">
                  RawWire 
                  <span className="relative inline-flex items-center justify-center ml-1">
                    <span className="absolute w-[10px] h-[10px] bg-white rounded-full"></span>
                    <MdVerified className="text-accent text-[18px] relative z-10" />
                  </span>
                </span>
                <span className="text-muted">@rawwire</span>
              </div>
            )}
            <span className="text-muted hidden sm:inline">·</span>
            <Link href={`/news/${item._id}`} className="text-muted hover:underline">{formattedDate}</Link>
            {item.category && item.category !== 'General' && (
              <>
                <span className="text-muted hidden sm:inline">·</span>
                <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-hover-bg uppercase tracking-wide">
                  {item.category}
                </span>
              </>
            )}
            <AdminEditButton id={item._id} />
          </div>

          {/* Text Body */}
          <Link href={`/news/${item._id}`} className="text-[15px] leading-normal text-foreground mb-3 block">
            {item.title && (
              <div 
                className="font-bold text-lg mb-1 break-words overflow-hidden text-ellipsis"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              >
                {item.title}
              </div>
            )}
            <div 
              className="break-words overflow-hidden text-ellipsis prose dark:prose-invert max-w-none"
              style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml((item.content || '').replace(/&nbsp;/g, ' ')) }}
            />
          </Link>

          {/* Media Attachment */}
          {item.mediaUrl && (
            <Link href={`/news/${item._id}`} className="w-full relative rounded-2xl overflow-hidden border border-border bg-hover-bg mb-3 block">
              {isVideo ? (
                <video src={item.mediaUrl} className="w-full max-h-[500px] object-cover" controls playsInline onClick={(e) => e.preventDefault()} />
              ) : (
                <div className="relative w-full h-auto max-h-[500px]">
                  <Image 
                     src={item.mediaUrl} 
                     alt={item.title} 
                     width={600} 
                     height={400} 
                     className="w-full h-auto object-cover max-h-[500px]" 
                  />
                </div>
              )}
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-8">
            <LikeButton newsId={item._id} initialUpvotes={item.upvotes || 0} />
            <ShareButtons item={item} />
          </div>

        </div>
      </div>
    </div>
  );
}
