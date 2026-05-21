import Link from 'next/link';
import Image from 'next/image';
import { MdVerified } from 'react-icons/md';
import ShareButtons from './ShareButtons';
import AdminEditButton from './AdminEditButton';

export default function NewsCard({ item }: { item: any }) {
  const isVideo = item.mediaType === 'video';
  
  // Format date to look like "Jan 14"
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Link href={`/news/${item._id}`} className="block w-full border-b border-border x-hover cursor-pointer transition-colors p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <Image src="/logo.png" alt="RawWire" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0" />
        
        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1 text-[15px]">
            <span className="font-bold text-foreground hover:underline flex items-center">
              RawWire <MdVerified className="text-accent ml-1 text-[18px]" />
            </span>
            <span className="text-muted">@rawwire</span>
            <span className="text-muted">·</span>
            <span className="text-muted hover:underline">{formattedDate}</span>
            <AdminEditButton id={item._id} />
          </div>

          {/* Text Body */}
          <div className="text-[15px] leading-normal text-foreground mb-3 whitespace-pre-wrap">
            <span className="font-bold text-lg block mb-1">{item.title}</span>
            <div className="line-clamp-4 text-muted-foreground">
              {item.content}
            </div>
          </div>

          {/* Media Attachment */}
          <div className="w-full relative rounded-2xl overflow-hidden border border-border bg-hover-bg mb-3">
            {isVideo ? (
              <video src={item.mediaUrl} className="w-full max-h-[500px] object-cover" controls playsInline />
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
          </div>

          {/* Action Buttons */}
          <ShareButtons item={item} />

        </div>
      </div>
    </Link>
  );
}
