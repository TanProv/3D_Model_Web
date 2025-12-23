// frontend/src/constants.js

// Mock products for demo/fallback purposes
export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Royal Sapphire Crown Ring',
    price: 4500,
    category: 'ring',
    description: 'An exquisite platinum ring featuring a deep blue 2-carat sapphire surrounded by halo-set brilliant diamonds. A masterpiece of fine jewelry craftsmanship.',
    modelUrl: 'data/models/1766411931047-model.glb',
    thumbnail: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
    material: 'Platinum & Sapphire',
    fileSize: '2.4 MB',
    format: 'glb'
  },
  {
    id: '2',
    name: 'Eternal Gold Band',
    price: 1200,
    category: 'ring',
    description: 'A classic 18k yellow gold wedding band, polished to a mirror finish. Timeless elegance for a lifetime of love and commitment.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf',
    thumbnail: 'https://images.unsplash.com/photo-1544760082-53e54b82774e?auto=format&fit=crop&q=80&w=600',
    material: '18k Yellow Gold',
    fileSize: '1.8 MB',
    format: 'gltf'
  },
  {
    id: '3',
    name: 'Lumina Diamond Drop Necklace',
    price: 8900,
    category: 'necklace',
    description: 'A stunning pendant necklace featuring a pear-shaped GIA-certified diamond hanging from a delicate rose gold chain. Pure brilliance.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
    material: 'Rose Gold & Diamond',
    fileSize: '3.1 MB',
    format: 'glb'
  },
  {
    id: '4',
    name: 'Celestial Tennis Bracelet',
    price: 5400,
    category: 'bracelet',
    description: '45 brilliant cut diamonds meticulously set in white gold, creating a continuous line of fire around the wrist. Spectacular brilliance.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
    material: 'White Gold & Diamonds',
    fileSize: '2.7 MB',
    format: 'glb'
  },
  {
    id: '5',
    name: 'Aurora Pearl Earrings',
    price: 3200,
    category: 'earrings',
    description: 'South Sea pearls paired with diamond accents in white gold settings. A classic combination of elegance and sophistication.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
    material: 'White Gold, Pearls & Diamonds',
    fileSize: '1.9 MB',
    format: 'glb'
  },
  {
    id: '6',
    name: 'Moonstone Solitaire',
    price: 2800,
    category: 'ring',
    description: 'A mesmerizing moonstone centerpiece with a subtle blue sheen, set in sterling silver with intricate filigree details.',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600',
    material: 'Sterling Silver & Moonstone',
    fileSize: '2.2 MB',
    format: 'glb'
  }
];

// MediaPipe Hand Landmarks Connections
// Used for drawing hand skeleton in Virtual Try-On
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17]
];

// Ring finger landmarks for Virtual Try-On
export const RING_FINGER_LANDMARKS = {
  BASE: 13,      // Base of ring finger
  MIDDLE: 14,    // Middle joint
  TOP: 15,       // Top joint
  TIP: 16        // Fingertip
};

// Product categories
export const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'ring', label: 'Rings' },
  { value: 'necklace', label: 'Necklaces' },
  { value: 'bracelet', label: 'Bracelets' },
  { value: 'earrings', label: 'Earrings' }
];

// Supported 3D file formats
export const SUPPORTED_FORMATS = [
  { value: 'all', label: 'All Formats' },
  { value: 'glb', label: 'GLB' },
  { value: 'gltf', label: 'GLTF' },
  { value: 'fbx', label: 'FBX' },
  { value: 'obj', label: 'OBJ' }
];

// AI Generation modes
export const AI_GENERATION_MODES = {
  TEXT: 'text',
  IMAGE_URL: 'image-url',
  IMAGE_FILE: 'image-file'
};

// Status messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  UPLOADING: 'Uploading...',
  GENERATING: 'Generating 3D model...',
  SUCCESS: 'Success!',
  ERROR: 'Error occurred',
  NO_RESULTS: 'No results found'
};

// Camera settings for Virtual Try-On
export const CAMERA_SETTINGS = {
  VIDEO: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user'
  }
};

// MediaPipe Hands settings
export const MEDIAPIPE_SETTINGS = {
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
};

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// File size limits
export const FILE_LIMITS = {
  MODEL_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  IMAGE_MAX_SIZE: 10 * 1024 * 1024,  // 10MB
};

// API endpoints base (can be overridden by env)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// CDN URLs
export const CDN_URLS = {
  MEDIAPIPE_HANDS: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  MEDIAPIPE_CAMERA: 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils'
};

export default {
  MOCK_PRODUCTS,
  HAND_CONNECTIONS,
  RING_FINGER_LANDMARKS,
  CATEGORIES,
  SUPPORTED_FORMATS,
  AI_GENERATION_MODES,
  STATUS_MESSAGES,
  CAMERA_SETTINGS,
  MEDIAPIPE_SETTINGS,
  ANIMATION_DURATION,
  FILE_LIMITS,
  API_BASE_URL,
  CDN_URLS
};