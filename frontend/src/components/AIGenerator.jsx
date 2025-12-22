import React, { useState } from 'react';
import { Sparkles, Upload, Link as LinkIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
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
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextGenerate = async () => {
    if (!textPrompt.trim()) {
      setStatus({ type: 'error', message: 'Please enter a description!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Generating 3D model from text... (may take 2-5 minutes)' });

      const response = await tripoAPI.generateFromText({
        prompt: textPrompt,
        name: name || undefined,
        description: description || undefined
      });

      setStatus({ 
        type: 'success', 
        message: 'Generation started! The model will appear in the list in a few minutes.' 
      });

      // Reset form
      setTimeout(() => {
        setTextPrompt('');
        setName('');
        setDescription('');
        setStatus(null);
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating model!' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUrlGenerate = async () => {
    if (!imageUrl.trim()) {
      setStatus({ type: 'error', message: 'Please enter an image URL!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Generating 3D model from image... (may take 2-5 minutes)' });

      const response = await tripoAPI.generateFromImageUrl({
        imageUrl: imageUrl,
        name: name || undefined,
        description: description || undefined
      });

      setStatus({ 
        type: 'success', 
        message: 'Generation started! The model will appear in the list in a few minutes.' 
      });

      setTimeout(() => {
        setImageUrl('');
        setName('');
        setDescription('');
        setStatus(null);
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating model!' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageFileGenerate = async () => {
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Please select an image file!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Uploading and generating 3D model... (may take 2-5 minutes)' });

      const formData = new FormData();
      formData.append('image', imageFile);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);

      const response = await tripoAPI.generateFromImageFile(formData);

      setStatus({ 
        type: 'success', 
        message: 'Generation started! The model will appear in the list in a few minutes.' 
      });

      setTimeout(() => {
        setImageFile(null);
        setImagePreview(null);
        setName('');
        setDescription('');
        setStatus(null);
        if (onGenerationComplete) onGenerationComplete();
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error generating model!' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    switch (activeTab) {
      case 'text':
        handleTextGenerate();
        break;
      case 'image-url':
        handleImageUrlGenerate();
        break;
      case 'image-file':
        handleImageFileGenerate();
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            AI Generator - Create 3D models
          </h2>
          <p className="text-sm text-gray-600">
            Powered by UwU
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'text'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📝 Document
        </button>
        <button
          onClick={() => setActiveTab('image-url')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'image-url'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 Image URL
        </button>
        <button
          onClick={() => setActiveTab('image-file')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'image-file'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📸 Upload Image
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-700' :
          status.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           status.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
           <Loader className="w-5 h-5 animate-spin" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="space-y-4">
        {activeTab === 'text' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model Description *
              </label>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Ví dụ: A golden diamond ring with intricate floral patterns..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition resize-none"
                disabled={generating}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Provide a detailed description in English for best results.
              </p>
            </div>
          </>
        )}

        {activeTab === 'image-url' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image URL *
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  disabled={generating}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Clear images with good angles will produce more accurate results
              </p>
            </div>
          </>
        )}

        {activeTab === 'image-file' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={generating}
                />
                <label htmlFor="imageFile" className="cursor-pointer">
                  {imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-xs max-h-64 mx-auto rounded-lg shadow-lg mb-3"
                      />
                      <p className="text-sm text-gray-600">
                        {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">
                        Click to select image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP (Max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name for your model"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
              disabled={generating}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your model"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
              disabled={generating}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating model...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create 3D Model
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>⏱️ Time:</strong> Approximately 2-5 minutes to complete<br/>
            <strong>📦 Format:</strong> GLB (compatible with all browsers)<br/>
            <strong>✨ Powered by:</strong> UwU - State-of-the-art 3D generation
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;