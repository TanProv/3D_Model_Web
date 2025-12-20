import express from "express"; 
import dotenv from "dotenv";
import appRouter from "./router/index.js"; 
import { connectToDatabase, sequelize } from "./DB/index.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();  

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

// Compression middleware - nén response để giảm kích thước
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Mức nén từ 0-9, 6 là cân bằng giữa tốc độ và tỷ lệ nén
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use("/api", appRouter);

// Serve static files với caching headers
const serveStaticWithCache = (folder, maxAge = 86400000) => {
  return express.static(path.join(__dirname, folder), {
    maxAge: maxAge, // 24 hours default
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Cache 3D models for longer (7 days)
      if (filePath.endsWith('.glb') || filePath.endsWith('.gltf') || filePath.endsWith('.fbx')) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      }
      // Cache images for 7 days
      if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    }
  });
};

app.use("/models", serveStaticWithCache("data/models", 604800000)); // 7 days
app.use("/thumbnails", serveStaticWithCache("data/thumbnails", 604800000)); // 7 days
app.use(serveStaticWithCache("public"));

// Serve HTML file for admin panel
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    compression: "enabled",
    cache: "enabled"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    console.log("✅ Database connected successfully!");

    await sequelize.sync({ alter: true }); 
    console.log("✅ Models synchronized successfully!");

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
      console.log(`📱 Admin panel: http://${HOST}:${PORT}/admin`);
      console.log(`🌐 API: http://${HOST}:${PORT}/api`);
      console.log(`⚡ Compression: Enabled`);
      console.log(`💾 Cache: Enabled (7 days for 3D models)`);
    });
  } catch (err) {
    console.error("❌ Error occurred while starting the server:", err);
    process.exit(1);
  }
};

startServer();