import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Download } from 'lucide-react';
import Model3DViewer from '../components/Model3DViewer.jsx';
import { modelAPI, getAssetUrl } from '../services/api.js';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchModelDetails();
  }, [id]);

  const fetchModelDetails = async () => {
    try {
      setLoading(true);
      const response = await modelAPI.getById(id);
      setModel(response.data);
    } catch (error) {
      console.error('Error fetching model details:', error);
      alert('Unable to load product information');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    alert('Added to cart!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: model.name,
        text: model.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return null;
  }

  const modelUrl = getAssetUrl(model.modelPath);
  const posterUrl = getAssetUrl(model.thumbnailPath);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Products</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Viewer */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <Model3DViewer 
              modelUrl={modelUrl}
              posterUrl={posterUrl}
              autoRotate={true}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Format */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {model.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                      {model.format.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {(model.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {model.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-semibold text-gray-800">{model.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-semibold text-gray-800">
                    {(model.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Upload Date:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(model.uploadDate).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-semibold text-gray-800">#{model.modelID}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={handleShare}
                className="p-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-800 mb-2">🎁 Special Offer</h4>
              <p className="text-gray-700 text-sm">
                Free shipping on first order. 30-day return policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;