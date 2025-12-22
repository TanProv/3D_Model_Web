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
      setStatus({ type: 'error', message: 'Vui lòng nhập mô tả!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Đang tạo mô hình 3D từ văn bản... (có thể mất 2-5 phút)' });

      const response = await tripoAPI.generateFromText({
        prompt: textPrompt,
        name: name || undefined,
        description: description || undefined
      });

      setStatus({ 
        type: 'success', 
        message: 'Đã bắt đầu tạo mô hình! Mô hình sẽ xuất hiện trong danh sách sau vài phút.' 
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
        message: error.response?.data?.message || 'Lỗi khi tạo mô hình!' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUrlGenerate = async () => {
    if (!imageUrl.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập URL hình ảnh!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Đang tạo mô hình 3D từ hình ảnh... (có thể mất 2-5 phút)' });

      const response = await tripoAPI.generateFromImageUrl({
        imageUrl: imageUrl,
        name: name || undefined,
        description: description || undefined
      });

      setStatus({ 
        type: 'success', 
        message: 'Đã bắt đầu tạo mô hình! Mô hình sẽ xuất hiện trong danh sách sau vài phút.' 
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
        message: error.response?.data?.message || 'Lỗi khi tạo mô hình!' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageFileGenerate = async () => {
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Vui lòng chọn file hình ảnh!' });
      return;
    }

    try {
      setGenerating(true);
      setStatus({ type: 'info', message: 'Đang tải lên và tạo mô hình 3D... (có thể mất 2-5 phút)' });

      const formData = new FormData();
      formData.append('image', imageFile);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);

      const response = await tripoAPI.generateFromImageFile(formData);

      setStatus({ 
        type: 'success', 
        message: 'Đã bắt đầu tạo mô hình! Mô hình sẽ xuất hiện trong danh sách sau vài phút.' 
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
        message: error.response?.data?.message || 'Lỗi khi tạo mô hình!' 
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
            AI Generator - Tạo mô hình 3D
          </h2>
          <p className="text-sm text-gray-600">
            Powered by Tripo AI
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
          📝 Văn bản
        </button>
        <button
          onClick={() => setActiveTab('image-url')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'image-url'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 URL Hình ảnh
        </button>
        <button
          onClick={() => setActiveTab('image-file')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'image-file'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📸 Upload Hình ảnh
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
                Mô tả mô hình *
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
                💡 Mô tả chi tiết bằng tiếng Anh để có kết quả tốt nhất
              </p>
            </div>
          </>
        )}

        {activeTab === 'image-url' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Hình ảnh *
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
                💡 Hình ảnh rõ nét, góc nhìn tốt sẽ cho kết quả chính xác hơn
              </p>
            </div>
          </>
        )}

        {activeTab === 'image-file' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Hình ảnh *
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
                        Click để chọn hình ảnh
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
              Tên mô hình (tùy chọn)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên cho mô hình của bạn"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
              disabled={generating}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn"
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
              Đang tạo mô hình...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Tạo mô hình 3D
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>⏱️ Thời gian:</strong> Khoảng 2-5 phút để hoàn thành<br/>
            <strong>📦 Định dạng:</strong> GLB (tương thích với mọi trình duyệt)<br/>
            <strong>✨ Powered by:</strong> Tripo AI - State-of-the-art 3D generation
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;