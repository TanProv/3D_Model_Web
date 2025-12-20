import express from "express";
import model3DRoutes from "./model3D.js";
import jewelryRoutes from "./jewelry.js";

const router = express.Router();

router.use("/models", model3DRoutes);
router.use("/jewelry", jewelryRoutes);

export default router;