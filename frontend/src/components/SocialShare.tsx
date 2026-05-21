'use client';
import { Share2 } from 'lucide-react';

export default function SocialShare({ url, title }: { url: string; title: string }) {
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex gap-4 mt-10 flex-wrap">
      <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="neo-btn bg-neo-green px-5 py-3 hover:scale-105 text-black">
        <span className="font-black text-lg">WhatsApp</span>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="neo-btn bg-black text-white px-5 py-3 hover:scale-105 border-transparent">
        <span className="font-black text-lg">X (Twitter)</span>
      </a>
      <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="neo-btn bg-[#1877F2] text-white px-5 py-3 hover:scale-105 border-transparent">
        <span className="font-black text-lg">Facebook</span>
      </a>
      <button onClick={copyToClipboard} className="neo-btn bg-gray-200 dark:bg-zinc-700 text-black dark:text-white px-5 py-3 hover:scale-105">
        <Share2 size={24} strokeWidth={3} className="mr-2" />
        <span className="font-black text-lg">Copy Link</span>
      </button>
    </div>
  );
}
