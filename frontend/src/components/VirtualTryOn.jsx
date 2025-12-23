// frontend/src/components/VirtualTryOn.jsx

import React, { useRef, useEffect, useState } from 'react';
import { X, RefreshCw, Sparkles, Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { MEDIAPIPE_SETTINGS, CAMERA_SETTINGS } from '../services/constants';

const VirtualTryOn = ({ onClose, ringThumbnail }) => {
  // --- REFS ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const ringImageRef = useRef(null);
  
  const ringScaleRef = useRef(1.0);       // Giá trị zoom thủ công
  const previousSizeRef = useRef(0);      // Để làm mượt chuyển động
  const frameCountRef = useRef(0);

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [ringScale, setRingScale] = useState(1.0); // Hiển thị UI %

  // Đồng bộ State -> Ref
  useEffect(() => {
    ringScaleRef.current = ringScale;
  }, [ringScale]);

  // Preload Image
  useEffect(() => {
    const img = new Image();
    img.src = ringThumbnail;
    img.onload = () => {
      ringImageRef.current = img;
    };
  }, [ringThumbnail]);

  // Hàm làm mượt chuyển động 
  const smoothRingSize = (newSize, previousSize) => {
    const smoothingFactor = 0.6; // 0.6 = Ưu tiên độ mượt, 0.4 = Ưu tiên độ nhạy
    return previousSize * smoothingFactor + newSize * (1 - smoothingFactor);
  };

  // --- MAIN LOGIC ---
  useEffect(() => {
    let active = true;

    const initializeTryOn = async () => {
      setLoading(true);
      setError(null);
      previousSizeRef.current = 0;

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Trình duyệt không hỗ trợ camera.");
        }

        // Xin quyền camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: CAMERA_SETTINGS.VIDEO });
        stream.getTracks().forEach(track => track.stop());

        if (!active) return;

        if (!window.Hands) throw new Error("Thư viện MediaPipe chưa tải xong.");

        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsRef.current = hands;
        hands.setOptions(MEDIAPIPE_SETTINGS);

        // --- XỬ LÝ TỪNG FRAME ---
        hands.onResults((results) => {
          if (!active || !canvasRef.current) return;
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;

          if (loading) setLoading(false);
          frameCountRef.current += 1;
          
          // Vẽ video
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvasRef.current.width, 0);
          ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Xử lý bàn tay
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(prev => !prev ? true : prev);

            const landmarks = results.multiHandLandmarks[0];
            
            // Lấy tọa độ ngón áp út (Ring Finger)
            // 13: Khớp gốc, 14: Khớp giữa
            const base = landmarks[13];
            const middle = landmarks[14];
            
            // 1. Tính vị trí đặt nhẫn 
            const positionBlend = 0.65; 
            const ringX = (base.x * positionBlend + middle.x * (1 - positionBlend)) * canvasRef.current.width;
            const ringY = (base.y * positionBlend + middle.y * (1 - positionBlend)) * canvasRef.current.height;

            // 2. Tính góc xoay theo hướng ngón tay
            const dx = (middle.x - base.x) * canvasRef.current.width;
            const dy = (middle.y - base.y) * canvasRef.current.height;
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            
            // 3. Tính kích thước cơ bản dựa trên độ dài đốt ngón tay (để scale theo khoảng cách camera)
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            
            // BASE SIZE: Mặc định nhẫn sẽ to bằng khoảng 80% độ dài đốt ngón tay này
            // Đây là kích thước chuẩn, chưa nhân với manual scale
            const baseSize = segmentLength * 0.8; 

            // 4. Áp dụng Manual Scale từ người dùng
            const targetSize = baseSize * ringScaleRef.current;
            
            // 5. Làm mượt
            const prevSize = previousSizeRef.current;
            const finalSize = (prevSize === 0 || frameCountRef.current < 10) 
              ? targetSize 
              : smoothRingSize(targetSize, prevSize);
            
            previousSizeRef.current = finalSize;

            // 6. Vẽ nhẫn
            if (ringImageRef.current) {
              ctx.translate(ringX, ringY);
              ctx.rotate(angle);
              
              // Shadow tạo độ sâu
              ctx.shadowBlur = 15;
              ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
              ctx.shadowOffsetY = 5;
              
              // Vẽ ảnh
              // Vẽ ở tọa độ âm 1 nửa kích thước để tâm ảnh trùng với điểm xoay
              ctx.drawImage(
                ringImageRef.current, 
                -finalSize / 2, 
                -finalSize / 2, 
                finalSize, 
                finalSize
              );
            }

          } else {
            setHandDetected(false);
            if (previousSizeRef.current > 0) previousSizeRef.current = 0;
          }
          
          ctx.restore();
        });

        // Start Camera
        if (!window.Camera) throw new Error("Camera utils not loaded.");
        if (videoRef.current) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720,
          });
          cameraRef.current = camera;
          await camera.start();
        }

      } catch (err) {
        console.error("Init Error:", err);
        if (active) {
          setError("Camera cannot be accessed. Please check your access permissions.");
          setLoading(false);
        }
      }
    };

    initializeTryOn();

    return () => {
      active = false;
      if (cameraRef.current) try { cameraRef.current.stop(); } catch (e) {}
      if (handsRef.current) try { handsRef.current.close(); } catch (e) {}
    };
  }, [retryCount, ringThumbnail]);

  // --- MANUAL CONTROLS ---
  const increaseSize = () => setRingScale(prev => Math.min(prev + 0.05, 3.0));
  const decreaseSize = () => setRingScale(prev => Math.max(prev - 0.05, 0.1));
  const resetSize = () => setRingScale(1.0);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-600/20">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" width={1280} height={720} />
        
        {/* Loading */}
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="font-serif italic text-lg">Starting the camera...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
            <AlertCircle className="text-red-500 mb-4" size={40} />
            <p className="mb-6 text-gray-400">{error}</p>
            <div className="flex gap-4">
              <button onClick={() => setRetryCount(p => p + 1)} className="px-6 py-2 bg-purple-600 rounded-full font-bold text-sm hover:bg-purple-700 transition">
                Try again
              </button>
              <button onClick={onClose} className="px-6 py-2 bg-white/10 rounded-full font-bold text-sm hover:bg-white/20 transition">
                Close
              </button>
            </div>
          </div>
        )}

        {/* UI Controls */}
        {!loading && !error && (
          <>
            {/* Top Bar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {handDetected ? 'Hand detected' : 'Please raise your hand.'}
                </span>
              </div>
              <button onClick={onClose} className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition">
                <X size={24} />
              </button>
            </div>

            {/* Compact Size Controls (Right Side) */}
            {handDetected && (
              <div className="absolute top-20 right-6 pointer-events-auto">
                <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/20 p-2 space-y-1 w-[70px]">
                  <p className="text-white text-[9px] uppercase tracking-widest text-center font-bold mb-1 opacity-80">
                    Size
                  </p>
                  
                  <button onClick={increaseSize} className="w-full bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition active:scale-95 flex justify-center">
                    <ZoomIn size={16} />
                  </button>

                  <div className="bg-white/5 px-1 py-1.5 rounded-lg text-center border border-white/5">
                    <span className="text-white text-xs font-bold font-mono">
                      {(ringScale * 100).toFixed(0)}%
                    </span>
                  </div>

                  <button onClick={decreaseSize} className="w-full bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition active:scale-95 flex justify-center">
                    <ZoomOut size={16} />
                  </button>

                  <button onClick={resetSize} className="w-full bg-purple-600/80 hover:bg-purple-600 p-1.5 rounded-lg text-white transition active:scale-95 flex items-center justify-center gap-1 mt-1">
                    <RotateCcw size={12} />
                    <span className="text-[9px] uppercase font-bold">Rs</span>
                  </button>
                </div>
              </div>
            )}

            {/* Instructions (Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pointer-events-none">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center">
                <Sparkles className="mx-auto mb-2 text-purple-400" size={20} />
                <p className="text-white text-xs uppercase tracking-widest">
                  {handDetected ? 'Use the right sidebar to adjust the size' : 'Raise your ring finger to the camera.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOn;