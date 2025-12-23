import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Eye, ShoppingBag, Box, Award, Zap, Package, Gem } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Luxury Jewelry" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="text-amber-400" size={14} />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em]">The Atelier Collection 2024</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif leading-none">
              Legacy of <br />
              <span className="italic font-light text-amber-100">Elegance</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-lg leading-relaxed font-light">
              Experience the pinnacle of fine jewelry through our revolutionary 3D visualization and AI-driven atelier. 
              Timeless craftsmanship meets futuristic perfection.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link to="/products" className="bg-white text-gray-900 hover:bg-amber-50 px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-105 shadow-2xl">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link to="/admin" className="bg-transparent hover:bg-white/10 backdrop-blur-md px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 transition-all text-white">
                The AI Atelier
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stat - Minimalist */}
        <div className="absolute bottom-12 right-12 z-10 hidden lg:block bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span className="text-2xl font-serif text-white">100% Real-time</span>
          </div>
          <p className="text-[10px] text-gray-300 uppercase tracking-widest">WebGL Visualization</p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 transition-colors group-hover:bg-amber-100">
                <Box className="text-amber-700" size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Interactive 3D</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Rotate, zoom, and inspect every facet of our pieces with high-fidelity WebGL rendering before acquisition.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 transition-colors group-hover:bg-amber-100">
                <Gem className="text-amber-700" size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Virtual Try-On</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Proprietary hand-tracking technology allows you to virtually wear any ring in real-time using your device camera.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 transition-colors group-hover:bg-amber-100">
                <Award className="text-amber-700" size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Heritage Ethics</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Every diamond is GIA-certified and ethically sourced, backed by a digital blockchain certificate of authenticity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean & High End */}
      <section className="py-20 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: '1000+', label: 'Curated Assets' },
              { value: '50K+', label: 'Acquisitions' },
              { value: '4.9', label: 'Client Rating' },
              { value: '24/7', label: 'Concierge' },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-5xl md:text-6xl font-serif text-gray-900">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - The Digital Atelier */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
             <span className="text-[10px] uppercase font-bold tracking-[0.5em] text-amber-600">Technological Artistry</span>
            <h2 className="font-serif text-5xl md:text-6xl text-gray-900">
              The Digital <span className="italic font-light text-gray-400">Atelier</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: "360° Inspection", desc: "Examine jewelry from every angle with microscopic precision." },
              { icon: Sparkles, title: "AI Generation", desc: "Draft bespoke concepts from text descriptions using Gemini." },
              { icon: ShoppingBag, title: "Seamless Acquisition", desc: "A streamlined purchasing experience for the modern collector." },
              { icon: Zap, title: "Instant Rendering", desc: "Optimized GLB models load instantly on any device." },
              { icon: Package, title: "High Fidelity", desc: "Photorealistic materials reflecting real-world physics." },
              { icon: Award, title: "Certified Authentic", desc: "Digital provenance tracking for every masterpiece." }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-500 bg-white">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 text-gray-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wide">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Teaser - Dark Luxury Theme */}
      <section className="py-32 bg-gray-950 text-white relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-800/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
            <Sparkles className="text-amber-500" size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Powered by Gemini AI</span>
          </div>
          
          <h2 className="font-serif text-5xl md:text-7xl leading-tight">
            Your Personal <br />
            <span className="italic font-light text-amber-500">
              Digital Jeweler
            </span>
          </h2>
          
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto font-light">
            Unsure which piece complements your aesthetic? Our AI-powered concierge drafts bespoke concepts and offers styling advice in real-time.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center pt-8">
            <Link 
              to="/admin" 
              className="bg-amber-600 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-all flex items-center gap-3 shadow-2xl shadow-amber-900/20"
            >
              <Sparkles size={16} />
              Generate Concepts
            </Link>
            <Link 
              to="/products" 
              className="bg-transparent border border-gray-700 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalist */}
      <section className="py-24 bg-amber-50 border-t border-amber-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="font-serif text-4xl md:text-5xl text-amber-950">
            Ready to Acquire <br />
            <span className="italic font-light">Your Masterpiece?</span>
          </h2>
          <p className="text-amber-800/60 text-sm max-w-xl mx-auto">
            Join the select few who have discovered the future of fine jewelry acquisition.
          </p>
          <div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-xl"
            >
              View Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;