'use client';

import { BarChart2, Share } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import toast from 'react-hot-toast';

export default function ShareButtons({ item, isDetail = false }: { item: any, isDetail?: boolean }) {
  const handleShare = (e: React.MouseEvent, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${item._id}` : '';
    const shareTitle = item.title;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
    } else if (platform === 'native') {
      if (navigator.share) {
        navigator.share({
          title: shareTitle,
          url: shareUrl
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } else if (platform === 'instagram') {
      // Instagram web doesn't have a direct share URL, fallback to copying link
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! You can now paste it in Instagram.');
    }
  };

  const iconSize = isDetail ? 22 : 18;

  return (
    <div className={`flex ${isDetail ? 'justify-around py-3' : 'justify-between mt-1 max-w-md'} text-muted`}>
      {!isDetail && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center gap-2 hover:text-blue-500 group transition-colors cursor-default">
          <div className="p-2 rounded-full group-hover:bg-blue-500/10"><BarChart2 size={iconSize} /></div>
          <span className="text-sm">{item.views || 0}</span>
        </button>
      )}
      <button onClick={(e) => handleShare(e, 'twitter')} className="flex items-center gap-2 hover:text-gray-300 group transition-colors">
        <div className="p-2 rounded-full group-hover:bg-gray-500/10"><FaXTwitter size={iconSize} /></div>
      </button>
      <button onClick={(e) => handleShare(e, 'facebook')} className="flex items-center gap-2 hover:text-blue-600 group transition-colors">
        <div className="p-2 rounded-full group-hover:bg-blue-600/10"><FaFacebook size={iconSize} /></div>
      </button>
      <button onClick={(e) => handleShare(e, 'instagram')} className="flex items-center gap-2 hover:text-pink-600 group transition-colors">
        <div className="p-2 rounded-full group-hover:bg-pink-600/10"><FaInstagram size={iconSize} /></div>
      </button>
      <button onClick={(e) => handleShare(e, 'whatsapp')} className="flex items-center gap-2 hover:text-green-500 group transition-colors">
        <div className="p-2 rounded-full group-hover:bg-green-500/10"><FaWhatsapp size={iconSize} /></div>
      </button>
      <button onClick={(e) => handleShare(e, 'native')} className="flex items-center gap-2 hover:text-blue-500 group transition-colors">
        <div className="p-2 rounded-full group-hover:bg-blue-500/10"><Share size={iconSize} /></div>
      </button>
    </div>
  );
}
