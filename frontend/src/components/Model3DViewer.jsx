import React, { useEffect, useRef, useState } from 'react';
import { 
  RotateCw, ZoomIn, ZoomOut, Maximize, Loader, Pause, Play,
  Maximize2, Minimize2, Sun, Moon, Info, Keyboard, Move
} from 'lucide-react';

const Model3DViewer = ({ modelUrl, posterUrl, autoRotate = true, className }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false); // Default hidden for cleaner look
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);


  // Keyboard shortcuts
  useEffect(() => {
    if (loading) return;
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch(e.key.toLowerCase()) {
        case ' ': e.preventDefault(); setIsAutoRotating(prev => !prev); break;
        case '+': case '=': handleZoomIn(); break;
        case '-': case '_': handleZoomOut(); break;
        case 'r': resetCamera(); break;
        case 'f': handleFullscreen(); break;
        case 'i': setShowInfo(prev => !prev); break;
        case 'h': setShowKeyboardHelp(prev => !prev); break;
        case 'arrowup': e.preventDefault(); increaseBrightness(); break;
        case 'arrowdown': e.preventDefault(); decreaseBrightness(); break;
        case 'arrowright': if (isAutoRotating) { e.preventDefault(); increaseRotationSpeed(); } break;
        case 'arrowleft': if (isAutoRotating) { e.preventDefault(); decreaseRotationSpeed(); } break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading, isAutoRotating]);

  // Load Script
  useEffect(() => {
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      script.onload = () => console.log('Model Viewer loaded');
      script.onerror = () => setError('Cannot load Model Viewer library');
      document.head.appendChild(script);
    }
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Events
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handleProgress = (event) => setLoadProgress(Math.round(event.detail.totalProgress * 100));
    const handleLoad = () => {
      setLoading(false);
      setError(null);
      if (isAutoRotating) enableAutoRotate();
    };
    const handleError = (event) => {
      console.error('Model loading error:', event);
      setError('Cannot load 3D model. Please try again.');
      setLoading(false);
    };
    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [modelUrl]);

  // Sync Props
  useEffect(() => {
    if (viewerRef.current && !loading) {
      if (isAutoRotating) enableAutoRotate(); else disableAutoRotate();
    }
  }, [isAutoRotating, loading]);

  useEffect(() => {
    if (viewerRef.current && !loading) viewerRef.current.exposure = exposure;
  }, [exposure, loading]);

  // Helpers
  const enableAutoRotate = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.setAttribute('auto-rotate', 'true');
      viewer.setAttribute('auto-rotate-delay', '0');
      viewer.setAttribute('rotation-per-second', `${rotationSpeed * 30}deg`);
    }
  };
  const disableAutoRotate = () => {
    const viewer = viewerRef.current;
    if (viewer) viewer.removeAttribute('auto-rotate');
  };
  const toggleAutoRotate = () => setIsAutoRotating(!isAutoRotating);
  const handleZoomIn = () => viewerRef.current && viewerRef.current.setFieldOfView(Math.max(10, viewerRef.current.getFieldOfView() - 10));
  const handleZoomOut = () => viewerRef.current && viewerRef.current.setFieldOfView(Math.min(90, viewerRef.current.getFieldOfView() + 10));
  const handleFullscreen = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    !document.fullscreenElement ? viewer.requestFullscreen?.() : document.exitFullscreen?.();
  };
  const increaseRotationSpeed = () => {
    setRotationSpeed(prev => { const n = Math.min(prev + 0.5, 3); if(isAutoRotating) enableAutoRotate(); return n; });
  };
  const decreaseRotationSpeed = () => {
    setRotationSpeed(prev => { const n = Math.max(prev - 0.5, 0.5); if(isAutoRotating) enableAutoRotate(); return n; });
  };
  const increaseBrightness = () => setExposure(prev => Math.min(prev + 0.2, 2));
  const decreaseBrightness = () => setExposure(prev => Math.max(prev - 0.2, 0.2));
  const resetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.resetTurntableRotation();
      viewerRef.current.setFieldOfView(45);
      setExposure(1);
      setRotationSpeed(1);
    }
  };
  

  if (error) {
    return (
      <div className={`relative w-full h-full bg-gray-50 flex items-center justify-center rounded-3xl border border-gray-100 ${className}`}>
        <div className="text-center p-8 space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
             ⚠️
          </div>
          <div>
             <p className="text-red-600 font-bold uppercase tracking-widest text-xs">Error Loading Asset</p>
             <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-[10px] font-bold uppercase tracking-widest text-gray-900 underline hover:text-amber-600 transition-colors">Reload Viewer</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden border border-gray-100 group ${className}`}>
      
      {/* Loading State - Atelier Style */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-20">
          <Loader className="w-8 h-8 text-amber-600 animate-spin mb-4" strokeWidth={1.5} />
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Loading Asset</p>
          <div className="w-24 h-0.5 bg-gray-100 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Model Viewer Component */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        poster={posterUrl}
        alt="3D Model"
        camera-controls
        shadow-intensity="1"
        shadow-softness="0.5"
        exposure={exposure}
        environment-image="neutral"
        loading="eager"
        reveal="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        interaction-prompt="none" // Hide default hand animation
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

      {!loading && (
        <>
          {/* Top Right: Helper Actions (Minimalist Buttons) */}
          <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <button 
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)} 
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-all text-gray-400 border border-gray-100"
              title="Shortcuts (H)"
            >
              <Keyboard size={16} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-all text-gray-400 border border-gray-100"
              title="Info (I)"
            >
              <Info size={16} strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleFullscreen} 
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-all text-gray-400 border border-gray-100"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 size={16} strokeWidth={1.5} /> : <Maximize2 size={16} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Bottom Center: Main Control Bar (Atelier Style) */}
          {showControls && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 border border-gray-100 z-10">
              
              {/* Play/Pause */}
              <button onClick={toggleAutoRotate} className="text-gray-400 hover:text-amber-600 transition-colors" title={isAutoRotating ? "Pause Space" : "Rotate Space"}>
                {isAutoRotating ? <Pause size={18} fill="currentColor" strokeWidth={0} /> : <Play size={18} fill="currentColor" strokeWidth={0} />}
              </button>

              <div className="w-px h-4 bg-gray-200" />

              {/* Zoom Controls */}
              <div className="flex gap-4">
                <button onClick={handleZoomOut} className="text-gray-400 hover:text-black transition-colors" title="Zoom Out (-)"><ZoomOut size={18} strokeWidth={1.5} /></button>
                <button onClick={handleZoomIn} className="text-gray-400 hover:text-black transition-colors" title="Zoom In (+)"><ZoomIn size={18} strokeWidth={1.5} /></button>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              {/* Light Controls */}
              <div className="flex gap-4">
                <button onClick={decreaseBrightness} disabled={exposure <= 0.2} className="text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-30" title="Dim"><Moon size={18} strokeWidth={1.5} /></button>
                <button onClick={increaseBrightness} disabled={exposure >= 2} className="text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-30" title="Brighten"><Sun size={18} strokeWidth={1.5} /></button>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              {/* Reset */}
              <button onClick={resetCamera} className="text-gray-400 hover:text-red-500 transition-colors" title="Reset View (R)">
                <RotateCw size={18} strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* Info Modal */}
          {showInfo && (
            <div className="absolute top-20 left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-5 py-4 max-w-xs z-30 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
                     <Info size={12} /> Interactions
                  </h4>
                  <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-black">✕</button>
               </div>
               <ul className="text-xs text-gray-500 space-y-2 font-medium">
                  <li className="flex gap-2"><span>👆</span> Drag to rotate</li>
                  <li className="flex gap-2"><span>🤏</span> Pinch/Scroll to zoom</li>
                  <li className="flex gap-2"><span>✌️</span> Two fingers to pan</li>
                  {isAutoRotating && <li className="text-amber-600">▶ Auto-rotating ({rotationSpeed}x)</li>}
                  <li>💡 Exposure: {(exposure * 100).toFixed(0)}%</li>
               </ul>
            </div>
          )}

          {/* Keyboard Help Modal */}
          {showKeyboardHelp && (
            <div className="absolute top-20 right-6 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-5 w-64 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-30">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
                     <Keyboard size={12} /> Shortcuts
                  </h4>
                  <button onClick={() => setShowKeyboardHelp(false)} className="text-gray-400 hover:text-black">✕</button>
               </div>
               <div className="space-y-3">
                  {[
                     { k: 'Space', v: 'Play / Pause' },
                     { k: '+ / -', v: 'Zoom' },
                     { k: '↑ / ↓', v: 'Brightness' },
                     { k: '← / →', v: 'Speed' },
                     { k: 'R', v: 'Reset View' },
                     { k: 'F', v: 'Fullscreen' },
                  ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">{item.k}</span>
                        <span className="text-gray-400 font-medium">{item.v}</span>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* Interaction Prompt (Atelier Style) */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-1000 z-0">
             <div className="bg-white/80 text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm border border-gray-100 shadow-sm">
                <Move size={12} />
                <span className="text-[9px] uppercase tracking-widest font-bold">Inspect</span>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Model3DViewer;