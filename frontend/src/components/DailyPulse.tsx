'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getApiUrl } from '@/lib/api';
import { BarChart3 } from 'lucide-react';

interface PollOption {
  _id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export default function DailyPulse() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for previous vote
    if (localStorage.getItem('voted_poll_id')) {
      setHasVoted(true);
    }

    const fetchPoll = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/polls/active`);
        if (res.ok) {
          const data = await res.json();
          setPoll(data);
          if (localStorage.getItem('voted_poll_id') === data._id) {
            setHasVoted(true);
          } else {
            setHasVoted(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch poll", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();

    const socket = io(getApiUrl().replace('/api', ''), {
      transports: ['websocket'],
    });

    socket.on('poll_updated', (updatedPoll: Poll) => {
      setPoll(prev => {
        if (prev && prev._id === updatedPoll._id) {
          return updatedPoll;
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleVote = async (optionId: string) => {
    if (hasVoted || !poll) return;

    // Optimistic UI update
    setHasVoted(true);
    localStorage.setItem('voted_poll_id', poll._id);

    try {
      await fetch(`${getApiUrl()}/polls/${poll._id}/vote/${optionId}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error("Failed to cast vote", err);
      setHasVoted(false);
      localStorage.removeItem('voted_poll_id');
    }
  };

  if (loading || !poll) return null;

  return (
    <div className="w-full bg-[#111] border border-border rounded-2xl p-5 mb-8 shadow-xl relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
      
      <div className="flex items-center gap-2 mb-4 text-cyan-400 font-bold tracking-widest uppercase text-sm">
        <BarChart3 size={18} /> Daily Pulse
      </div>
      
      <h3 className="text-xl md:text-2xl font-extrabold mb-5 leading-tight">{poll.question}</h3>
      
      <div className="flex flex-col gap-3 relative z-10">
        {poll.options.map((option) => (
          <button
            key={option._id}
            onClick={() => handleVote(option._id)}
            disabled={hasVoted}
            className={`relative w-full text-left overflow-hidden rounded-xl border transition-all duration-300 ${
              hasVoted 
                ? 'border-white/10 bg-white/5 cursor-default' 
                : 'border-white/20 hover:border-cyan-400/50 hover:bg-white/10 cursor-pointer'
            }`}
          >
            {/* Animated Progress Bar */}
            {hasVoted && (
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 transition-all duration-1000 ease-out"
                style={{ width: `${option.percentage}%` }}
              ></div>
            )}
            
            <div className="relative z-10 flex justify-between items-center p-3 md:p-4">
              <span className="font-medium text-[15px] md:text-base">{option.text}</span>
              {hasVoted && (
                <span className="font-bold text-cyan-400">{option.percentage}%</span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {hasVoted && (
        <div className="mt-4 text-center text-xs text-muted font-medium">
          {poll.totalVotes} total votes · Live Updates
        </div>
      )}
    </div>
  );
}
