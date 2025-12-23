import React, { useState } from 'react';
import { Sparkles, Upload, Link as LinkIcon, Loader, CheckCircle, AlertCircle, FileType, Image as ImageIcon } from 'lucide-react';
import { tripoAPI } from '../services/api.js';

const AIGenerator = ({ onGenerationComplete }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'image-url', 'image-file'
  const [textPrompt, setTextPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextGenerate = async () => {
    if (!textPrompt.trim()) {
      setStatus({ type: 'error', message: 'Please provide a detailed description.' });
      return;
    }
    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'UwU AI is drafting your concept... (Estimated: 2-5 mins)' });
      await tripoAPI.generateFromText({
        prompt: textPrompt,
        name: name || undefined,
        description: description || undefined
      });
      setStatus({ 
        type: 'success', 
        message: 'Concept drafted successfully. Model processing initiated.' 
      });
      setTimeout(() => {
        resetForm();
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating concept.' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUrlGenerate = async () => {
    if (!imageUrl.trim()) {
      setStatus({ type: 'error', message: 'Please provide a valid image URL.' });
      return;
    }
    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Analyzing visual data... (Estimated: 2-5 mins)' });
      await tripoAPI.generateFromImageUrl({
        imageUrl: imageUrl,
        name: name || undefined,
        description: description || undefined
      });
      setStatus({ 
        type: 'success', 
        message: 'Visual data processed. Model synthesis initiated.' 
      });
      setTimeout(() => {
        resetForm();
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating concept.' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageFileGenerate = async () => {
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Please upload a reference image.' });
      return;
    }
    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Uploading reference material... (Estimated: 2-5 mins)' });
      const formData = new FormData();
      formData.append('image', imageFile);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);
      await tripoAPI.generateFromImageFile(formData);
      setStatus({ 
        type: 'success', 
        message: 'Reference uploaded. Model synthesis initiated.' 
      });
      setTimeout(() => {
        resetForm();
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating concept.' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    switch (activeTab) {
      case 'text': handleTextGenerate(); break;
      case 'image-url': handleImageUrlGenerate(); break;
      case 'image-file': handleImageFileGenerate(); break;
    }
  };

  const resetForm = () => {
    setTextPrompt('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setName('');
    setDescription('');
    setStatus(null);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
        {[
          { id: 'text', label: 'Text Prompt', icon: FileType },
          { id: 'image-url', label: 'Image URL', icon: LinkIcon },
          { id: 'image-file', label: 'Upload Image', icon: ImageIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-6">
        {activeTab === 'text' && (
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Concept Description</label>
            <textarea
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="e.g. A ring inspired by Martian architecture with red crystalline facets and floating gold bands..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
              disabled={generating}
            />
            <p className="text-[10px] text-gray-400 italic text-right">Drafted in English for optimal results.</p>
          </div>
        )}

        {activeTab === 'image-url' && (
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Reference URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/reference.jpg"
                className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                disabled={generating}
              />
            </div>
          </div>
        )}

        {activeTab === 'image-file' && (
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Reference Upload</label>
            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors group relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={generating}
              />
              {imagePreview ? (
                <div className="relative z-10">
                   <img src={imagePreview} alt="Preview" className="h-32 mx-auto object-contain rounded-lg shadow-sm mb-2" />
                   <p className="text-xs text-gray-500">{imageFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                   <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                      <Upload size={20} />
                   </div>
                   <p className="text-xs text-gray-500 font-medium">Drop reference image here</p>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest">PNG, JPG, WEBP • MAX 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Common Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Concept Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Alpha"
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                disabled={generating}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Brief Notes</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                disabled={generating}
              />
           </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="space-y-4">
        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium border ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
            status.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
            'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {status.type === 'success' ? <CheckCircle size={16} /> :
             status.type === 'error' ? <AlertCircle size={16} /> :
             <Loader className="animate-spin" size={16} />}
            {status.message}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          {generating ? 'Processing Concept...' : 'Initiate Generation'}
        </button>

        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
           Powered by UwU AI • Estimated Time: 2-5 Minutes
        </p>
      </div>
    </div>
  );
};

export default AIGenerator;