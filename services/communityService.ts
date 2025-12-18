
import { CommunityMeme, SortOption } from '../types';

const STORAGE_KEY = 'memegenius_community_memes';

// Initial Mock Data
const MOCK_MEMES: CommunityMeme[] = [
  {
    id: 'mock-1',
    image: 'https://picsum.photos/id/1011/600/400',
    topText: 'When the AI',
    bottomText: 'Actually writes good code',
    upvotes: 42,
    downvotes: 2,
    createdAt: Date.now() - 3600000,
    author: 'CodeWizard'
  },
  {
    id: 'mock-2',
    image: 'https://picsum.photos/id/1012/600/400',
    topText: 'Deployment successful',
    bottomText: 'On a Friday afternoon',
    upvotes: 150,
    downvotes: 10,
    createdAt: Date.now() - 86400000 * 2,
    author: 'RiskTaker'
  }
];

export const communityService = {
  getMemes: (sort: SortOption): CommunityMeme[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let memes: CommunityMeme[] = stored ? JSON.parse(stored) : MOCK_MEMES;

    const now = Date.now();
    const oneDay = 86400000;
    const oneWeek = 604800000;

    switch (sort) {
      case 'day':
        memes = memes.filter(m => (now - m.createdAt) <= oneDay);
        break;
      case 'week':
        memes = memes.filter(m => (now - m.createdAt) <= oneWeek);
        break;
      default:
        break;
    }

    return memes.sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt;
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      return scoreB - scoreA;
    });
  },

  publishMeme: (meme: Omit<CommunityMeme, 'id' | 'upvotes' | 'downvotes' | 'createdAt' | 'author'>): void => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const memes: CommunityMeme[] = stored ? JSON.parse(stored) : MOCK_MEMES;
    
    const newMeme: CommunityMeme = {
      ...meme,
      id: Math.random().toString(36).substr(2, 9),
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
      author: 'Anonymous User'
    };

    memes.push(newMeme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memes));
  },

  vote: (id: string, type: 'up' | 'down'): void => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const memes: CommunityMeme[] = JSON.parse(stored);
    const index = memes.findIndex(m => m.id === id);
    if (index !== -1) {
      if (type === 'up') memes[index].upvotes++;
      else memes[index].downvotes++;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memes));
    }
  }
};
