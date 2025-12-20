import React, { useEffect, useRef, useState } from 'react';
import { 
  RotateCw, ZoomIn, ZoomOut, Maximize, Loader, Pause, Play,
  Maximize2, Minimize2, Sun, Moon, Info, Keyboard
} from 'lucide-react';

const Model3DViewer = ({ modelUrl, posterUrl, autoRotate = true }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    if (loading) return;

    const handleKeyPress = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case ' ': // Space - toggle auto-rotate
          e.preventDefault();
          setIsAutoRotating(prev => !prev);
          break;
        case '+':
        case '=': // Zoom in
          handleZoomIn();
          break;
        case '-':
        case '_': // Zoom out
          handleZoomOut();
          break;
        case 'r': // Reset
          resetCamera();
          break;
        case 'f': // Fullscreen
          handleFullscreen();
          break;
        case 'i': // Info
          setShowInfo(prev => !prev);
          break;
        case 'h': // Help
          setShowKeyboardHelp(prev => !prev);
          break;
        case 'arrowup': // Increase brightness
          e.preventDefault();
          increaseBrightness();
          break;
        case 'arrowdown': // Decrease brightness
          e.preventDefault();
          decreaseBrightness();
          break;
        case 'arrowright': // Increase rotation speed
          if (isAutoRotating) {
            e.preventDefault();
            increaseRotationSpeed();
          }
          break;
        case 'arrowleft': // Decrease rotation speed
          if (isAutoRotating) {
            e.preventDefault();
            decreaseRotationSpeed();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading, isAutoRotating]);

  useEffect(() => {
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      script.onload = () => console.log('Model Viewer loaded');
      script.onerror = () => setError('Không thể tải thư viện Model Viewer');
      document.head.appendChild(script);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleProgress = (event) => {
      const progress = event.detail.totalProgress * 100;
      setLoadProgress(Math.round(progress));
    };

    const handleLoad = () => {
      setLoading(false);
      setError(null);
      if (isAutoRotating) {
        enableAutoRotate();
      }
    };

    const handleError = (event) => {
      console.error('Model loading error:', event);
      setError('Không thể tải mô hình 3D. Vui lòng thử lại.');
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

  useEffect(() => {
    if (viewerRef.current && !loading) {
      if (isAutoRotating) {
        enableAutoRotate();
      } else {
        disableAutoRotate();
      }
    }
  }, [isAutoRotating, loading]);

  useEffect(() => {
    if (viewerRef.current && !loading) {
      viewerRef.current.exposure = exposure;
    }
  }, [exposure, loading]);

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
    if (viewer) {
      viewer.removeAttribute('auto-rotate');
    }
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const handleRotate = () => {
    if (viewerRef.current) {
      viewerRef.current.resetTurntableRotation();
      if (isAutoRotating) {
        enableAutoRotate();
      }
    }
  };

  const handleZoomIn = () => {
    if (viewerRef.current) {
      const currentZoom = viewerRef.current.getFieldOfView();
      viewerRef.current.setFieldOfView(Math.max(10, currentZoom - 10));
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      const currentZoom = viewerRef.current.getFieldOfView();
      viewerRef.current.setFieldOfView(Math.min(90, currentZoom + 10));
    }
  };

  const handleFullscreen = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (!document.fullscreenElement) {
      viewer.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const increaseRotationSpeed = () => {
    const newSpeed = Math.min(rotationSpeed + 0.5, 3);
    setRotationSpeed(newSpeed);
    if (isAutoRotating) {
      enableAutoRotate();
    }
  };

  const decreaseRotationSpeed = () => {
    const newSpeed = Math.max(rotationSpeed - 0.5, 0.5);
    setRotationSpeed(newSpeed);
    if (isAutoRotating) {
      enableAutoRotate();
    }
  };

  const increaseBrightness = () => {
    setExposure(prev => Math.min(prev + 0.2, 2));
  };

  const decreaseBrightness = () => {
    setExposure(prev => Math.max(prev - 0.2, 0.2));
  };

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
      <div className="relative w-full h-full bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-2">Lỗi tải mô hình</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-20">
          <Loader className="w-16 h-16 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-700 font-semibold mb-2">Đang tải mô hình 3D...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{loadProgress}%</p>
        </div>
      )}

      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        poster={posterUrl}
        alt="3D Model"
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        loading="eager"
        reveal="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px'
        }}
      />

      {!loading && showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 flex items-center gap-2 z-10">
          <button 
            onClick={toggleAutoRotate}
            className={`p-2 rounded-full transition ${
              isAutoRotating ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-100 text-gray-600'
            }`}
            title={`${isAutoRotating ? "Tạm dừng" : "Tự động quay"} (Space)`}
          >
            {isAutoRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {isAutoRotating && (
            <div className="flex items-center gap-1 border-l border-r border-gray-200 px-2">
              <button 
                onClick={decreaseRotationSpeed}
                disabled={rotationSpeed <= 0.5}
                className="p-1 hover:bg-purple-100 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Giảm tốc độ (←)"
              >
                <span className="text-sm font-bold text-purple-600">−</span>
              </button>
              <span className="text-xs text-gray-700 min-w-[45px] text-center font-medium">
                {rotationSpeed.toFixed(1)}x
              </span>
              <button 
                onClick={increaseRotationSpeed}
                disabled={rotationSpeed >= 3}
                className="p-1 hover:bg-purple-100 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Tăng tốc độ (→)"
              >
                <span className="text-sm font-bold text-purple-600">+</span>
              </button>
            </div>
          )}

          <div className="w-px h-6 bg-gray-300"></div>

          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-purple-100 rounded-full transition"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4 text-purple-600" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-purple-100 rounded-full transition"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4 text-purple-600" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button 
            onClick={decreaseBrightness}
            disabled={exposure <= 0.2}
            className="p-2 hover:bg-purple-100 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Giảm độ sáng (↓)"
          >
            <Moon className="w-4 h-4 text-purple-600" />
          </button>
          <button 
            onClick={increaseBrightness}
            disabled={exposure >= 2}
            className="p-2 hover:bg-purple-100 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Tăng độ sáng (↑)"
          >
            <Sun className="w-4 h-4 text-purple-600" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button 
            onClick={resetCamera}
            className="p-2 hover:bg-purple-100 rounded-full transition"
            title="Reset camera (R)"
          >
            <RotateCw className="w-4 h-4 text-purple-600" />
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-2 hover:bg-purple-100 rounded-full transition"
            title={`${isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} (F)`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-purple-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      )}

      {!loading && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
            title="Keyboard shortcuts (H)"
          >
            <Keyboard className="w-5 h-5 text-purple-600" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
            title="Hướng dẫn (I)"
          >
            <Info className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      )}

      {!loading && showInfo && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 max-w-xs z-10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">Hướng dẫn</h4>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Kéo để xoay mô hình</li>
            <li>• Cuộn chuột để zoom</li>
            <li>• 2 ngón tay để di chuyển</li>
            {isAutoRotating && (
              <li className="text-purple-600 font-medium mt-2">
                ▶ Tự động quay: {rotationSpeed.toFixed(1)}x
              </li>
            )}
            <li className="text-gray-500 text-xs mt-2">
              💡 Độ sáng: {(exposure * 100).toFixed(0)}%
            </li>
          </ul>
        </div>
      )}

      {!loading && showKeyboardHelp && (
        <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl px-4 py-3 max-w-sm z-10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Phím tắt
            </h4>
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Space</kbd>
              <span className="text-gray-600">Tự động quay</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">R</kbd>
              <span className="text-gray-600">Reset</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">F</kbd>
              <span className="text-gray-600">Toàn màn hình</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">I</kbd>
              <span className="text-gray-600">Hướng dẫn</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">+/-</kbd>
              <span className="text-gray-600">Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">↑↓</kbd>
              <span className="text-gray-600">Độ sáng</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">←→</kbd>
              <span className="text-gray-600">Tốc độ quay</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">H</kbd>
              <span className="text-gray-600">Phím tắt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Model3DViewer;