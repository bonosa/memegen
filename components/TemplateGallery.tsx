
import React from 'react';
import { MemeTemplate } from '../types';

const TRENDING_TEMPLATES: MemeTemplate[] = [
  { id: '1', name: 'Distracted Boyfriend', url: 'https://picsum.photos/id/1011/600/400' },
  { id: '2', name: 'Success Kid', url: 'https://picsum.photos/id/1012/600/400' },
  { id: '3', name: 'Thinking Guy', url: 'https://picsum.photos/id/1013/600/400' },
  { id: '4', name: 'Woman Yelling', url: 'https://picsum.photos/id/1015/600/400' },
  { id: '5', name: 'Drake Hotline Bling', url: 'https://picsum.photos/id/1016/600/400' },
  { id: '6', name: 'Two Buttons', url: 'https://picsum.photos/id/1018/600/400' },
];

interface GalleryProps {
  onSelect: (url: string) => void;
}

export const TemplateGallery: React.FC<GalleryProps> = ({ onSelect }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-fire text-orange-500"></i>
        Trending Templates
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {TRENDING_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.url)}
            className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
          >
            <img 
              src={tpl.url} 
              alt={tpl.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-xs font-bold text-white px-2 text-center">{tpl.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
