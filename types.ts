
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

export interface SuggestedCaption {
  text: string;
  category: 'funny' | 'sarcastic' | 'wholesome' | 'edgy' | 'smart';
}

export interface MemeState {
  image: string | null;
  topText: string;
  bottomText: string;
  loading: boolean;
  suggestions: SuggestedCaption[];
  error: string | null;
}

export interface CommunityMeme {
  id: string;
  image: string;
  topText: string;
  bottomText: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  author: string;
}

export type SortOption = 'newest' | 'day' | 'week' | 'all';
