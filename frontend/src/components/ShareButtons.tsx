'use client';

import { BarChart2, Send, X } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import LiveViewCounter from '@/components/LiveViewCounter';
import { useState, useRef, useEffect } from 'react';

export default function ShareButtons({ item, isDetail = false }: { item: any, isDetail?: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleShare = (e: React.MouseEvent, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${item._id}` : '';
    
    let shareText = item.title;
    if (!shareText && item.content) {
      const plainText = item.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      shareText = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
    }
    const shareTitle = shareText || 'Breaking News on RawWire';

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'native') {
      if (typeof navigator.share === 'function') {
        navigator.share({
          url: shareUrl
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! You can now paste it in Instagram.');
    }
    setShowMenu(false);
  };

  const iconSize = isDetail ? 22 : 18;

  return (
    <div className={`flex ${isDetail ? 'justify-end py-3' : 'justify-between mt-1 w-full max-w-[200px]'} text-muted relative`} ref={menuRef}>
      {!isDetail && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center gap-2 hover:text-blue-500 group transition-colors cursor-default">
          <div className="p-2 rounded-full group-hover:bg-blue-500/10"><BarChart2 size={iconSize} /></div>
          <span className="text-sm"><LiveViewCounter newsId={item._id} initialViews={item.views || 0} /></span>
        </button>
      )}
      
      <div className="flex items-center gap-1 ml-auto">
        <button onClick={(e) => handleShare(e, 'whatsapp')} className="flex items-center gap-2 hover:text-green-500 group transition-colors">
          <div className="p-2 rounded-full group-hover:bg-green-500/10"><FaWhatsapp size={iconSize} /></div>
        </button>

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof navigator.share === 'function') {
              handleShare(e, 'native');
            } else {
              setShowMenu(!showMenu);
            }
          }} 
          className="flex items-center gap-2 hover:text-blue-500 group transition-colors"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/10"><Send size={iconSize} /></div>
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 bottom-full mb-2 bg-[#1a1a1a] border border-border rounded-xl shadow-2xl p-2 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
          <button onClick={(e) => handleShare(e, 'twitter')} className="p-3 hover:bg-gray-500/20 rounded-lg text-white transition-colors">
            <FaXTwitter size={20} />
          </button>
          <button onClick={(e) => handleShare(e, 'facebook')} className="p-3 hover:bg-blue-600/20 rounded-lg text-blue-500 transition-colors">
            <FaFacebook size={20} />
          </button>
          <button onClick={(e) => handleShare(e, 'instagram')} className="p-3 hover:bg-pink-600/20 rounded-lg text-pink-500 transition-colors">
            <FaInstagram size={20} />
          </button>
          <button onClick={(e) => { setShowMenu(false); e.preventDefault(); e.stopPropagation(); }} className="p-3 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors ml-2 border-l border-border pl-4">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
