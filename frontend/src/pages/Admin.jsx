    import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, RefreshCw } from 'lucide-react';
import { modelAPI, getAssetUrl } from '../services/api.js';

const Admin = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      console.error('Error fetching models:', error);
      alert('Không thể tải danh sách models');
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
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));

      // Preview thumbnail
      if (name === 'thumbnailFile') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.modelFile) {
      alert('Vui lòng nhập tên và chọn file 3D model');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('model', formData.modelFile);
      if (formData.thumbnailFile) {
        data.append('thumbnail', formData.thumbnailFile);
      }

      await modelAPI.upload(data);
      
      alert('Upload thành công!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        modelFile: null,
        thumbnailFile: null
      });
      setPreviewImage(null);
      
      // Reset file inputs
      document.getElementById('modelFile').value = '';
      document.getElementById('thumbnailFile').value = '';
      
      // Refresh list
      fetchModels();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa model này?')) {
      return;
    }

    try {
      await modelAPI.delete(id);
      alert('Đã xóa thành công!');
      fetchModels();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Xóa thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Quản Lý Admin
          </h1>
          <p className="text-gray-600">
            Upload và quản lý các mô hình 3D
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-purple-600" />
            Upload Model Mới
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Model *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên model"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả (tùy chọn)"
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
                  accept=".glb,.gltf,.fbx"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail (tùy chọn)
                </label>
                <input
                  type="file"
                  id="thumbnailFile"
                  name="thumbnailFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                />
              </div>
            </div>

            {previewImage && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preview Thumbnail
                </label>
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-48 h-48 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Model
                </>
              )}
            </button>
          </form>
        </div>

        {/* Models List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Danh Sách Models ({models.length})
            </h2>
            <button
              onClick={fetchModels}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Chưa có model nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Thumbnail</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Tên</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Định dạng</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Kích thước</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Ngày tải</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.modelID} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-4">
                        <img 
                          src={getAssetUrl(model.thumbnailPath) || 'https://via.placeholder.com/80'}
                          alt={model.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                          }}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">{model.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{model.description}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                          {model.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {(model.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(model.uploadDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/product/${model.modelID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDelete(model.modelID)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;