import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, PackageX } from 'lucide-react';
import { modelAPI, getAssetUrl } from '../services/api.js'; // Đảm bảo import getAssetUrl

const Products = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(product => {
    const matchesCategory = filter === 'all' 
      ? true 
      : product.category?.toLowerCase() === filter.toLowerCase();

    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          <p className="font-serif text-amber-800 animate-pulse uppercase tracking-widest text-xs font-bold">Loading Atelier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-serif leading-tight text-gray-900">
            The <br /><span className="italic font-light text-amber-600">Atelier Gallery</span>
          </h1>
          <p className="text-gray-500 max-w-sm font-light">
            Browse our full collection of digitally scanned masterpieces.
            {models.length > 0 && <span className="block mt-2 text-[10px] font-bold uppercase tracking-widest text-amber-600">{models.length} Artifacts Found</span>}
          </p>
        </div>
        
        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-gray-100 rounded-full p-1 flex">
            {['all', 'ring', 'necklace', 'bracelet'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-white text-black shadow-md transform scale-105' 
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {cat === 'all' ? 'All' : `${cat}s`}
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Atelier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all w-64 shadow-sm" 
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredModels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <PackageX className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-400 font-serif italic text-xl">No masterpieces found.</p>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredModels.map(product => {
            // XỬ LÝ ĐƯỜNG DẪN ẢNH TẠI ĐÂY
            // Ưu tiên thumbnailPath từ DB, sử dụng getAssetUrl để nối domain
            const imageUrl = product.thumbnailPath 
              ? getAssetUrl(product.thumbnailPath) 
              : 'https://via.placeholder.com/400x400?text=No+Image';

            return (
              <Link 
                key={product.modelID || product.id}
                to={`/product/${product.modelID || product.id}`} 
                className="group space-y-6 block cursor-pointer"
              >
                {/* Image Container */}
                <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500 border border-gray-100">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Error+Loading'; // Fallback nếu ảnh lỗi
                    }}
                  />
                  
                  {/* Badge Category */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm border border-white text-gray-900">
                    {product.category || 'Artifact'}
                  </div>
                </div>

                {/* Info Container */}
                <div className="flex justify-between items-start px-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                      {product.format?.toUpperCase() || 'GLB ASSET'}
                    </p>
                  </div>
                  {/* Price Display */}
                  {product.price && (
                    <p className="font-bold text-amber-700 font-serif text-lg">
                      ${product.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;