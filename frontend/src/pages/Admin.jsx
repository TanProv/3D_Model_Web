import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { modelAPI, getAssetUrl } from '../services/api.js';
import AIGenerator from '../components/AIGenerator.jsx';

const Admin = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelFile: null,
    thumbnailFile: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await modelAPI.getAll({ limit: 100 });
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Error loading model list:', error);
      alert('Unable to load the list of models');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      if (name === 'thumbnailFile') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.modelFile) {
      alert('Please enter a name and select a 3D model file to upload.');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || '');
      data.append('model', formData.modelFile);
      
      if (formData.thumbnailFile) {
        data.append('thumbnail', formData.thumbnailFile);
      }

      await modelAPI.upload(data);
      
      alert('Upload successful!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        modelFile: null,
        thumbnailFile: null
      });
      setPreviewImage(null);
      
      // Refresh list
      fetchModels();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) {
      return;
    }

    try {
      await modelAPI.delete(id);
      alert('Deleted successfully!');
      fetchModels();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Manager
          </h1>
          <p className="text-gray-600">
            Upload and manage 3D models
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'upload'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                 Manual Upload 
                </button>
                <button
                  onClick={() => setActiveTab('ai-generate')}
                  className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'ai-generate'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  AI Generator
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'upload' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-purple-600" />
                    Manual Upload Model
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter model name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description (optional)"
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          File 3D Model (.glb, .gltf, .fbx) *
                        </label>
                        <input
                          type="file"
                          id="modelFile"
                          name="modelFile"
                          accept=".glb,.gltf,.fbx,.obj"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Thumbnail (optional)
                        </label>
                        <input
                          type="file"
                          id="thumbnailFile"
                          name="thumbnailFile"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>
                    </div>

                    {previewImage && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preview Thumbnail
                        </label>
                        <div className="flex gap-4">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-48 h-48 object-cover rounded-xl shadow-lg"
                          />
                          <div className="text-sm text-gray-500">
                            <p>• The image will be displayed in the list.</p>
                            <p>• Recommended size: 512x512px</p>
                            <p>• Format: JPG, PNG, WebP</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Model
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-4">
                  <AIGenerator onSuccess={fetchModels} />
                </div>
              )}
            </div>

            {/* Models List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Model List ({models.length})
                </h2>
                <button
                  onClick={fetchModels}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading data...</p>
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Upload className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <p className="text-gray-500 text-lg">No models yet</p>
                  <p className="text-gray-400 text-sm mt-2">Upload your first model</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Thumbnail
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Name & Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Information
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {models.map((model) => (
                          <tr key={model.modelID} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                  src={model.thumbnailPath ? getAssetUrl(model.thumbnailPath) : 'https://via.placeholder.com/80?text=No+Image'}
                                  alt={model.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                <div className="font-semibold text-gray-800 truncate">
                                  {model.name}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                                  {model.description || 'No description'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                    {model.format?.toUpperCase() || 'N/A'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatFileSize(model.fileSize)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(model.uploadDate).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/product/${model.modelID}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-5 h-5" />
                                </a>
                                <button
                                  onClick={() => handleDelete(model.modelID)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete model"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Statistical
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Total Models</span>
                    <span className="font-bold text-purple-600 text-xl">{models.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <span className="text-gray-700">Uploading</span>
                    <span className="font-bold text-pink-600">
                      {uploading ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Loading</span>
                    <span className="font-bold text-blue-600">
                      {loading ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Upload tips
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Optimize model before upload to reduce file size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Support formats: GLB, GLTF, FBX, OBJ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Maximum file size: 100MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Add thumbnail for easier model identification</span>
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      document.querySelector('input[name="name"]')?.focus();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload new
                  </button>
                  <button
                    onClick={fetchModels}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;