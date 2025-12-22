import express from "express"; 
import dotenv from "dotenv";
import appRouter from "./router/index.js"; 
import { connectToDatabase, sequelize } from "./DB/index.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import compression from "compression";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();  

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    'data/models',
    'data/thumbnails',
    'data/temp'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Compression middleware - Nén response để giảm kích thước
app.use(compression({
  filter: (req, res) => {
    // Skip compression if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Mức nén từ 0-9, 6 là cân bằng giữa tốc độ và tỷ lệ nén
  threshold: 1024 // Only compress responses larger than 1KB
}));

// CORS configuration - Cho phép frontend truy cập
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api", appRouter);

// Serve static files with caching headers
const serveStaticWithCache = (folder, maxAge = 86400000) => {
  return express.static(path.join(__dirname, folder), {
    maxAge: maxAge, // Default: 24 hours
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Cache 3D models for 7 days
      if (filePath.endsWith('.glb') || filePath.endsWith('.gltf') || filePath.endsWith('.fbx')) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      // Cache images for 7 days
      if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }
  });
};

// Static file routes
app.use("/models", serveStaticWithCache("data/models", 604800000)); // 7 days
app.use("/thumbnails", serveStaticWithCache("data/thumbnails", 604800000)); // 7 days
app.use(express.static(path.join(__dirname, "public")));

// Serve HTML file for admin panel
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    features: {
      compression: "enabled",
      cache: "enabled (7 days for 3D models)",
      tripoAI: process.env.TRIPO_API_KEY ? "enabled" : "disabled",
      cors: "enabled"
    },
    endpoints: {
      models: "/api/models",
      jewelry: "/api/jewelry",
      tripoAI: "/api/tripo"
    }
  });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.originalUrl
  });
});


// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: "File too large",
      error: "Maximum file size is 50MB"
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: "Unexpected field in form data",
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🔴 Received shutdown signal, closing server gracefully...');
  
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log("✅ Database connected successfully!");

    // Sync database models
    await sequelize.sync({ alter: true }); 
    console.log("✅ Models synchronized successfully!");

    // Check Tripo AI configuration
    if (process.env.TRIPO_API_KEY) {
      console.log("🤖 Tripo AI: Enabled");
    } else {
      console.warn("⚠️  Tripo AI: Disabled (No API key found)");
    }

    // Start listening
    app.listen(PORT, HOST, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
      console.log('='.repeat(60));
      console.log(`📱 Admin panel:    http://${HOST}:${PORT}/admin`);
      console.log(`🌐 API endpoint:   http://${HOST}:${PORT}/api`);
      console.log(`💚 Health check:   http://${HOST}:${PORT}/api/health`);
      console.log('='.repeat(60));
      console.log('⚙️  Features:');
      console.log(`   ⚡ Compression:  Enabled`);
      console.log(`   💾 Cache:        Enabled (7 days for 3D models)`);
      console.log(`   🔒 CORS:         Enabled`);
      console.log(`   🤖 Tripo AI:     ${process.env.TRIPO_API_KEY ? 'Enabled ✅' : 'Disabled ⚠️'}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (err) {
    console.error("❌ Error occurred while starting the server:", err);
    process.exit(1);
  }
};

startServer();