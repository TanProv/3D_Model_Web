import express from "express";
import model3DRoutes from "./model3D.js";
import jewelryRoutes from "./jewelry.js";
import tripoRoutes from "./tripo.js";

const router = express.Router();

// Test route để debug
router.get('/', (req, res) => {
  res.json({
    message: 'API is working!',
    availableRoutes: {
      models: '/api/models',
      jewelry: '/api/jewelry',
      tripo: '/api/tripo'
    }
  });
});

// Mount routes
router.use("/models", model3DRoutes);
router.use("/jewelry", jewelryRoutes);
router.use("/tripo", tripoRoutes);

export default router;