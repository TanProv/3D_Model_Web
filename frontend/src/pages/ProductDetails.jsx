// frontend/src/pages/ProductDetails.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, Share2, Download,
  Sparkles, MessageCircle, Send, X, ShieldCheck, Globe,
  Camera, AlertCircle, Info, Package, Ruler, Calendar, Box, Loader2
} from 'lucide-react';
import Model3DViewer from '../components/Model3DViewer.jsx';
import VirtualTryOn from '../components/VirtualTryOn.jsx';
import { modelAPI, getAssetUrl } from '../services/api.js';

// AI Chat Sidebar Component
const AIChatSidebar = ({ isOpen, onClose, product }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `The ${product.name} is a masterpiece of modern craftsmanship. Its geometric facets reflect light in a way that suggests both timelessness and futuristic vision.`,
        `Given the ${product.format?.toUpperCase()} format, the digital fidelity allows for microscopic inspection. This piece is perfect for high-end visualization.`,
        `With a file size of ${(product.fileSize / 1024 / 1024).toFixed(1)}MB, this asset contains high-resolution textures suitable for close-up rendering.`,
        `Stylistically, I would recommend pairing this with minimalist attire to let the intricate details of the jewelry take center stage.`
      ];
      const botMsg = { 
        role: 'model', 
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      setIsTyping(false);
      setChatHistory(prev => [...prev, botMsg]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end animate-in slide-in-from-right duration-500">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
               <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">Atelier Concierge</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">AI Styling Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {chatHistory.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                 <MessageCircle className="text-amber-300" size={32} />
              </div>
              <p className="text-gray-500 text-sm font-light italic px-8">
                "I am your dedicated digital concierge. How may I assist you with the {product.name} today?"
              </p>
              <div className="space-y-3 px-4">
                {[
                  "Tell me about the craftsmanship",
                  "Suggest styling options",
                  "Explain the 3D details"
                ].map((text, i) => (
                   <button 
                    key={i}
                    onClick={() => setChatInput(text)}
                    className="block w-full text-xs text-left bg-white border border-gray-200 p-3 rounded-xl hover:border-amber-300 hover:text-amber-700 transition-all shadow-sm"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-br-none' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm flex gap-2 items-center">
                 <Loader2 className="animate-spin text-amber-500" size={14} />
                 <span className="text-xs text-gray-400">Consulting...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for advice..."
              className="flex-grow pl-4 pr-12 py-3 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs transition-all"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="absolute right-1 top-1 p-2 bg-gray-900 text-white rounded-full hover:bg-amber-600 transition-all disabled:opacity-50 disabled:bg-gray-300"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVTOActive, setIsVTOActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
    alert(`Added "${model.name}" to cart!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleDownload = () => {
    const modelUrl = getAssetUrl(model.modelPath);
    window.open(modelUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-600" size={32} />
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Retrieving Asset...</p>
        </div>
      </div>
    );
  }

  if (!model) return null;

  const modelUrl = getAssetUrl(model.modelPath);
  const posterUrl = getAssetUrl(model.thumbnailPath);

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: 3D Viewer Area */}
          <div className="space-y-8">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-inner relative group">
              <Model3DViewer 
                modelUrl={modelUrl}
                posterUrl={posterUrl}
                autoRotate={true}
                className="w-full h-full"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-gray-100 shadow-sm">
                 Interactive 3D
              </div>
            </div>
            
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Download, label: 'Asset', action: handleDownload },
                { icon: Camera, label: 'Try-On', action: () => setIsVTOActive(true) },
                { icon: Info, label: 'Specs', action: () => {} },
                { icon: ShieldCheck, label: 'Auth', action: () => {} }
              ].map((btn, i) => (
                <button 
                  key={i}
                  onClick={btn.action}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 hover:text-amber-700 transition-all border border-transparent hover:border-amber-100 group"
                >
                  <btn.icon size={20} className="mb-2 text-gray-400 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-amber-800">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-10 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    Signature Collection
                 </span>
                 <span className="text-[10px] uppercase tracking-widest text-gray-400">ID: {model.modelID}</span>
              </div>
              
              <h1 className="font-serif text-5xl md:text-6xl text-gray-900 leading-tight">
                {model.name}
              </h1>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-gray-900">Digital Asset</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-8 space-y-6">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">The Philosophy</h3>
                <p className="text-gray-600 leading-loose font-light text-sm">
                  {model.description || 'A masterpiece of digital craftsmanship, designed for high-fidelity visualization. This asset represents the pinnacle of virtual jewelry design, offering intricate details visible from every angle.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                  { label: 'Format', value: model.format?.toUpperCase() || 'GLB', icon: Package },
                  { label: 'File Size', value: `${(model.fileSize / 1024 / 1024).toFixed(2)} MB`, icon: Ruler },
                  { label: 'Date', value: new Date(model.uploadDate).toLocaleDateString(), icon: Calendar },
                  { label: 'License', value: 'Commercial', icon: ShieldCheck },
                ].map((spec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <spec.icon size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{spec.label}</p>
                      <p className="font-serif text-lg text-gray-900">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow bg-gray-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={16} /> Acquire Asset
                </button>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-14 h-14 border rounded-full flex items-center justify-center transition-all ${
                    isFavorite 
                      ? 'border-red-200 bg-red-50 text-red-500' 
                      : 'border-gray-200 text-gray-400 hover:border-amber-600 hover:text-amber-600'
                  }`}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>
                <button 
                  onClick={handleShare}
                  className="w-14 h-14 border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:border-amber-600 hover:text-amber-600 transition-all"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <button 
                onClick={() => setChatOpen(true)}
                className="w-full bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-1 rounded-full flex items-center justify-between group hover:border-amber-200 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-600">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">AI Concierge</p>
                    <p className="text-[9px] text-gray-400">Ask for styling advice</p>
                  </div>
                </div>
                <div className="pr-6">
                  <ArrowLeft className="rotate-180 text-gray-300 group-hover:text-amber-600 transition-colors" size={16} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      {isVTOActive && (
        <VirtualTryOn 
          onClose={() => setIsVTOActive(false)}
          ringThumbnail={posterUrl || 'https://via.placeholder.com/200'}
        />
      )}

      {/* AI Chat Sidebar */}
      <AIChatSidebar 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        product={model}
      />
    </div>
  );
};

export default ProductDetails;