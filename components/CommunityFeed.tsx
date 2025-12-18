
import React, { useState, useEffect } from 'react';
import { communityService } from '../services/communityService';
import { CommunityMeme, SortOption } from '../types';

export const CommunityFeed: React.FC = () => {
  const [sort, setSort] = useState<SortOption>('newest');
  const [memes, setMemes] = useState<CommunityMeme[]>([]);

  const loadMemes = () => {
    const data = communityService.getMemes(sort);
    setMemes(data);
  };

  useEffect(() => {
    loadMemes();
  }, [sort]);

  const handleVote = (id: string, type: 'up' | 'down') => {
    communityService.vote(id, type);
    loadMemes();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-users text-blue-500"></i>
          Community Gallery
        </h2>
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
          {(['newest', 'day', 'week', 'all'] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                sort === opt 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt === 'newest' ? 'New' : opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500">
            <i className="fa-solid fa-ghost text-4xl mb-4 opacity-20"></i>
            <p>No memes here yet. Be the first to publish!</p>
          </div>
        ) : (
          memes.map((meme) => (
            <div key={meme.id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 flex flex-col group shadow-xl">
              <div className="relative aspect-square sm:aspect-video flex items-center justify-center bg-black overflow-hidden">
                <img src={meme.image} className="max-w-full h-auto object-contain" alt="Community meme" />
                <div className="absolute top-2 left-0 right-0 px-2 text-center pointer-events-none">
                  <span className="text-lg sm:text-2xl font-black text-white meme-font drop-shadow-md">{meme.topText}</span>
                </div>
                <div className="absolute bottom-2 left-0 right-0 px-2 text-center pointer-events-none">
                  <span className="text-lg sm:text-2xl font-black text-white meme-font drop-shadow-md">{meme.bottomText}</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleVote(meme.id, 'up')}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 transition-all flex items-center justify-center border border-slate-700 hover:border-emerald-500/50"
                    >
                      <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <span className="font-bold text-sm min-w-[20px] text-center">
                      {(meme.upvotes - meme.downvotes).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => handleVote(meme.id, 'down')}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-700 hover:border-red-500/50"
                    >
                      <i className="fa-solid fa-arrow-down"></i>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">@{meme.author.toLowerCase().replace(' ', '')}</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-tighter">
                    {new Date(meme.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
