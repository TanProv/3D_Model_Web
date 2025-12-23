import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Trash2, Eye, RefreshCw, Sparkles, 
  Plus, Search, Package, Layers, Activity, X,
  Image as ImageIcon, Camera, ScanFace, ImagePlus 
} from 'lucide-react';
import { modelAPI, getAssetUrl } from '../services/api.js';
import AIGenerator from '../components/AIGenerator.jsx';

const Admin = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ref cho input file ẩn 
  const quickUpdateInputRef = useRef(null);
  const [updatingModelId, setUpdatingModelId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelFile: null,
    thumbnailFile: null,
    tryOnImgFile: null
  });

  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [previewTryOn, setPreviewTryOn] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC FORM NHẬP LIỆU (GIỮ NGUYÊN) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'thumbnailFile') setPreviewThumbnail(reader.result);
        else if (name === 'tryOnImgFile') setPreviewTryOn(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.modelFile) {
      alert('Please enter a name and select a 3D model file.');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || '');
      data.append('model', formData.modelFile);
      if (formData.thumbnailFile) data.append('thumbnail', formData.thumbnailFile);
      if (formData.tryOnImgFile) data.append('tryOnImg', formData.tryOnImgFile);

      await modelAPI.upload(data);
      alert('Masterpiece acquired successfully!');
      
      setFormData({ name: '', description: '', modelFile: null, thumbnailFile: null, tryOnImgFile: null });
      setPreviewThumbnail(null);
      setPreviewTryOn(null);
      setActiveTab('inventory');
      fetchModels();
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this asset?')) return;
    try {
      await modelAPI.delete(id);
      fetchModels();
    } catch (error) {
      alert('Delete failed');
    }
  };

  // --- LOGIC MỚI: UPDATE THUMBNAIL NHANH ---
  const triggerQuickUpdate = (modelID) => {
    setUpdatingModelId(modelID);
    if (quickUpdateInputRef.current) {
      quickUpdateInputRef.current.click();
    }
  };

  const handleQuickUpdateFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !updatingModelId) return;

    try {
      // Hiển thị trạng thái loading tạm thời
      const data = new FormData();
      data.append('thumbnail', file); // Backend đã hỗ trợ update thumbnail riêng lẻ qua API update

      await modelAPI.update(updatingModelId, data);
      
      alert('Lifestyle Thumbnail updated!');
      fetchModels(); // Refresh lại danh sách để hiện ảnh mới
    } catch (error) {
      console.error('Quick update failed:', error);
      alert('Failed to update thumbnail.');
    } finally {
      setUpdatingModelId(null);
      e.target.value = ''; // Reset input file
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen bg-white text-gray-900">
      
      {/* Input File Ẩn Dùng Cho Update Nhanh */}
      <input 
        type="file" 
        ref={quickUpdateInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleQuickUpdateFile}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-serif">Atelier <br /><span className="italic font-light text-amber-600">Manager</span></h1>
          <p className="text-gray-500">Manage digital assets and curation.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-6 py-4 rounded-3xl border border-amber-100 flex items-center gap-4">
            <Activity className="text-amber-600" size={24} />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">System Status</p>
              <p className="text-lg font-bold">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Navigation */}
        <div className="lg:col-span-1 space-y-8">
          {/* Menu Cards */}
          <div onClick={() => setActiveTab('inventory')} className={`cursor-pointer rounded-3xl p-8 border transition-all duration-300 group ${activeTab === 'inventory' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-gray-50 border-gray-100 hover:border-amber-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <Package className={`${activeTab === 'inventory' ? 'text-amber-500' : 'text-gray-400'}`} size={32} />
              <div className={`p-2 rounded-full ${activeTab === 'inventory' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                <Search size={20} className={activeTab === 'inventory' ? 'text-white' : 'text-gray-900'} />
              </div>
            </div>
            <div>
              <h4 className="text-xl font-serif font-bold">Gallery Inventory</h4>
              <p className={`text-xs mt-2 ${activeTab === 'inventory' ? 'text-gray-400' : 'text-gray-500'}`}>{models.length} Masterpieces Active</p>
            </div>
          </div>

          <div onClick={() => setActiveTab('upload')} className={`cursor-pointer rounded-3xl p-8 border transition-all duration-300 group ${activeTab === 'upload' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-gray-50 border-gray-100 hover:border-amber-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <Layers className={`${activeTab === 'upload' ? 'text-amber-500' : 'text-gray-400'}`} size={32} />
              <div className={`p-2 rounded-full ${activeTab === 'upload' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                <Plus size={20} className={activeTab === 'upload' ? 'text-white' : 'text-gray-900'} />
              </div>
            </div>
            <div>
              <h4 className="text-xl font-serif font-bold">Mint New Asset</h4>
              <p className={`text-xs mt-2 ${activeTab === 'upload' ? 'text-gray-400' : 'text-gray-500'}`}>Import GLB & Imagery</p>
            </div>
          </div>

          <div onClick={() => setActiveTab('ai-generate')} className={`cursor-pointer rounded-3xl p-8 border transition-all duration-300 group ${activeTab === 'ai-generate' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white border-amber-100 hover:border-amber-300 shadow-lg'}`}>
            <div className="flex justify-between items-start mb-4">
              <Sparkles className="text-amber-600" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-serif font-bold">AI Studio</h4>
              <p className={`text-xs mt-2 ${activeTab === 'ai-generate' ? 'text-gray-400' : 'text-gray-500'}`}>Generate Concepts via Gemini</p>
            </div>
          </div>
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-2">
          
          {/* VIEW: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900">Collection Registry</h4>
                <div className="relative w-full sm:w-64">
                   <input 
                    type="text" 
                    placeholder="Search ID or Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
                {loading ? (
                   <div className="p-12 text-center text-gray-400 italic">Accessing Archives...</div>
                ) : filteredModels.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400 mb-4">No artifacts found.</p>
                    <button onClick={() => setActiveTab('upload')} className="text-amber-600 text-xs font-bold uppercase tracking-widest hover:underline">Mint First Piece</button>
                  </div>
                ) : (
                  filteredModels.map(model => (
                    <div key={model.modelID} className="px-8 py-5 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        
                        {/* THUMBNAIL VỚI CHỨC NĂNG UPDATE */}
                        <div 
                          className="relative w-16 h-16 group/thumb cursor-pointer"
                          onClick={() => triggerQuickUpdate(model.modelID)}
                          title="Click to update Thumbnail"
                        >
                          <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                             <img 
                              src={model.thumbnailPath ? getAssetUrl(model.thumbnailPath) : 'https://via.placeholder.com/150?text=No+Img'} 
                              className="w-full h-full object-cover" 
                              alt={model.name}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                            />
                          </div>
                          {/* Overlay khi Hover */}
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <ImagePlus className="text-white w-6 h-6" strokeWidth={1.5} />
                          </div>
                        </div>

                        <div>
                          <p className="text-base font-serif font-bold text-gray-900">{model.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {model.modelID} • {formatFileSize(model.fileSize)}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="inline-block bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider border border-amber-100">
                              {model.format || 'GLB'}
                            </span>
                            {model.tryOnImgPath && (
                               <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider border border-blue-100">
                                VTO Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                         <a 
                          href={`/product/${model.modelID}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                          title="View Product Page"
                        >
                          <Eye size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(model.modelID)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Decommission Asset"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               {}
               <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif font-bold">New Acquisition</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">Enter details to catalog a new digital heritage piece.</p>
                  </div>
                  <button onClick={() => setActiveTab('inventory')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... Code Form Upload ... */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Artifact Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. The Royal Sapphire Ring" className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Heritage Description</label>
                       <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Philosophy and details..." className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2"><Package size={12}/> 3D Asset (.glb/.gltf) *</label>
                          <div className="relative group">
                            <input type="file" name="modelFile" accept=".glb,.gltf,.fbx,.obj" onChange={handleFileChange} className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer" />
                          </div>
                       </div>
                       <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2"><ImageIcon size={12}/> Lifestyle Thumbnail</label>
                              <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${previewThumbnail ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                <input type="file" name="thumbnailFile" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {previewThumbnail ? <div className="relative h-40 w-full flex items-center justify-center overflow-hidden rounded-xl"><img src={previewThumbnail} alt="Preview" className="h-full object-contain" /></div> : <div className="h-40 flex flex-col items-center justify-center text-gray-400"><ImageIcon size={32} className="mb-2" /><span className="text-[10px] font-bold uppercase tracking-widest">Drop Image</span></div>}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2"><ScanFace size={12}/> Virtual Try-On Image (PNG)</label>
                              <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${previewTryOn ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                <input type="file" name="tryOnImgFile" accept="image/png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {previewTryOn ? <div className="relative h-40 w-full flex items-center justify-center overflow-hidden rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"><img src={previewTryOn} alt="Preview" className="h-full object-contain" /></div> : <div className="h-40 flex flex-col items-center justify-center text-gray-400"><Camera size={32} className="mb-2" /><span className="text-[10px] font-bold uppercase tracking-widest">Drop PNG</span></div>}
                              </div>
                          </div>
                       </div>
                    </div>
                  </div>
                  <button type="submit" disabled={uploading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg mt-8">
                    {uploading ? <><RefreshCw className="animate-spin" size={16} /> Minting...</> : <><Upload size={16} /> Commence Minting</>}
                  </button>
               </form>
            </div>
          )}

          {/* VIEW: AI GENERATOR */}
          {activeTab === 'ai-generate' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold">Concept Generator</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Powered by UwU</p>
                    </div>
                 </div>
                 <AIGenerator onGenerationComplete={fetchModels} />
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;