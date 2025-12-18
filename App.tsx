
import React, { useState, useCallback, useRef } from 'react';
import { MemeEditor } from './components/MemeEditor';
import { TemplateGallery } from './components/TemplateGallery';
import { CommunityFeed } from './components/CommunityFeed';
import { analyzeAndSuggestCaptions, editImageWithAI, generateMemeBackground } from './services/geminiService';
import { communityService } from './services/communityService';
import { SuggestedCaption } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'community'>('create');
  const [image, setImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [genPrompt, setGenPrompt] = useState('');
  const [genAspectRatio, setGenAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setSuggestions([]);
        setTopText('');
        setBottomText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicCaption = async () => {
    if (!image) return;
    setIsMagicLoading(true);
    setError(null);
    try {
      const aiSuggestions = await analyzeAndSuggestCaptions(image);
      setSuggestions(aiSuggestions);
    } catch (err) {
      setError("AI was too busy laughing at another meme. Try again!");
      console.error(err);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!image || !editPrompt) return;
    setIsEditLoading(true);
    setError(null);
    try {
      const editedUrl = await editImageWithAI(image, editPrompt);
      if (editedUrl) {
        setImage(editedUrl);
        setEditPrompt('');
      } else {
        setError("Couldn't process that edit request.");
      }
    } catch (err) {
      setError("AI editing failed. Maybe try a simpler prompt?");
      console.error(err);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleGenerateBackground = async () => {
    if (!genPrompt) return;
    setIsGenLoading(true);
    setError(null);
    try {
      const generatedUrl = await generateMemeBackground(genPrompt, genAspectRatio);
      if (generatedUrl) {
        setImage(generatedUrl);
        setGenPrompt('');
      } else {
        setError("AI failed to imagine that background.");
      }
    } catch (err) {
      setError("Generation failed. Try a different description.");
      console.error(err);
    } finally {
      setIsGenLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!image) return;
    setIsPublishing(true);
    try {
      communityService.publishMeme({
        image,
        topText,
        bottomText
      });
      setActiveTab('community');
    } catch (err) {
      setError("Failed to publish your masterpiece.");
    } finally {
      setIsPublishing(false);
    }
  };

  const applySuggestion = (text: string) => {
    const words = text.split(' ');
    if (words.length > 5) {
      const midpoint = Math.ceil(words.length / 2);
      setTopText(words.slice(0, midpoint).join(' '));
      setBottomText(words.slice(midpoint).join(' '));
    } else {
      setTopText(text);
      setBottomText('');
    }
  };

  const handleTemplateSelect = (url: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      setImage(canvas.toDataURL("image/png"));
      setSuggestions([]);
      setTopText('');
      setBottomText('');
    };
    img.src = url;
  };

  const reset = () => {
    setImage(null);
    setTopText('');
    setBottomText('');
    setSuggestions([]);
    setError(null);
  };

  const surpriseMe = () => {
    const prompts = [
      "A cat riding a unicorn through a galaxy of pizza slices",
      "A futuristic city built entirely of giant LEGO blocks",
      "A medieval knight fighting a giant rubber duck",
      "Cyberpunk Shiba Inu wearing neon sunglasses in Tokyo",
      "A cozy cottage made of giant marshmallows in a candy forest"
    ];
    setGenPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 py-4 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-face-laugh-squint text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MemeGenius <span className="text-blue-500">AI</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-800 rounded-full p-1 flex">
              <button 
                onClick={() => setActiveTab('create')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Create
              </button>
              <button 
                onClick={() => setActiveTab('community')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'community' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Feed
              </button>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full font-semibold transition-all items-center gap-2"
            >
              <i className="fa-solid fa-upload"></i>
              Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Side: Preview & Canvas */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {!image ? (
                <div 
                  className="w-full aspect-video border-4 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 bg-slate-900/20"
                >
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-wand-magic-sparkles text-blue-500 text-2xl"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Start Your Masterpiece</h2>
                      <p className="text-slate-400 max-w-sm">Upload an image, pick a template, or generate a brand new background with AI below.</p>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-all mt-2"
                    >
                      <i className="fa-solid fa-upload mr-2"></i>
                      Upload Image
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <MemeEditor image={image} topText={topText} bottomText={bottomText} />
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleMagicCaption}
                      disabled={isMagicLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20"
                    >
                      {isMagicLoading ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      )}
                      {isMagicLoading ? "Analyzing Vibe..." : "Magic Caption"}
                    </button>
                    <button 
                      onClick={handlePublish}
                      disabled={isPublishing || !image}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20"
                    >
                      {isPublishing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                      Publish
                    </button>
                    <button 
                      onClick={reset}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 rounded-2xl transition-colors"
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                    </button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">AI Suggested Captions</h4>
                        <button onClick={() => setSuggestions([])} className="text-slate-600 hover:text-slate-400">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => applySuggestion(s)}
                            className="text-left bg-slate-800/50 hover:bg-slate-800 text-slate-200 px-4 py-3 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                          >
                            <span className="italic">"{s}"</span>
                            <i className="fa-solid fa-plus opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* New: AI Image Generator Section */}
              <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl mt-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <i className="fa-solid fa-image-polaroid text-indigo-500"></i>
                    AI Background Generator
                  </h3>
                  <button 
                    onClick={surpriseMe}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"
                  >
                    Surprise Me
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <textarea 
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      placeholder="Describe the background you want to see... (e.g. 'A cat dressed as a space explorer on Mars')"
                      className="flex-1 min-h-[100px] bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-200"
                    />
                    <div className="flex flex-col gap-2">
                      {(["1:1", "16:9", "9:16"] as const).map(ratio => (
                        <button
                          key={ratio}
                          onClick={() => setGenAspectRatio(ratio)}
                          className={`w-14 h-10 rounded-lg text-[10px] font-bold border transition-all ${genAspectRatio === ratio ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerateBackground}
                    disabled={isGenLoading || !genPrompt}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20"
                  >
                    {isGenLoading ? (
                      <i className="fa-solid fa-atom fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-brush"></i>
                    )}
                    {isGenLoading ? "Imagining Background..." : "Generate Custom Background"}
                  </button>
                </div>
              </section>

              <TemplateGallery onSelect={handleTemplateSelect} />
            </div>

            {/* Right Side: Controls & AI Editing */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-pen-nib text-blue-500"></i>
                  Caption Editor
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Top Text</label>
                    <input 
                      type="text" 
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="Enter top text..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bottom Text</label>
                    <input 
                      type="text" 
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="Enter bottom text..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-robot text-purple-500"></i>
                  AI Image Editor
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Describe what you want to change (e.g., "Add sunglasses", "Make it look like oil painting")
                </p>
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe your edit..."
                    className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none text-slate-200"
                  />
                  <button 
                    onClick={handleAIEdit}
                    disabled={isEditLoading || !image || !editPrompt}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20"
                  >
                    {isEditLoading ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-sparkles"></i>
                    )}
                    {isEditLoading ? "Transforming..." : "Apply AI Edit"}
                  </button>
                </div>
              </section>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-auto pt-6 text-center text-slate-600 text-xs font-medium">
                <p>Powered by Gemini 3 Pro & 2.5 Flash Image</p>
              </div>
            </div>
          </div>
        ) : (
          <CommunityFeed />
        )}
      </main>

      {/* Floating Action Bar (Mobile Only) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex gap-2 shadow-2xl">
          <button 
            onClick={() => { setActiveTab('create'); fileInputRef.current?.click(); }}
            className="flex-1 bg-slate-800 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            New
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'community') setActiveTab('create');
              else handleMagicCaption();
            }}
            className="flex-[2] bg-blue-600 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            {activeTab === 'community' ? 'Start Creating' : 'Magic'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
