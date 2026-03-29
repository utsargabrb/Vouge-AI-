import React, { useState, useRef } from 'react';
import { Controls } from './components/Controls';
import { Spinner } from './components/Spinner';
import { generateTryOn, generateConcept, editImage } from './services/geminiService';
import { ModelSettings, Gender, Size, Ethnicity, AppMode } from './types';

// Icons
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
const MagicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1V8a1 1 0 011-1zm5-5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1zM9 12a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.TryOn);
  const [settings, setSettings] = useState<ModelSettings>({
    gender: Gender.Female,
    size: Size.M,
    ethnicity: Ethnicity.Any,
    vibe: '',
  });
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [conceptPrompt, setConceptPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage(null); // Reset result on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      let result = '';
      if (mode === AppMode.TryOn) {
        if (!uploadedImage) throw new Error("Please upload an image of the clothing first.");
        result = await generateTryOn(uploadedImage, settings);
      } else {
        if (!conceptPrompt.trim()) throw new Error("Please describe the concept you want to generate.");
        result = await generateConcept(conceptPrompt, settings);
      }
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage) return;
    if (!editPrompt.trim()) return;

    setError(null);
    setIsEditing(true);
    try {
      const result = await editImage(generatedImage, editPrompt);
      setGeneratedImage(result);
      setEditPrompt('');
    } catch (err: any) {
      setError(err.message || "Could not edit the image.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-fashion-black text-gray-200 selection:bg-fashion-accent selection:text-black pb-20">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fashion-accent rounded-full flex items-center justify-center text-black font-serif font-bold text-lg">V</div>
            <h1 className="text-2xl font-serif tracking-tight text-white">Vogue<span className="text-fashion-accent font-light">AI</span></h1>
          </div>
          
          <nav className="flex bg-white/5 rounded-full p-1">
            <button 
              onClick={() => setMode(AppMode.TryOn)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === AppMode.TryOn ? 'bg-fashion-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Virtual Try-On
            </button>
            <button 
              onClick={() => setMode(AppMode.Generator)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === AppMode.Generator ? 'bg-fashion-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Concept Studio
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Mode Specific Input */}
            <div className="bg-fashion-dark p-6 rounded-2xl border border-white/10 shadow-xl">
              {mode === AppMode.TryOn ? (
                <>
                  <h2 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <CameraIcon />
                    Upload Garment
                  </h2>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 overflow-hidden group ${uploadedImage ? 'border-fashion-accent' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'}`}
                  >
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Upload" className="absolute inset-0 w-full h-full object-contain bg-black/50 p-4" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 group-hover:text-gray-300">
                        <UploadIcon />
                        <span className="mt-2 text-sm font-medium">Drop image here or click to upload</span>
                        <span className="mt-1 text-xs text-gray-600">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    {uploadedImage && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to change
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <MagicIcon />
                    Concept Prompt
                  </h2>
                  <textarea 
                    value={conceptPrompt}
                    onChange={(e) => setConceptPrompt(e.target.value)}
                    placeholder="Describe the look, clothing materials, and artistic style..."
                    className="w-full h-64 bg-fashion-black border border-gray-700 rounded-xl p-4 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none resize-none placeholder-gray-600"
                  />
                </>
              )}
            </div>

            {/* Model Controls */}
            <Controls settings={settings} setSettings={setSettings} disabled={isGenerating || isEditing} />

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (mode === AppMode.TryOn && !uploadedImage) || (mode === AppMode.Generator && !conceptPrompt)}
              className="w-full bg-fashion-accent hover:bg-[#B59530] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" />
                  <span>Curating Look...</span>
                </>
              ) : (
                <>
                  <span>Generate Masterpiece</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[600px] bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center group">
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated Fashion" 
                    className="max-h-full max-w-full object-contain shadow-2xl" 
                  />
                ) : (
                  <div className="text-center p-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-2xl font-serif text-gray-400 mb-2">Canvas Empty</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      {mode === AppMode.TryOn 
                        ? "Upload a garment and configure the model to start your virtual photoshoot." 
                        : "Describe your vision to generate a high-fashion concept."}
                    </p>
                  </div>
                )}

                {/* Overlay Loader */}
                {(isGenerating || isEditing) && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Spinner size="lg" />
                    <p className="mt-6 text-fashion-accent font-serif text-xl animate-pulse">
                      {isEditing ? "Refining Details..." : "Rendering High Fidelity..."}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">Using {isEditing ? "Gemini 2.5 Flash Image" : (mode === AppMode.TryOn ? "Gemini 2.5 Flash Image" : "Imagen 4")}</p>
                  </div>
                )}
              </div>

              {/* Magic Edit Bar */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <MagicIcon />
                  Smart Edit <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded ml-2">Powered by Nano Banana</span>
                </label>
                <div className="relative flex gap-2">
                  <input 
                    type="text" 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    disabled={!generatedImage || isEditing || isGenerating}
                    placeholder={generatedImage ? "e.g. 'Add vintage film grain', 'Change background to beach', 'Add sunglasses'..." : "Generate an image first to enable editing"}
                    className="flex-1 bg-fashion-dark border border-gray-700 rounded-xl px-6 py-4 text-white focus:border-fashion-accent focus:ring-1 focus:ring-fashion-accent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                  />
                  <button
                    onClick={handleEdit}
                    disabled={!generatedImage || !editPrompt.trim() || isEditing || isGenerating}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-transparent disabled:text-gray-600 text-white px-8 rounded-xl font-medium transition-all border border-white/10"
                  >
                    Apply
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}