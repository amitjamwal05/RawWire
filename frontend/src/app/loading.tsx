import { BarChart2, Share } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa6';

export default function Loading() {
  // Create an array of 5 skeleton cards
  const skeletons = Array.from({ length: 5 });

  return (
    <div className="w-full flex flex-col">
      {/* Sticky Header Skeleton */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-center p-3">
        <div className="h-6 w-24 bg-muted animate-pulse rounded-md"></div>
      </div>

      {skeletons.map((_, i) => (
        <div key={i} className="block w-full border-b border-border p-4">
          <div className="flex gap-3">
            {/* Avatar Skeleton */}
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
            
            {/* Content Skeleton */}
            <div className="flex flex-col flex-1 min-w-0">
              
              {/* Header Skeleton */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-12 bg-muted animate-pulse rounded-md"></div>
              </div>

              {/* Text Body Skeleton */}
              <div className="mb-3">
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
                <div className="h-4 w-full bg-muted animate-pulse rounded-md mb-1.5"></div>
                <div className="h-4 w-full bg-muted animate-pulse rounded-md mb-1.5"></div>
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md"></div>
              </div>

              {/* Media Attachment Skeleton */}
              <div className="w-full h-[300px] rounded-2xl bg-muted animate-pulse mb-3"></div>

              {/* Action Buttons Skeleton */}
              <div className="flex justify-between mt-1 max-w-md text-muted/50">
                <div className="p-2 rounded-full"><BarChart2 size={18} /></div>
                <div className="p-2 rounded-full"><FaXTwitter size={18} /></div>
                <div className="p-2 rounded-full"><FaFacebook size={18} /></div>
                <div className="p-2 rounded-full"><FaInstagram size={18} /></div>
                <div className="p-2 rounded-full"><FaWhatsapp size={18} /></div>
                <div className="p-2 rounded-full"><Share size={18} /></div>
              </div>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
