import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
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
  const modelUrl = getAssetUrl(model.modelPath);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Image/3D Preview */}
      <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        
        {thumbnailUrl && !imageError ? (
          <img 
            src={thumbnailUrl} 
            alt={model.name}
            loading="lazy" // Lazy loading
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-16 h-16 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-500">Xem 3D</p>
            </div>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(model.modelID);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Format Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
          {model.format.toUpperCase()}
        </div>

        {/* File Size Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
          {(model.fileSize / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {model.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {model.description || 'Không có mô tả'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            ID: #{model.modelID}
          </span>
          <span>
            {new Date(model.uploadDate).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/product/${model.modelID}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Xem 3D
          </Link>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(model);
            }}
            className="p-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;