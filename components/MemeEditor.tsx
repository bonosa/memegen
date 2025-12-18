
import React, { useRef, useEffect } from 'react';

interface MemeEditorProps {
  image: string;
  topText: string;
  bottomText: string;
}

export const MemeEditor: React.FC<MemeEditorProps> = ({ image, topText, bottomText }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-900 aspect-auto flex items-center justify-center min-h-[400px]"
    >
      <img 
        src={image} 
        alt="Meme base" 
        className="max-w-full h-auto object-contain block"
        crossOrigin="anonymous"
      />
      
      {/* Top Text Overlay */}
      <div className="absolute top-4 left-0 right-0 px-4 text-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-black text-white meme-font break-words drop-shadow-lg">
          {topText}
        </h2>
      </div>

      {/* Bottom Text Overlay */}
      <div className="absolute bottom-4 left-0 right-0 px-4 text-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-black text-white meme-font break-words drop-shadow-lg">
          {bottomText}
        </h2>
      </div>
    </div>
  );
};
