import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../services/api.js';

const ProductCard = ({ 
  model, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const thumbnailUrl = getAssetUrl(model.thumbnailPath);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-amber-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        
        {/* Loading / Placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {thumbnailUrl && !imageError ? (
          <img 
            src={thumbnailUrl} 
            alt={model.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1} />
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Preview Unavailable</p>
            </div>
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4">
           <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-900 border border-gray-100">
             {model.format?.toUpperCase() || 'GLB'}
           </span>
        </div>

        {/* Action Buttons (Reveal on Hover) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(model.modelID);
            }}
            className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(model);
            }}
            className="p-3 bg-white text-gray-400 hover:text-amber-600 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-6 bg-gradient-to-t from-black/20 to-transparent">
           <Link 
             to={`/product/${model.modelID}`}
             className="bg-white text-gray-900 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-lg flex items-center gap-2"
           >
             <Eye size={14} /> Quick View
           </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 space-y-3">
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {model.name}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
             ID: {model.modelID} • {(model.fileSize / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        
        {model.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-light">
            {model.description}
          </p>
        )}

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
           <span className="text-xs font-bold text-gray-900">
              In Stock
           </span>
           <span className="text-[10px] text-gray-400 font-mono">
              {new Date(model.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;